import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { navigationRef } from '../../navigation/NavigationService';

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

    // Check specifically for token expiration
    if (response.status === 401 && (data?.message === 'Token expired.' || data?.message?.includes('expired'))) {
      console.log('Token expired, clearing session and redirecting to login');
      // Clear token
      await AsyncStorage.removeItem('accessToken');
      // Navigate to login screen
      navigationRef.current?.navigate('Login');
      throw new Error('Session has expired. Please login again.');
    }

    // Check header status
    if (response.status === 401) {
      throw new Error('Session has expired. Please login again.');
    }

    if (!response.ok) {
      // Enhanced error reporting
      const errorMessage = data?.message || data?.error?.message || 'Request failed';
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

    // Check specifically for token expiration
    if (response.status === 401 && (data?.message === 'Token expired.' || data?.message?.includes('expired'))) {
      console.log('Token expired during upload, clearing session and redirecting to login');
      await AsyncStorage.removeItem('accessToken');
      navigationRef.current?.navigate('Login');
      throw new Error('Session has expired. Please login again.');
    }

    // Check status
    if (!response.ok) {
      const errorMessage = data?.message || data?.error?.message || 'Upload failed';
      console.error('Upload API Error:', {
        status: response.status,
        statusText: response.statusText,
        endpoint: url,
        message: errorMessage
      });
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};


