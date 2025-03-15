import { POST, GET, PUT, DELETE } from './fetch'
import { useFetchData, useUpdateData } from '../../hooks/useQuery'

const leadApis = {
    getList: (params) => {
        return POST('/getLeads', {
            body: params
        })
    },

    getCustomers: (params) => {
        return POST('/getLeads', {
            body: params
        })
    },

    create: (params) => {
        return POST('/createLead', { body: params })
    },

    get: (params) => {
        return POST(`/getLeadDetail`, { body: { leadId: params } })
    },

    update: (payload) => {
        console.log("Update lead payload:", payload);
        return PUT(`/updateLead`, {
            body: payload
        });
    },

    delete: (params) => {
        return DELETE('/deleteLead', { body: { leadId: params } });
    },

    createNote: (noteData) => {
        return POST('/createNote', {
            body: noteData
        });
    },

    updateBankInformation: (params) => {
        return POST('/updateUser', { body: params });
    }
}


export default leadApis
