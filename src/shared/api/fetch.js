import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import NavigationService from '@/navigation/NavigationService';
import { store } from '@/redux/store';
import { handleSessionExpired as sessionExpiredAction } from '@/redux/slices/authSlice';

// Flag to prevent multiple session expiration handlers from running simultaneously
let isHandlingSessionExpiration = false;

// Debug logs for API requests - use for troubleshooting
const DEBUG_API = true;

// Ensure GATEWAY_URL doesn't end with a slash
const GATEWAY_URL = API_URL || 'https://api.swapbnb.io/moon';

console.log('GATEWAY_URL:', GATEWAY_URL);

// Generate api url
const generateApiUrl = ({ endpoint }) => {
  // Check if endpoint is defined before using startsWith
  if (!endpoint) {
    console.error('Undefined endpoint passed to generateApiUrl');
    throw new Error('Endpoint is required for API calls');
  }

  // Ensure endpoint always starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${GATEWAY_URL}/api${normalizedEndpoint}`;
  console.log('Generated API URL:', url);
  return url;
};

// Base request function
const makeRequest = async (method, url, params = {}) => {
  const { customHeaders, ...otherParams } = params;

  // Get access token from AsyncStorage
  const tokenString = await AsyncStorage.getItem('accessToken');

  // Debug request info
  if (DEBUG_API) {
    console.log(`API Request [${method}]:`, url);
    console.log('Token available:', tokenString ? 'Yes' : 'No');
    console.log('Current screen:', NavigationService.getCurrentRoute());
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(tokenString && { 'user-access-token': tokenString }),
    ...customHeaders
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      mode: 'cors',
      ...otherParams,
    });

    // Safely parse JSON and handle non-JSON responses
    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('Non-JSON response received:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
        data = { success: false, message: 'Invalid response format', raw: text.substring(0, 200) };
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Failed to parse server response');
    }

    // Get possible error message
    const errorMessage = data?.message || data?.error?.message || '';

    // Check specifically for token expiration or access denied errors
    if (response.status === 401 ||
      (response.status === 403 && (
        errorMessage.includes('Token expired.') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('auth') ||
        errorMessage.includes('token')
      ))) {
      // Only handle session expiration once to prevent loops
      if (isHandlingSessionExpiration) {
        console.log('Already handling session expiration, skipping...');
        throw new Error('Session has expired. Please login again.');
      }

      isHandlingSessionExpiration = true;
      console.log('Authentication error, clearing session and redirecting to login');

      // Log info for debugging
      if (DEBUG_API) {
        console.log('Status code:', response.status);
        console.log('Error message:', errorMessage);
        console.log('Redux auth state:', store.getState().auth);
      }

      // First dispatch action to update Redux state
      store.dispatch(sessionExpiredAction());

      // Don't navigate if we're already on the Login screen
      const currentRouteName = NavigationService.getCurrentRoute();
      console.log('Current route before session expired navigation:', currentRouteName);

      if (currentRouteName !== 'Login') {
        // Then navigate to login screen with a delay to ensure redux state is updated first
        setTimeout(() => {
          NavigationService.navigate('Login', { sessionExpired: true });
          // Reset the flag after navigation is complete 
          setTimeout(() => {
            isHandlingSessionExpiration = false;
            console.log('Session expiration handler completed, flag reset');
          }, 1000);
        }, 100);
      } else {
        // Reset the flag since we're not navigating
        setTimeout(() => {
          isHandlingSessionExpiration = false;
          console.log('Already on login screen, session expiration handler completed');
        }, 1000);
      }

      throw new Error('Session has expired. Please login again.');
    }

    // Xử lý riêng trường hợp 403 Forbidden không liên quan đến token
    if (response.status === 403) {
      // Not a token issue but a permissions issue
      console.log('Permission denied error (403):', errorMessage);
      throw new Error(errorMessage || 'You do not have permission to access this resource');
    }

    if (!response.ok) {
      // Enhanced error reporting
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        endpoint: url,
        message: errorMessage
      });
      throw new Error(errorMessage);
    }

    return {
      ...data,
      headers: response.headers
    };
  } catch (error) {
    console.error('Request failed:', error);

    // Check if error message contains session expired or similar auth errors
    const errorMsg = error.message || '';
    if (errorMsg.includes('Session has expired') ||
      errorMsg.includes('Please login again') ||
      errorMsg.includes('token') ||
      errorMsg.includes('authentication')) {
      // Only handle session expiration once to prevent loops
      if (isHandlingSessionExpiration) {
        console.log('Already handling session expiration in catch block, skipping...');
        return;
      }

      isHandlingSessionExpiration = true;
      console.log('Authentication error in catch block, redirecting to login');

      // Dispatch action to update Redux state
      store.dispatch(sessionExpiredAction());

      // Don't navigate if we're already on the Login screen
      const currentRouteName = NavigationService.getCurrentRoute();
      if (currentRouteName !== 'Login') {
        // Navigate to login screen with a delay
        setTimeout(() => {
          NavigationService.navigate('Login', { sessionExpired: true });
          // Reset the flag after navigation is complete
          setTimeout(() => {
            isHandlingSessionExpiration = false;
          }, 1000);
        }, 100);
      } else {
        // Reset the flag since we're not navigating
        setTimeout(() => {
          isHandlingSessionExpiration = false;
        }, 1000);
      }
    }

    throw error;
  }
};

