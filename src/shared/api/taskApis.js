import { POST, GET, UPLOAD } from './fetch'

const taskApis = {
    getTasks: (params) => {
        return POST('/listSupportTasks', {
            body: params
        })
    },

    createTask: (params) => {
        return POST('/createTask', {
            body: params
        })
    },

    updateTask: (params) => {
        // Ensure params and taskId exist
        if (!params || !params.taskId) {
            console.error('updateTask: Missing or invalid taskId', params);
            return Promise.reject(new Error('ID không hợp lệ'));
        }

        console.log('Updating task with params:', params);
        return POST('/updateTask', {
            body: params
        });
    },

    deleteTask: (taskId) => {
        if (!taskId) {
            console.error('deleteTask: Missing taskId');
            return Promise.reject(new Error('ID không hợp lệ'));
        }

        console.log('Deleting task with ID:', taskId);
        return POST('/deleteTask', {
            body: { taskId }
        });
    },

    listMaintenanceTasks: (params) => {
        return POST('/listMaintenanceTasks', { body: params })
    },

    detailTaskCleaner: (params) => {
        // Input validation
        if (!params || !params.taskId) {
            console.error('detailTaskCleaner: Missing or invalid taskId', params);
            return Promise.reject(new Error('ID không hợp lệ'));
        }
        
        return POST('/detailTask', { body: params })
            .catch(error => {
                console.error('Error in detailTaskCleaner API call:', error);
                throw error; // Re-throw after logging
            });
    },

    updateTaskCleaner: (params) => {
        console.log('Updating task with params:', {
            taskId: params.taskId,
            status: params.status,
            checklist: params.checklist
        });

        return POST(`/updateCleanerStatus`, {
            body: {
                taskId: params.taskId,
                status: params.status,
                checklist: params.checklist,
            }
        });
    },

    uploadImage: (formData) => {
        return UPLOAD('/uploadCleaningImages', formData);
    },

    updateBankInformation: (params) => {
        return POST('/updateUser', { body: params });
    },

    getSupportUsers: () => {
        return POST('/getSupportUsers');
    }
}

export default taskApis