import { POST, UPLOAD } from './fetch'

const TaskApis = {
    getList: (params) => {
        return POST('/getAllCleanerTasks', {
            body: params
        })
    },


    detailTaskCleaner: (params) => {
        const body = {
            taskId: params.taskId
        }
        return POST(`/detailTask`, { body: body })
    },
    updateProperty: (params) => {
        return POST('/updateProperty', {
            body: params
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
        return UPLOAD('/uploadFile', formData);
    },

    updateBankInformation: (params) => {
        return POST('/updateUser', { body: params });
    }
};

export default TaskApis
