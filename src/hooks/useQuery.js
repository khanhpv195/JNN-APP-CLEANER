import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

// Base API configuration
const GATEWAY_URL = API_URL || 'https://api.swapbnb.io/moon';

// Generate api url
const generateApiUrl = ({ endpoint }) => {
    // Ensure endpoint always starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${GATEWAY_URL}/api${normalizedEndpoint}`;
    console.log('Generated API URL:', url);
    return url;
};

// Helper function for fetch requests
const fetchApi = async (endpoint, options = {}) => {
    const url = generateApiUrl({ endpoint });

    // Default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add user-access-token to requests
    try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            headers['user-access-token'] = token;
        }
    } catch (error) {
        console.error('Error getting access token:', error);
    }

    const config = {
        ...options,
        headers,
    };

    // Handle body for methods that support it
    if (['POST', 'PUT', 'PATCH'].includes(options.method?.toUpperCase()) && options.body) {
        // If body is already a string, use it as is
        if (typeof options.body === 'string') {
            config.body = options.body;
        }
        // If body is FormData, don't stringify and remove Content-Type
        else if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
            config.body = options.body;
        }
        // Otherwise stringify the body
        else {
            config.body = JSON.stringify(options.body);
        }
    }

    try {
        const response = await fetch(url, config);

        // Check if the request was successful
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        // Parse JSON response
        return response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

// Example hook for fetching data - Updated for React Query v5
export function useFetchData(endpoint, queryKey, options = {}) {
    const { enabled = true, queryFn, ...restOptions } = options;

    return useQuery({
        queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
        queryFn: queryFn || (async () => {
            const fetchOptions = {
                method: options.method || 'GET',
                headers: options.headers || {},
            };

            if (options.body) {
                fetchOptions.body = options.body;
            }

            return fetchApi(endpoint, fetchOptions);
        }),
        enabled,
        ...restOptions,
    });
}

// Example hook for mutations (POST, PUT, DELETE) - Updated for React Query v5
export function useUpdateData(endpoint, queryKey, method = 'POST', mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: mutationFn || (async (data) => {
            const options = {
                method: method.toUpperCase(),
                headers: {},
            };

            // Add body for methods that support it
            if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data) {
                options.body = data;
            }

            return fetchApi(endpoint, options);
        }),
        onSuccess: (data) => {
            // Invalidate and refetch the related queries
            queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
        },
        onError: (error) => {
            console.error(`Mutation error (${endpoint}):`, error);
        },
    });
} 