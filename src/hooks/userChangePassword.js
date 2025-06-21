import { useState } from 'react';
import userApis from '../shared/api/userApis';

export const useChangePassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const changePassword = async (oldPassword, newPassword) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            await userApis.changePassword(oldPassword, newPassword);

            setSuccess(true);
            return true;
        } catch (err) {
            setError(err.message || 'Failed to change password');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        changePassword,
        loading,
        error,
        success
    };
}; 