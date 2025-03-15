import { useCreatePayment } from '@/shared/api/paymentApis';
import { useState } from 'react';

export function useTaskPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const createPaymentMutation = useCreatePayment();

  const handlePayment = async (taskId, paymentStatus) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log(`Processing payment for task ${taskId} with status ${paymentStatus}`);
      
      // Create the payment request payload
      const payload = {
        taskId,
        paymentStatus
      };
      
      // Log the payment request
      console.log('Payment request payload:', payload);
      
      // Call the API
      const result = await createPaymentMutation.mutateAsync(payload);
      console.log('Payment result:', result);
      
      // Check if the API returned an error
      if (result && result.error) {
        throw new Error(result.error.message || 'Payment API returned an error');
      }
      
      // Check for unexpected response format
      if (!result || (result && !result.success)) {
        console.warn('Unexpected API response format:', result);
        if (result && result.message) {
          throw new Error(result.message);
        } else {
          throw new Error('Unexpected API response');
        }
      }
      
      setIsProcessing(false);
      return result;
    } catch (err) {
      console.error('Payment error:', err);
      
      // Extract detailed error information from different error formats
      let errorMessage = 'An error occurred while processing the payment';
      
      if (err.response && err.response.data) {
        // Handle Axios style errors
        console.error('API error response:', err.response.data);
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsProcessing(false);
      throw err;
    }
  };

  const acceptPayment = (taskId) => {
    return handlePayment(taskId, 'ACCEPTED'); // Ensure spelling is correct per API requirements
  };

  const rejectPayment = (taskId) => {
    return handlePayment(taskId, 'REJECTED');
  };

  return {
    acceptPayment,
    rejectPayment,
    isProcessing,
    error,
    clearError: () => setError(null)
  };
}