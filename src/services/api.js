/**
 * Get cleaning tasks for the current user
 * @returns {Promise<Array>} List of cleaning tasks
 */
export const getCleaningTasks = async () => {
    try {
        const response = await api.get('/tasks/cleaning');
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching cleaning tasks:', error);
        throw error;
    }
};

/**
 * Get maintenance tasks for the current user
 * @returns {Promise<Array>} List of maintenance tasks
 */
export const getMaintenanceTasks = async () => {
    try {
        const response = await api.get('/tasks/maintenance');
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching maintenance tasks:', error);
        throw error;
    }
}; 