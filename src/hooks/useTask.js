import { useFetchData, useUpdateData } from './useQuery';
import { useState, useEffect } from 'react';
import taskApis from '@/shared/api/taskApis';

/**
 * Hook to fetch tasks with React Query
 * @param {Object} params - Query parameters including pagination
 * @param {Object} options - React Query options
 * @returns {Object} React Query result object
 */
export function useFetchTasks(params = {}, options = {}) {
  return useFetchData(
    '/listTask',
    ['tasks', params], // Include params in query key for proper caching
    {
      method: 'POST',
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      queryFn: () => taskApis.getTasks(params),
      ...options
    }
  );
}

/**
 * Hook to create a new task
 * @returns {Object} React Query mutation object
 */
export function useCreateTask() {
  return useUpdateData(
    '/createTask',
    ['tasks'],
    'POST',
    (params) => {
      console.log('Creating task with params:', params);
      return taskApis.createTask(params);
    }
  );
}

/**
 * Hook to fetch task details
 * @param {string} taskId - Task ID
 * @param {Object} options - React Query options
 * @returns {Object} React Query result object
 */
export function useTaskDetail(taskId, options = {}) {
  // Handle all types of possible taskId formats and ensure it's a string
  let validId = '';

  if (taskId) {
    if (typeof taskId === 'string') {
      validId = taskId.trim();
    } else if (typeof taskId === 'number') {
      validId = String(taskId);
    } else if (typeof taskId === 'object' && taskId.id) {
      // Handle case where an object with id property is passed
      validId = String(taskId.id);
    } else if (typeof taskId === 'object' && taskId.taskId) {
      // Handle case where an object with taskId property is passed
      validId = String(taskId.taskId);
    }
  }

  // Add console.log for debugging
  console.log('useTaskDetail called with ID:', taskId, 'Valid ID:', validId);

  return useFetchData(
    '/detailTask',
    ['task', validId],
    {
      ...options,
      method: 'POST',
      body: { taskId: validId },
      queryFn: () => {
        if (!validId) {
          console.log('Invalid ID detected in queryFn');
          throw new Error('ID không hợp lệ');
        }
        console.log('Calling API with taskId:', validId);
        return taskApis.detailTaskCleaner({ taskId: validId })
          .then(response => {
            // Only log response status and structure, not the full response
            console.log('API response received:', 
              response ? 
                `Status: ${response.success ? 'Success' : 'Failed'}, Has data: ${!!response.data}` 
                : 'No response'
            );
            
            // Add validation check for response
            if (!response) {
              throw new Error('Empty response from server');
            }
            
            if (response.error) {
              throw new Error(response.error.message || 'Server error occurred');
            }
            
            return response;
          })
          .catch(error => {
            console.error('API error:', error.message || 'Unknown error');
            throw error;
          });
      },
      enabled: !!validId,
      retry: 1,
      onSuccess: (data) => {
        console.log('Query succeeded with data:', data);
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: (error) => {
        console.error('Query failed with error:', error);
        if (options.onError) {
          options.onError(error);
        }
      }
    }
  );
}

/**
 * Hook to update task status for cleaners
 * @returns {Object} React Query mutation object
 */
export function useUpdateTaskCleaner() {
  return useUpdateData(
    '/updateCleanerStatus',
    ['tasks'],
    'POST',
    (params) => taskApis.updateTaskCleaner(params)
  );
}

/**
 * Hook to update task
 * @returns {Object} React Query mutation object
 */
export function useUpdateTask() {
  return useUpdateData(
    '/updateTask',
    ['tasks'],
    'POST',
    (params) => {
      console.log('Updating task with params:', params);
      return taskApis.updateTask(params);
    }
  );
}

/**
 * Hook to delete task
 * @returns {Object} React Query mutation object
 */
export function useDeleteTask() {
  return useUpdateData(
    '/deleteTask',
    ['tasks'],
    'POST',
    (taskId) => {
      console.log('Deleting task with ID:', taskId);
      return taskApis.deleteTask(taskId);
    }
  );
}

/**
 * Hook to upload task images
 * @returns {Object} React Query mutation object
 */
export function useUploadTaskImage() {
  return useUpdateData(
    '/uploadCleaningImages',
    ['taskImages'],
    'POST',
    (formData) => taskApis.uploadImage(formData)
  );
}

/**
 * Hook to fetch maintenance tasks
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 * @returns {Object} React Query result object
 */
export function useFetchMaintenanceTasks(params, options = {}) {
  // Stringify the params to ensure they are stable for the query key
  const stableQueryKey = ['maintenanceTasks', JSON.stringify(params)];

  return useFetchData(
    '/listMaintenanceTasks',
    stableQueryKey,
    {
      ...options,
      method: 'POST',
      body: params,
      cacheTime: 1000 * 60 * 30, // 30 minutes
      staleTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('Error fetching maintenance tasks:', error);
      },
      queryFn: () => taskApis.listMaintenanceTasks(params)
    }
  );
}

/**
 * Hook to get today's tasks with manual state management
 * @returns {Object} Task state and loading state
 */
export function useGetTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingListTask, setFetchingListTask] = useState(false);

  useEffect(() => {
    let ignore = false;
    const getListTask = async () => {
      try {
        setIsLoading(true);
        const params = {
          // Use current date to get today's tasks
          'date': new Date().toISOString()
        };
        console.log('Fetching tasks with params:', params);
        const res = await taskApis.getTasks(params);

        if (ignore) return;

        if (!res || !res.success) {
          console.error('Error fetching tasks:', res);
          setIsLoading(false);
          return;
        }

        console.log('Tasks fetched successfully:', res.data?.length || 0, 'tasks');
        setTasks(Array.isArray(res.data) ? res.data : []);
        setIsLoading(false);
      } catch (err) {
        if (ignore) return;

        console.error('Exception in getListTask:', err);
        setIsLoading(false);
      }
    };

    if (!ignore) {
      getListTask();
    }

    return () => {
      ignore = true;
    };
  }, [fetchingListTask]);

  return {
    tasks,
    isLoading,
    setFetchingListTask
  };
}