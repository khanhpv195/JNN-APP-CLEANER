import { useFetchData, useUpdateData } from './useQuery'
import userApis from '../shared/api/userApis'

export function useUser(options = {}) {
    return useFetchData(
        '/getUser',
        ['user'],
        {
            ...options,
            method: 'POST',
            queryFn: () => userApis.getUser()
        }
    )
}

export function useUsers(options = {}) {
    const result = useFetchData(
        '/getUsers',
        ['users'],
        {
            ...options,
            method: 'POST',
            queryFn: () => {
                console.log('Fetching users...');
                return userApis.getUsers().then(response => {
                    console.log('Users response received:', response);
                    return response.data;
                }).catch(error => {
                    console.error('Error fetching users:', error);
                    throw error;
                });
            }
        }
    );

    console.log('useUsers hook result:', result);
    return result;
}

export function useCreateUser() {
    return useUpdateData(
        '/createUser',
        ['users'],
        'POST',
        (userData) => userApis.createUser(userData).then(response => {
            return response.data;
        })
    )
}

export function useForgotPassword() {
    return useUpdateData(
        '/forgotPassword',
        [],
        'POST',
        (email) => userApis.forgotPassword(email)
    )
}

export function useResetPassword() {
    return useUpdateData(
        '/resetPassword',
        [],
        'POST',
        ({ password, token }) => userApis.resetPassword(password, token)
    )
} 