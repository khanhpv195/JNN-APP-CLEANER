import { POST, UPLOAD, GET } from './fetch'
import { useFetchData, useUpdateData } from '../../hooks/useQuery'

const propertyApis = {
    getList: (params) => {
        return POST('/getProperties', {
            body: params
        })
    },

    listMaintenanceTasks: (params) => {
        return POST('/listMaintenanceTasks', { body: params })
    },

    getDetail: ({ propertyId }) => {
        const body = {
            propertyId
        }
        return POST(`/getPropertyDetail`, { body: body })
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

    updateProperty: (params) => {
        return POST('/updateProperty', {
            body: params
        });
    },

    addNote: (params) => {
        return POST('/createNoteProperty', {
            body: params
        });
    }
}

// React Query hooks
export function useProperties(params, options = {}) {
    return useFetchData(
        '/getProperties',
        ['properties', params],
        {
            ...options,
            method: 'POST',
            body: params,
            queryFn: () => propertyApis.getList(params)
        }
    );
}

export function usePropertyDetail(propertyId, options = {}) {
    return useFetchData(
        '/getPropertyDetail',
        ['property', propertyId],
        {
            ...options,
            method: 'POST',
            body: { propertyId },
            queryFn: () => propertyApis.getDetail({ propertyId })
        }
    );
}

export function useUpdateProperty() {
    return useUpdateData(
        '/updateProperty',
        ['properties'],
        'POST',
        (params) => propertyApis.updateProperty(params)
    );
}

export function useUploadPropertyImage() {
    return useUpdateData(
        '/uploadPropertyImages',
        ['propertyImages'],
        'POST',
        (formData) => propertyApis.uploadImage(formData)
    );
}

export default propertyApis
