import { useState, useEffect } from 'react';
import cleanerApis from '../shared/api/cleanerApis';

/**
 * Custom hook for managing cleaning tasks
 * Handles fetching, updating, and managing cleaning task data
 */
export const useReservation = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cleaningTasks, setCleaningTasks] = useState([]);

    /**
     * Fetch all cleaning tasks for a specific date
     * @param {Date} date - Selected date to fetch tasks for
     */
    const fetchCleaningTasks = async (date = new Date()) => {
        setLoading(true);
        setError(null);

        try {
            setLoading(false);
            // Fix timezone offset by setting time to start of day in local timezone
            const localDate = new Date(date);
            localDate.setHours(0, 0, 0, 0);
            console.log('localDate', localDate);

            // Format date as YYYY-MM-DD to avoid timezone issues
            const year = localDate.getFullYear();
            const month = String(localDate.getMonth() + 1).padStart(2, '0');
            const day = String(localDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            console.log('Formatted date for API:', formattedDate);

            const response = await cleanerApis.listTask({
                date: formattedDate
            });

            if (response?.data?.length > 0) {
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
        } catch (error) {
            setLoading(false);
            setError(error.message || 'An error occurred while fetching tasks');
            throw error;
        }
    };

    /**
     * Get details of a specific cleaning task
     * @param {string} taskId - ID of the task to fetch details for
     */
    const getTaskDetails = async (taskId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await cleanerApis.detailTaskCleaner({
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

            const response = await cleanerApis.updateTaskCleaner({
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

            const response = await cleanerApis.updateProperty({
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
    }, []);

    const uploadImage = async (formData) => {
        try {
            const response = await cleanerApis.uploadImage(formData);
            return response.data;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    return {
        cleaningTasks,
        loading,
        error,
        clearError,
        fetchCleaningTasks,
        getTaskDetails,
        updateTask,
        uploadImage,
        updateProperty
    };
}; 