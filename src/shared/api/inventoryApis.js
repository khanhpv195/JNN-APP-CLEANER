import { POST, GET, UPLOAD, PUT } from './fetch'
import { useFetchData, useUpdateData } from '../../hooks/useQuery'

// Real API implementation
const listInventoryApis = {
    getList: (params) => {
        return GET('/getAllInventory', { params });
    },

    get: (inventoryId) => {
        return POST(`/getInventoryById`, {
            body: {
                inventoryId
            }
        });
    },

    create: (payload) => {
        return POST('/createInventory', { body: payload });
    },

    update: (data) => {
        return PUT('/updateInventory', { body: data });
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
}

// React Query hooks
export function useInventoryList(params, options = {}) {
    return useFetchData(
        '/inventory/getAllInventory',
        ['inventory', params],
        {
            ...options,
            queryFn: () => listInventoryApis.getList(params)
        }
    );
}

export function useInventoryDetail(inventoryId, options = {}) {
    return useFetchData(
        `/inventory/getInventoryById/${inventoryId}`,
        ['inventory', inventoryId],
        {
            ...options,
            queryFn: () => listInventoryApis.get(inventoryId)
        }
    );
}

export function useCreateInventory() {
    return useUpdateData(
        '/inventory/createInventory',
        ['inventory'],
        'POST',
        async (payload) => {
            return listInventoryApis.create(payload);
        }
    );
}

export function useUpdateInventory() {
    return useUpdateData(
        '/inventory/updateInventory',
        ['inventory'],
        'PUT',
        async (data) => {
            return listInventoryApis.update(data);
        }
    );
}

export function useUploadInventoryImage() {
    return useUpdateData(
        '/uploadInventoryImages',
        ['inventoryImages'],
        'POST'
    );
}

export default listInventoryApis
