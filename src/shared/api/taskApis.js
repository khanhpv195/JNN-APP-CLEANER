import { POST } from './fetch';

/**
 * API functions for task management
 */
const TaskApis = {
    /**
     * Fetch pending cleaning tasks
     * @param {Object} params - Request parameters
     * @returns {Promise} - API response
     */
    listPendingCleaningTasks: (params = {}) => {
        return POST('/listPendingCleaningTasks', {
            body: params
        });
    },

    /**
     * Fetch accepted cleaning tasks
     * @param {Object} params - Request parameters
     * @returns {Promise} - API response
     */
    listAcceptedCleaningTasks: (params = {}) => {
        return POST('/listAcceptedCleaningTasks', {
            body: params
        });
    },

    /**
     * Get task details for a cleaner
     * @param {Object} params - Request parameters including taskId
     * @returns {Promise} - API response
     */
    detailTaskCleaner: (params) => {
        const body = {
            taskId: params.taskId
        }
        return POST(`/detailTask`, { body: body })
    },

    /**
     * Update a task for a cleaner
     * @param {Object} params - Request parameters including taskId and update data
     * @returns {Promise} - API response
     */
    updateTaskCleaner: (params = {}) => {
        return POST('/updateTaskCleaner', {
            body: params
        });
    },

    /**
     * Upload an image
     * @param {FormData} formData - Form data with image file
     * @returns {Promise} - API response
     */
    uploadImage: (formData) => {
        return POST('/uploadImage', {
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Update property information
     * @param {Object} params - Request parameters including propertyId and update data
     * @returns {Promise} - API response
     */
    updateProperty: (params = {}) => {
        return POST('/updateProperty', {
            body: params
        });
    },

    /**
     * Get all tasks for a cleaner
     * @param {Object} params - Request parameters
     * @returns {Promise} - API response
     */
    getAllTasks: (params = {}) => {
        return POST('/getAllTasks', {
            body: params
        });
    }
};

export default TaskApis;
