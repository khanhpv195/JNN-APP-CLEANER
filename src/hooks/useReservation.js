import format from 'date-fns/format';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { STATUS } from '../constants/status';
import TaskApis from '../shared/api/taskApis';

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
            if (fetching) {
                console.log('Already fetching data, skipping redundant request');
                return [];
            }
            
            setFetching(true);
            setLoading(true);
            setError(null);

            // Format the date for API (YYYY-MM-DD)
            const localDate = new Date(date);
            const formattedDate = format(localDate, 'yyyy-MM-dd');

            // Build request body
            const requestBody = {
                date: formattedDate,
            };

            // Add status filter if provided
            if (status) {
                requestBody.status = status;
                console.log(`Filtering tasks by status: ${status}`);
            }

            // Debug request body
            console.log('Request body:', JSON.stringify(requestBody));

            const response = await TaskApis.listAcceptedCleaningTasks(requestBody);

            if (response && response.data) {
                const tasks = response.data;
                console.log(`Fetched ${tasks.length} tasks for date ${formattedDate}`);
                
                // Update the task cache
                updateTaskCache(tasks);
                
                // Update the cleaning tasks state
                setCleaningTasks(tasks);
                
                return tasks;
            }
            return [];
        } catch (err) {
            console.error('Error fetching cleaning tasks:', err);
            setError(err.message || 'Failed to load cleaning tasks');

            // Show error alert for non-permission errors
            if (!err.message?.includes('access denied')) {
                Alert.alert(
                    'Error Loading Tasks',
                    err.message || 'An error occurred while loading tasks',
                    [{ text: 'OK' }]
                );
            }
            return [];
        } finally {
            setLoading(false);
            setFetching(false);
        }
    }, [fetching]);

    // Helper function to update task cache
    const updateTaskCache = useCallback((tasks) => {
        // Group tasks by date
        const tasksByDate = new Map();
        tasks.forEach(task => {
            const taskDate = task.checkOutDate || task.reservationDetails?.checkOut;
            if (taskDate) {
                const dateKey = format(new Date(taskDate), 'yyyy-MM-dd');
                if (!tasksByDate.has(dateKey)) {
                    tasksByDate.set(dateKey, []);
                }
                tasksByDate.get(dateKey).push(task);
            }
        });
        
        // Update cache with new data
        setTaskCache(prevCache => {
            const newCache = new Map(prevCache);
            tasksByDate.forEach((dateTasks, dateKey) => {
                newCache.set(dateKey, dateTasks);
            });
            return newCache;
        });
    }, []);

    //  fetch all cleaning tasks, != pending
    const fetchCleaningTasksNotPending = useCallback(async (date = null) => {
        try {
            // Nếu đang tải dữ liệu, không gọi API nữa
            if (fetching) {
                console.log('Already fetching data, skipping redundant request');
                return [];
            }
            
            setFetching(true);
            setLoading(true);
            setError(null);

            // Tạo request body
            const requestBody = {};
            
            // Nếu có date, thêm vào request body
            if (date) {
                const formattedDate = format(new Date(date), 'yyyy-MM-dd');
                requestBody.date = formattedDate;
                console.log(`Fetching tasks for specific date: ${formattedDate}`);
            } else {
                console.log('Fetching all accepted tasks');
            }

            const response = await TaskApis.listAcceptedCleaningTasks(requestBody);

            if (response && response.data) {
                const tasks = response.data;
                console.log(`Fetched ${tasks.length} tasks`);
                
                // Update the task cache
                updateTaskCache(tasks);
                
                // Cập nhật state với tất cả các tác vụ
                setCleaningTasks(tasks);
                
                return tasks;
            }
            return [];
        } catch (err) {
            console.error('Error fetching cleaning tasks:', err);
            setError(err.message || 'Failed to load cleaning tasks');
            return [];
        } finally {
            setLoading(false);
            setFetching(false);
        }
    }, [fetching, updateTaskCache]);

    /**
     * Fetch cleaning tasks for an entire month
     * @param {Date} date - Any date in the target month
     * @returns {Promise} - API response with tasks for the month
     */
    const fetchCleaningTasksForMonth = useCallback(async (date = new Date()) => {
        try {
            if (fetching) {
                console.log('Already fetching data, skipping redundant request');
                return [];
            }
            
            setFetching(true);
            setLoading(true);
            setError(null);
            
            // Get the first day of the month
            const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const formattedMonth = format(firstDayOfMonth, 'yyyy-MM');
            
            console.log(`Fetching tasks for entire month: ${formattedMonth}`);
            
            // Use the existing API endpoint
            const response = await TaskApis.listAcceptedCleaningTasks({
                month: formattedMonth
            });

            if (response && response.data) {
                const tasks = response.data;
                console.log(`Fetched ${tasks.length} tasks for month ${formattedMonth}`);
                
                // Update the task cache
                updateTaskCache(tasks);
                
                // Update state with all tasks
                setCleaningTasks(tasks);
                
                return tasks;
            }
            return [];
        } catch (err) {
            console.error('Error fetching cleaning tasks for month:', err);
            setError(err.message || 'Failed to load cleaning tasks for month');
            return [];
        } finally {
            setLoading(false);
            setFetching(false);
        }
    }, [fetching, updateTaskCache]);

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

    // Clear task cache
    const clearTaskCache = useCallback(() => {
        setTaskCache(new Map());
        setCleaningTasks([]);
    }, []);

    // Force a refresh of data
    const refreshTasks = () => {
        setRefreshKey(prev => prev + 1);
    };

    const uploadImage = async (formData) => {
        try {
            setLoading(true);
            const response = await TaskApis.uploadImage(formData);
            return response;
        } catch (error) {
            console.error('Error uploading image:', error);
            return {
                success: false,
                message: error.message || 'Failed to upload image'
            };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Group tasks by date
     * @param {Date} date - Date to filter tasks for
     * @returns {Array} - Tasks for the specified date
     */
    const getTasksForDate = useCallback((date) => {
        if (!date || !cleaningTasks || cleaningTasks.length === 0) {
            return [];
        }
        
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        
        return cleaningTasks.filter(task => {
            // Skip pending tasks if needed
            if (task.status === STATUS.PENDING) return false;
            
            // Get the task date from checkOutDate or reservationDetails.checkOut
            const taskDate = new Date(task.checkOutDate || task.reservationDetails?.checkOut);
            taskDate.setHours(0, 0, 0, 0);
            
            return taskDate.toDateString() === compareDate.toDateString();
        });
    }, [cleaningTasks]);

    /**
     * Fetch all cleaning tasks without date filtering
     * This will get all tasks from the API in a single call
     * @returns {Promise} - API response with all tasks
     */
    const fetchAllCleaningTasks = useCallback(async () => {
        try {
            if (fetching) {
                console.log('Already fetching data, skipping redundant request');
                return [];
            }
            
            setFetching(true);
            setLoading(true);
            setError(null);
            
            console.log('Fetching all cleaning tasks (no date filter)');
            
            // Call API without any date filter to get all tasks
            const response = await TaskApis.listAcceptedCleaningTasks({});

            if (response && response.data) {
                const tasks = response.data;
                console.log(`Fetched ${tasks.length} total tasks`);
                
                // Update the task cache
                updateTaskCache(tasks);
                
                // Update state with all tasks
                setCleaningTasks(tasks);
                
                return tasks;
            }
            return [];
        } catch (err) {
            console.error('Error fetching all cleaning tasks:', err);
            setError(err.message || 'Failed to load cleaning tasks');
            return [];
        } finally {
            setLoading(false);
            setFetching(false);
        }
    }, [fetching, updateTaskCache]);

    /**
     * Get all tasks grouped by date
     * @returns {Array} Array of objects with date and tasks
     */
    const getAllTasksGroupedByDate = useCallback(() => {
        if (!cleaningTasks || cleaningTasks.length === 0) {
            return [];
        }
        
        // Create a map to group tasks by date
        const tasksByDate = new Map();
        
        cleaningTasks.forEach(task => {
            // Skip pending tasks if needed
            // if (task.status === STATUS.PENDING) return;
            
            // Get the task date from checkOutDate or reservationDetails.checkOut
            const taskDate = task.checkOutDate || task.reservationDetails?.checkOut;
            if (!taskDate) return;
            
            const date = new Date(taskDate);
            date.setHours(0, 0, 0, 0);
            const dateStr = date.toDateString();
            
            if (!tasksByDate.has(dateStr)) {
                tasksByDate.set(dateStr, {
                    date: date,
                    tasks: []
                });
            }
            
            tasksByDate.get(dateStr).tasks.push(task);
        });
        
        // Convert map to array and sort by date
        const result = Array.from(tasksByDate.values()).sort((a, b) => 
            a.date.getTime() - b.date.getTime()
        );
        
        console.log(`[getAllTasksGroupedByDate] Found ${result.length} days with tasks`);
        return result;
    }, [cleaningTasks]);

    return {
        cleaningTasks,
        loading,
        fetching,
        setFetching,
        error,
        fetchCleaningTasks,
        fetchCleaningTasksNotPending,
        fetchCleaningTasksForMonth,
        fetchAllCleaningTasks,
        getTaskDetails,
        updateTask,
        uploadImage,
        updateProperty,
        clearError,
        refreshTasks,
        taskCache,
        getAllCachedTasks,
        clearTaskCache,
        getTasksForDate,
        getAllTasksGroupedByDate
    };
}; 