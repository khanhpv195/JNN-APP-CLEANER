import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import NavigationService from '@/navigation/NavigationService';
import { store } from '@/redux/store';
import { handleSessionExpired } from '@/redux/slices/authSlice';

// Ensure GATEWAY_URL doesn't end with a slash
const GATEWAY_URL = API_URL;

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
      errorMessage.includes('Token expired.') ||
      errorMessage.includes('expired') ||
      errorMessage.includes('access denied')) {
      console.log('Authentication error, clearing session and redirecting to login');
      // Dispatch action to update Redux state
      store.dispatch(handleSessionExpired());
      // Use reset instead of navigate to prevent back navigation
      NavigationService.reset('Login');
      throw new Error('Session has expired. Please login again.');
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
      errorMsg.includes('access denied')) {
      console.log('Authentication error in catch block, redirecting to login');
      // Dispatch action to update Redux state
      store.dispatch(handleSessionExpired());
      NavigationService.reset('Login');
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
export const UPLOAD = async (endpoint, formData, headers) => {
  const url = generateApiUrl({ endpoint });
  const tokenString = await AsyncStorage.getItem('accessToken');

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

  return response.json();
};


