import { useState, useEffect, useCallback } from 'react';
import TaskApis from '../shared/api/taskApis';
import { POST } from '../shared/api/fetch';
import format from 'date-fns/format';
import { Alert } from 'react-native';

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

    /**
     * Fetch all cleaning tasks for a specific date
     * @param {Date} date - Selected date to fetch tasks for
     */
    const fetchCleaningTasks = useCallback(async (date = new Date()) => {
        try {
            setLoading(true);
            setError(null);

            // Format the date for API (YYYY-MM-DD)
            const localDate = new Date(date);
            console.log('localDate', localDate);
            const formattedDate = format(localDate, 'yyyy-MM-dd');
            console.log('Formatted date for API:', formattedDate);

            const requestBody = {
                date: formattedDate,
                status: 'ASSIGNED'
            };

            console.log('requestBody', requestBody);

            const response = await POST('/listCleaningTasks', {
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

            console.log('response', response);

            if (response && response.data) {
                const tasks = response.data.map(task => ({
                    id: task?._id,
                    roomNumber: task?.propertyDetails?.name,
                    title: task?.propertyDetails?.name || 'Unknown Property',
                    address: task?.propertyDetails?.address,
                    checkoutTime: task?.reservationDetails?.checkOut
                        ? new Date(task.reservationDetails.checkOut).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })
                        : 'N/A',
                    readyToClean: task?.status === 'PENDING',
                    accepted: task?.status === 'IN_PROGRESS',
                    checkInDate: task?.reservationDetails?.checkIn
                        ? new Date(task.reservationDetails.checkIn)
                        : null,
                    checkOutDate: task?.reservationDetails?.checkOut
                        ? new Date(task.reservationDetails.checkOut)
                        : null,
                    status: task?.status || 'UNKNOWN',
                    price: task?.price?.amount || 0,
                    propertyId: task?.propertyId?._id || {},
                    propertyDetails: task?.propertyId || {},
                    reservationDetails: task?.reservationDetails || {},
                    _id: task?._id
                }));

                setCleaningTasks(tasks);
                return tasks;
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

    // Initial fetch with today's date
    useEffect(() => {
        fetchCleaningTasks(new Date());
    }, [fetchCleaningTasks]);

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
        getTaskDetails,
        updateTask,
        uploadImage,
        updateProperty,
        refreshKey,
        setRefreshKey,
        setFetching
    };
}; 