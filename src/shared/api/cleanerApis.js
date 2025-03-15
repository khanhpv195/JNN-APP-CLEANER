import { POST, UPLOAD, GET } from './fetch'

const listTaskCleanerApis = {
    getList: (params) => {
        return POST('/getAllCleanerTasks', {
            body: params
        })
    },
    listTask: (params) => {
        return POST('/listTask', { body: params })
    },

    listMaintenanceTasks: (params) => {
        return POST('/listMaintenanceTasks', { body: params })
    },

    detailTaskCleaner: (params) => {
        const body = {
            taskId: params.taskId
        }
        return POST(`/detailTask`, { body: body })
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
    }
};

export default listTaskCleanerApis
