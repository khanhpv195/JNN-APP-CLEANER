import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Default stale time of 5 minutes
            staleTime: 5 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Cache data for 1 hour
            cacheTime: 60 * 60 * 1000,
            // Refetch on window focus
            refetchOnWindowFocus: true,
            // Don't refetch on component mount if data is fresh
            refetchOnMount: false,
        },
    },
}); 