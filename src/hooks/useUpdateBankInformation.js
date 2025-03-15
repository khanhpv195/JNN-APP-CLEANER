import { useState } from 'react';
import listTaskCleanerApis from '../shared/api/cleanerApis';

export const useUpdateBankInformation = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateBankInformation = async (bankData) => {
        try {
            setLoading(true);
            setError(null);

            const payload = {
                dataToUpdate: {
                    bankAccount: {
                        account_number: bankData.account_number,
                        routing_number: bankData.routing_number,
                        account_holder_name: bankData.account_holder_name
                    }
                }
            };

            const response = await listTaskCleanerApis.updateBankInformation(payload);
            return response;
        } catch (err) {
            setError(err.message || 'An error occurred while updating bank information');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        updateBankInformation,
        loading,
        error
    };
}; 