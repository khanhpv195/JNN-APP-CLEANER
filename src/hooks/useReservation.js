import { useState, useEffect, useCallback } from 'react';
import TaskApis from '../shared/api/taskApis';
import { POST } from '../shared/api/fetch';
import format from 'date-fns/format';
import { Alert } from 'react-native';
import { STATUS } from '../constants/status';

/**
 * Custom hook for managing cleaning tasks
 * Handles fetching, updating, and managing cleaning task data
 */
export const useReservation = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState(null);
    const [cleaningTasks, setCleaningTasks] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    // Task cache to store tasks by date to prevent data loss when switching dates
    const [taskCache, setTaskCache] = useState(new Map());

    /**
     * Fetch all cleaning tasks for a specific date
     * @param {Date} date - Selected date to fetch tasks for
     * @param {String} status - Optional status filter (PENDING, IN_PROGRESS, COMPLETED)
     */
    const fetchCleaningTasks = useCallback(async (date = new Date(), status = null) => {
        try {
            setLoading(true);
            setError(null);

            // Format the date for API (YYYY-MM-DD)
            const localDate = new Date(date);
            const formattedDate = format(localDate, 'yyyy-MM-dd');

            // Build request body
            const requestBody = {
                date: date ? formattedDate : null,
            };

            // Add status filter if provided
            if (status) {
                requestBody.status = status;
                console.log(`Filtering tasks by status: ${status}`);
            }

            // Debug request body
            console.log('Request body:', JSON.stringify(requestBody));

            const response = await POST('/listPendingCleaningTasks', {
                body: requestBody,
            }).catch(error => {
                // Check if the error is a permission error
                if (error.message && error.message.includes('access denied')) {
                    // Handle permission error without affecting login state
                    setError('You do not have permission to access cleaning tasks');
                    // Keep the tasks list empty but don't throw further
                    setCleaningTasks([]);
                    console.log('Permission error handled in useReservation hook:', error.message);
                    // Return empty data to prevent further error handling
                    return { data: [] };
                }
                // Re-throw other errors to be caught by the outer catch
                throw error;
            });


            if (response && response.data) {
                setCleaningTasks(response.data);
                return response.data;
            }
            return response
        } catch (err) {
            console.error('Error fetching cleaning tasks:', err);
            setError(err.message || 'Failed to load cleaning tasks');

            // Show error alert for non-permission errors
            if (!err.message.includes('access denied')) {
                Alert.alert(
                    'Error Loading Tasks',
                    err.message || 'An error occurred while loading tasks',
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setLoading(false);
        }
    }, []);


    //  fetch all cleaning tasks, != pending
    const fetchCleaningTasksNotPending = useCallback(async (date = new Date()) => {
        try {
            setLoading(true);
            setError(null);

            // Format the date for API (YYYY-MM-DD)
            const localDate = new Date(date);
            const formattedDate = format(localDate, 'yyyy-MM-dd');

            // Check cache first
            const cacheKey = formattedDate;
            if (taskCache.has(cacheKey)) {
                console.log(`Using cached tasks for date: ${formattedDate}`);
                const cachedTasks = taskCache.get(cacheKey);
                
                // Important: Always update the cleaningTasks state with cached data
                // This ensures the UI always shows the tasks even when toggling views
                setCleaningTasks(prevTasks => {
                    // Merge with existing tasks to ensure we don't lose any
                    const taskIds = new Set(prevTasks.map(task => task._id));
                    const newTasks = [...prevTasks];
                    
                    for (const task of cachedTasks) {
                        if (!taskIds.has(task._id)) {
                            newTasks.push(task);
                        }
                    }
                    
                    return newTasks;
                });
                
                setLoading(false);
                return cachedTasks;
            }

            console.log(`Fetching tasks from API for date: ${formattedDate}`);
            const response = await POST('/listAcceptedCleaningTasks', {
                body: {
                    date: formattedDate
                }
            });

            if (response && response.data) {
                // Update cache with new data
                setTaskCache(prevCache => {
                    const newCache = new Map(prevCache);
                    newCache.set(cacheKey, response.data);
                    return newCache;
                });

                // Update cleaningTasks state, preserving existing tasks
                setCleaningTasks(prevTasks => {
                    // Merge with existing tasks to ensure we don't lose any
                    const taskIds = new Set(prevTasks.map(task => task._id));
                    const newTasks = [...prevTasks];
                    
                    for (const task of response.data) {
                        if (!taskIds.has(task._id)) {
                            newTasks.push(task);
                        }
                    }
                    
                    return newTasks;
                });
                
                return response.data;
            }
            return response;
        } catch (err) {
            console.error('Error fetching cleaning tasks:', err);
            setError(err.message || 'Failed to load cleaning tasks');
        } finally {
            setLoading(false);
        }
    }, [taskCache]);

    /**
     * Get details of a specific cleaning task
     * @param {string} taskId - ID of the task to fetch details for
     */
    const getTaskDetails = async (taskId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await TaskApis.detailTaskCleaner({
                taskId
            });


            if (!response?.success) {
                throw new Error(response?.message || 'Failed to fetch task details');
            }

            return response?.data;
        } catch (err) {
            setError(err.message || 'An error occurred while fetching task details');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Update a cleaning task
     * @param {string} taskId - ID of the task to update
     * @param {Object} updateData - Data to update the task with
     */
    const updateTask = async (taskId, updateData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await TaskApis.updateTaskCleaner({
                taskId: taskId,
                ...updateData
            });

            return response;
        } catch (err) {
            console.error('Error updating task:', err);
            return {
                success: false,
                message: err.message || 'An error occurred while updating task'
            };
        } finally {
            setLoading(false);
        }
    };

    const updateProperty = async (propertyId, updateData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await TaskApis.updateProperty({
                propertyId,
                ...updateData
            });

            return response;
        } catch (err) {
            console.error('Error updating property problem:', err);
            return {
                success: false,
                message: err.message || 'An error occurred while updating property problem'
            };
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError(null);

    // Get all cached tasks for calendar generation
    const getAllCachedTasks = useCallback(() => {
        const allTasks = [];
        for (const tasks of taskCache.values()) {
            allTasks.push(...tasks);
        }
        return allTasks;
    }, [taskCache]);

    // Clear task cache (useful for refresh)
    const clearTaskCache = useCallback(() => {
        setTaskCache(new Map());
    }, []);

    const uploadImage = async (formData) => {
        try {
            const response = await TaskApis.uploadImage(formData);
            return response.data;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    return {
        cleaningTasks,
        loading,
        fetching,
        error,
        clearError,
        fetchCleaningTasks,
        fetchCleaningTasksNotPending,
        getTaskDetails,
        updateTask,
        uploadImage,
        updateProperty,
        refreshKey,
        setRefreshKey,
        setFetching,
        getAllCachedTasks,
        clearTaskCache,
        taskCache
    };
}; 