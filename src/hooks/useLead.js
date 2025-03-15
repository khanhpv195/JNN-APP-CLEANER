import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import leadApis from "@/shared/api/leadApis";
import taskApis from '@/shared/api/taskApis';

// Hook to get leads list with pagination
export const useGetLeads = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false
  });

  // Fetch data from the API
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await leadApis.getList();
      console.log('response', response);
      setLeads(response.data?.leads || []);

      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.currentPage || 1,
          totalPages: response.pagination.totalPages || 1,
          hasNextPage: response.pagination.hasNextPage || false
        });
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Function to refresh leads list
  const refresh = useCallback(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    isLoading,
    fetching,
    pagination,
    refresh
  };
};

// Hook to get lead detail
export const useGetLeadDetail = (leadId) => {
  const [lead, setLead] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeadDetail = useCallback(async () => {
    if (!leadId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await leadApis.get(leadId);
      setLead(response.data);
    } catch (error) {
      setError('Error fetching lead details');
      console.error('Error fetching lead details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLeadDetail();
  }, [fetchLeadDetail]);

  return {
    lead,
    isLoading,
    error,
    refetch: fetchLeadDetail
  };
};

// use useCreateLead
export const useCreateLead = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createLead = useCallback(async (lead) => {
    setIsLoading(true);
    try {
      const response = await leadApis.create(lead);
      return response;
    } catch (error) {
      setError('Error creating lead');
      console.error('Error creating lead:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    createLead
  };
}

// use useUpdateLead
export const useUpdateLead = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateLead = useCallback(async (leadData) => {
    setIsLoading(true);
    try {
      const { id, ...data } = leadData;
      if (!id) {
        throw new Error('Lead ID is required for update');
      }
      const response = await leadApis.update(
        {
          leadId: id,
          data: data
        }
      );
      console.log("Update lead response:", response);
      return response;
    } catch (error) {
      setError('Error updating lead');
      console.error('Error updating lead:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    updateLead
  };
}

// use useDeleteLead
export const useDeleteLead = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteLead = useCallback(async (leadId) => {
    setIsLoading(true);
    try {
      const response = await leadApis.delete(leadId);
      return response;
    } catch (error) {
      setError('Error deleting lead');
      console.error('Error deleting lead:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    deleteLead
  };
}

// use useCreateNote
export const useCreateLeadNote = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNote = useCallback(async (note) => {
    setIsLoading(true);
    try {
      const response = await leadApis.createNote(note);
      return response;
    } catch (error) {
      setError('Error creating note');
      console.error('Error creating note:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    createNote
  };
}

// use useGetSupportUsers
export const useGetSupportUsers = () => {
  const [supportUsers, setSupportUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSupportUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await taskApis.getSupportUsers();
      console.log('response', response);
      setSupportUsers(response.data || []);
      return response;
    } catch (error) {
      setError('Error fetching support users');
      console.error('Error fetching support users:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupportUsers();
  }, [fetchSupportUsers]);

  return {
    supportUsers,
    isLoading,
    error,
    refetch: fetchSupportUsers
  };
}
