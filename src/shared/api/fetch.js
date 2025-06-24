import NavigationService from '@/navigation/NavigationService';
import { handleSessionExpiration, notifySessionExpired } from '@/services/sessionService';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Debug logs for API requests - use for troubleshooting
const DEBUG_API = true;

// Set to false to use real API instead of mock data
const USE_MOCK_API = false;

// Ensure GATEWAY_URL doesn't end with a slash
const GATEWAY_URL = API_URL || 'https://api.swapbnb.io/moon';

console.log('GATEWAY_URL:', GATEWAY_URL);
console.log('Using mock API:', USE_MOCK_API ? 'Yes' : 'No');

// Define mock APIs for development/testing
const mockApis = {};

// Mock data for tasks
const generateMockTasks = () => {
  const mockTasks = [];
  const today = new Date();
  
  // Generate tasks for current month and next month
  for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
    const month = today.getMonth() + monthOffset;
    const year = today.getFullYear() + (month > 11 ? 1 : 0);
    const normalizedMonth = month % 12;
    
    const daysInMonth = new Date(year, normalizedMonth + 1, 0).getDate();
    
    // Create tasks for every 3rd day
    for (let i = 1; i <= daysInMonth; i++) {
      if (i % 3 === 0) {
        const taskDate = new Date(year, normalizedMonth, i);
        
        // Create 1-3 tasks per date to show multiple properties on the same day
        const tasksPerDay = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 1; j <= tasksPerDay; j++) {
          const taskId = `task-${monthOffset}-${i}-${j}`;
          const propertyId = `property-${monthOffset}-${i}-${j}`;
          const propertyNumber = (i * 100) + j;
          const streetNumber = 1000 + propertyNumber;
          
          mockTasks.push({
            _id: taskId,
            status: 'COMPLETED',
            checkInDate: new Date(taskDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
            checkOutDate: taskDate.toISOString(),
            propertyId: {
              _id: propertyId,
              name: `Property ${propertyNumber}`,
              address: {
                display: `${streetNumber} Main St, City, State`,
                street: `${streetNumber} Main St`,
                city: 'City',
                state: 'State',
                postcode: '12345'
              }
            },
            reservationId: `res-${100000 + propertyNumber}`,
            reservationDetails: {
              checkIn: new Date(taskDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
              checkOut: taskDate.toISOString(),
              guest: {
                name: `Guest ${propertyNumber}`,
                email: `guest${propertyNumber}@example.com`
              },
              numberOfGuests: Math.floor(Math.random() * 4) + 1
            }
          });
        }
      }
    }
  }
  
  console.log(`Generated ${mockTasks.length} mock tasks`);
  return mockTasks;
};

// Cache mock tasks to ensure consistency
const MOCK_TASKS = generateMockTasks();

// Mock implementation for listAcceptedCleaningTasks
mockApis['/listAcceptedCleaningTasks'] = async (params) => {
  console.log('Using mock implementation for /listAcceptedCleaningTasks', params);
  
  // If a month parameter is specified, filter tasks for that month
  if (params?.body?.month) {
    const [year, month] = params.body.month.split('-').map(Number);
    
    const filteredTasks = MOCK_TASKS.filter(task => {
      const taskDate = new Date(task.checkOutDate || task.reservationDetails?.checkOut);
      return taskDate.getFullYear() === year && taskDate.getMonth() === month - 1;
    });
    
    console.log(`Mock API: Filtered ${filteredTasks.length} tasks for month ${params.body.month}`);
    
    // Log the first few tasks for debugging
    if (filteredTasks.length > 0) {
      console.log('Sample tasks:');
      filteredTasks.slice(0, 3).forEach(task => {
        const taskDate = new Date(task.checkOutDate);
        console.log(`Task ${task._id}, Date: ${taskDate.toDateString()}, Property: ${task.propertyId.name}`);
      });
    }
    
    return { data: filteredTasks };
  }
  
  // If a specific date is provided, filter tasks for that date
  if (params?.body?.date) {
    const dateStr = params.body.date; // Format: YYYY-MM-DD
    const [year, month, day] = dateStr.split('-').map(Number);
    const requestDate = new Date(year, month - 1, day);
    requestDate.setHours(0, 0, 0, 0);
    
    const filteredTasks = MOCK_TASKS.filter(task => {
      const taskDate = new Date(task.checkOutDate || task.reservationDetails?.checkOut);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.toDateString() === requestDate.toDateString();
    });
    
    console.log(`Mock API: Filtered ${filteredTasks.length} tasks for date ${dateStr} (${requestDate.toDateString()})`);
    
    // Log all tasks for this date
    if (filteredTasks.length > 0) {
      console.log('Tasks for this date:');
      filteredTasks.forEach(task => {
        console.log(`Task ${task._id}, Property: ${task.propertyId.name}`);
      });
    }
    
    return { data: filteredTasks };
  }
  
  // Return all tasks if no filters
  return { data: MOCK_TASKS };
};

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

  // Check for mock implementation
  const endpoint = url.replace(`${GATEWAY_URL}/api`, '');
  if (USE_MOCK_API && mockApis[endpoint]) {
    console.log(`Using mock implementation for ${endpoint}`);
    try {
      return await mockApis[endpoint](params);
    } catch (error) {
      console.error('Mock API error:', error);
      throw error;
    }
  }

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
      
      console.log('Authentication error, handling session expiration');

      // Log info for debugging
      if (DEBUG_API) {
        console.log('Status code:', response.status);
        console.log('Error message:', errorMessage);
      }

      // Notify Redux that the session has expired
      notifySessionExpired();
      
      // Handle session expiration (navigation, etc.)
      await handleSessionExpiration();

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
      
      console.log('Authentication error in catch block, handling session expiration');
      
      // Notify Redux that the session has expired
      notifySessionExpired();
      
      // Handle session expiration (navigation, etc.)
      await handleSessionExpiration();
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', errorText);
      throw new Error(errorText || `Upload failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};


