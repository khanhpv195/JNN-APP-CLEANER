import { POST } from './fetch';
import { useFetchData, useUpdateData } from '../../hooks/useQuery';

const paymentApis = {
  createPayment: (payload) => {
    console.log('Creating payment with payload:', payload);
    return POST('/createPayment', {
      body: payload
    });
  },
  
  getPayment: (paymentId) => {
    return POST('/getPayment', {
      body: { paymentId }
    });
  },
  
  getPaymentHistory: (taskId) => {
    return POST('/getPaymentHistory', {
      body: { taskId }
    });
  }
};

// React Query hooks
export function useCreatePayment() {
  return useUpdateData(
    '/createPayment',
    ['payment'],
    'POST',
    (payload) => paymentApis.createPayment(payload)
  );
}

export function usePayment(paymentId, options = {}) {
  return useFetchData(
    '/getPayment',
    ['payment', paymentId],
    {
      ...options,
      method: 'POST',
      body: { paymentId },
      queryFn: () => paymentApis.getPayment(paymentId)
    }
  );
}

export function usePaymentHistory(taskId, options = {}) {
  return useFetchData(
    '/getPaymentHistory',
    ['paymentHistory', taskId],
    {
      ...options,
      method: 'POST',
      body: { taskId },
      queryFn: () => paymentApis.getPaymentHistory(taskId)
    }
  );
}

export default paymentApis;