// HTTP Methods
export const GET = async (endpoint, params = {}) => {
  const url = generateApiUrl({ endpoint });
  return makeRequest('GET', url, params);
};

export const POST = async (endpoint, params = {}) => {
  const url = generateApiUrl({ endpoint });
  const { body, ...otherParams } = params;

  return makeRequest('POST', url, {
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...otherParams,
  });
};

export const PUT = async (endpoint, params = {}) => {
  const url = generateApiUrl({ endpoint });
  const { body, ...otherParams } = params;

  return makeRequest('PUT', url, {
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...otherParams,
  });
};

export const DELETE = async (endpoint, params = {}) => {
  const url = generateApiUrl({ endpoint });
  const { body, ...otherParams } = params;

  return makeRequest('DELETE', url, {
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...otherParams,
  });
};

// Specialized function for file uploads
export const UPLOAD = async (endpoint, formData) => {
  const url = generateApiUrl({ endpoint });
  const tokenString = await AsyncStorage.getItem('accessToken');

  try {
    console.log('Uploading to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(tokenString && { 'user-access-token': tokenString })
      },
      credentials: 'include',
      mode: 'cors',
      body: formData
    });

    // Safely parse JSON and handle non-JSON responses for upload
    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('Upload: Non-JSON response received:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
        data = { success: false, message: 'Invalid upload response format', raw: text.substring(0, 200) };
      }
    } catch (parseError) {
      console.error('Error parsing upload response:', parseError);
      throw new Error('Failed to parse upload response');
    }

    // Get possible error message from upload
    const errorMessage = data?.message || data?.error?.message || '';

    // Check specifically for token expiration or access denied errors in upload
    if (response.status === 401 ||
      (response.status === 403 && (
        errorMessage.includes('Token expired.') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('auth') ||
        errorMessage.includes('token')
      ))) {
      // Only handle session expiration once to prevent loops
      if (isHandlingSessionExpiration) {
        console.log('Already handling session expiration in upload, skipping...');
        throw new Error('Session has expired. Please login again.');
      }

      isHandlingSessionExpiration = true;
      console.log('Authentication error during upload, clearing session and redirecting to login');

      // Dispatch action to update Redux state
      store.dispatch(sessionExpiredAction());

      // Don't navigate if we're already on the Login screen
      const currentRouteName = NavigationService.getCurrentRoute();
      if (currentRouteName !== 'Login') {
        // Navigate to login screen with a delay
        setTimeout(() => {
          NavigationService.navigate('Login', { sessionExpired: true });
          // Reset the flag after navigation is complete
          setTimeout(() => {
            isHandlingSessionExpiration = false;
          }, 1000);
        }, 100);
      } else {
        // Reset the flag since we're not navigating
        setTimeout(() => {
          isHandlingSessionExpiration = false;
        }, 1000);
      }

      throw new Error('Session has expired. Please login again.');
    }

    // Xử lý riêng trường hợp 403 Forbidden không liên quan đến token
    if (response.status === 403) {
      // Not a token issue but a permissions issue
      console.log('Permission denied error (403) in upload:', errorMessage);
      throw new Error(errorMessage || 'You do not have permission to access this resource');
    }

    // Check status
    if (!response.ok) {
      console.error('Upload API Error:', {
        status: response.status,
        statusText: response.statusText,
        endpoint: url,
        message: errorMessage || 'Upload failed'
      });
      throw new Error(errorMessage || 'Upload failed');
    }

    return data;
  } catch (error) {
    console.error('Upload Error:', error);

    // Check if error message contains session expired or similar auth errors
    const errorMsg = error.message || '';
    if (errorMsg.includes('Session has expired') ||
      errorMsg.includes('Please login again') ||
      errorMsg.includes('token') ||
      errorMsg.includes('authentication')) {
      // Only handle session expiration once to prevent loops
      if (isHandlingSessionExpiration) {
        console.log('Already handling session expiration in upload catch block, skipping...');
        return;
      }

      isHandlingSessionExpiration = true;
      console.log('Authentication error in upload catch block, redirecting to login');

      // Dispatch action to update Redux state
      store.dispatch(sessionExpiredAction());

      // Don't navigate if we're already on the Login screen
      const currentRouteName = NavigationService.getCurrentRoute();
      if (currentRouteName !== 'Login') {
        // Navigate to login screen with a delay
        setTimeout(() => {
          NavigationService.navigate('Login', { sessionExpired: true });
          // Reset the flag after navigation is complete
          setTimeout(() => {
            isHandlingSessionExpiration = false;
          }, 1000);
        }, 100);
      } else {
        // Reset the flag since we're not navigating
        setTimeout(() => {
          isHandlingSessionExpiration = false;
        }, 1000);
      }
    }

    throw error;
  }
};


