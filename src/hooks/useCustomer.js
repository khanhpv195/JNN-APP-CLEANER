import { useState, useEffect, useCallback } from 'react';
import leadApis from "@/shared/api/leadApis";

export const useGetCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false
  });

  // Fetch data from the API
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await leadApis.getCustomers(
        { status: 'CONVERTED' }
      );
      setCustomers(response.data);

      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.currentPage || 1,
          totalPages: response.pagination.totalPages || 1,
          hasNextPage: response.pagination.hasNextPage || false
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Function to refresh leads list
  const refresh = useCallback(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    isLoading,
    fetching,
    pagination,
    refresh
  };
};

// Hook to get lead detail
export const useGetCustomerDetail = (customerId) => {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomerDetail = useCallback(async () => {
    if (!customerId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await leadApis.get(customerId);
      setCustomer(response.data);
    } catch (error) {
      setError('Error fetching customer details');
      console.error('Error fetching customer details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerDetail();
  }, [fetchCustomerDetail]);

  return {
    customer,
    isLoading,
    error,
    refetch: fetchCustomerDetail
  };
};