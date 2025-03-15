import { POST, UPLOAD, GET } from './fetch'
import { useFetchData, useUpdateData } from '../../hooks/useQuery'

const maintenanceApis = {
    getList: (params) => {
        return POST('/getAllMaintenanceTasks', {
            body: params
        })
    },

    listMaintenanceTasks: (params) => {
        return POST('/listMaintenanceTasks', { body: params })
    },
    
    createMaintenanceTask: (params) => {
        console.log('Creating maintenance task with params:', params);
        return POST('/createMaintenanceTask', {
            body: params
        });
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

    getMaintenanceSettings: () => {
        return GET('/maintenanceSettings');
    },

    updateMaintenanceSettings: (params) => {
        return POST('/updateMaintenanceSettings', {
            body: params
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
export function useMaintenanceTasks(params, options = {}) {
    return useFetchData(
        '/getAllMaintenanceTasks',
        ['maintenanceTasks', params],
        {
            ...options,
            method: 'POST',
            body: params,
            queryFn: () => maintenanceApis.getList(params)
        }
    );
}

export function useCreateMaintenance() {
    return useUpdateData(
        '/createMaintenanceTask',
        ['maintenanceTasks'],
        'POST',
        (params) => maintenanceApis.createMaintenanceTask(params)
    );
}

export function useMaintenanceSettings(options = {}) {
    return useFetchData(
        '/maintenanceSettings',
        ['maintenanceSettings'],
        {
            ...options,
            method: 'GET',
            queryFn: () => maintenanceApis.getMaintenanceSettings()
        }
    );
}

export function useUpdateMaintenanceSettings() {
    return useUpdateData(
        '/updateMaintenanceSettings',
        ['maintenanceSettings'],
        'POST',
        (params) => maintenanceApis.updateMaintenanceSettings(params)
    );
}

export default maintenanceApis
