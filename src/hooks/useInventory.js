import { useState, useEffect } from "react"
import listInventoryApis, {
  useUpdateInventory as useUpdateInventoryQuery,
  useCreateInventory as useCreateInventoryQuery
} from "@/shared/api/inventoryApis"
import { useQueryClient } from '@tanstack/react-query'

export const useGetInventories = () => {
  const [inventories, setInventories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    let ignore = false
    const getListTask = async () => {
      try {
        setIsLoading(true)
        const res = await listInventoryApis.getList()
        setIsLoading(false)
        // if(!res.success) return

        setInventories(res.data?.inventory)
      } catch (err) {
        console.log(err)
        setIsLoading(false)
      }
    }
    if (!ignore) {
      getListTask()
    }

    return () => {
      ignore = true
    }
  }, [fetching])

  return {
    inventories,
    isLoading,
    setFetching
  };
};

export const useGetInventory = (id) => {
  const [inventory, setInventory] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    let ignore = false
    const getInventoryDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true)
        const res = await listInventoryApis.get(id)
        setIsLoading(false)

        setInventory(res.data)
      } catch (err) {
        console.log(err)
        setIsLoading(false)
      }
    }

    if (!ignore) {
      getInventoryDetails()
    }

    return () => {
      ignore = true
    }
  }, [fetching, id])

  return {
    inventory,
    isLoading,
    setFetching
  };
};

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = useUpdateInventoryQuery();

  const updateInventory = async (data) => {
    try {
      const result = await mutateAsync(data);

      // Invalidate and refetch inventories list and the specific inventory
      queryClient.invalidateQueries(['inventory']);
      if (data.inventoryId) {
        queryClient.invalidateQueries(['inventory', data.inventoryId]);
      }

      return result;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  };

  return {
    updateInventory,
    isUpdating: isLoading
  };
};

export const useCreateInventory = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = useCreateInventoryQuery();

  const createInventory = async (data) => {
    try {
      // Make a copy of the data to avoid mutating the original
      const payload = { ...data };

      // Format price as a number if it's a string with currency format
      if (payload.price && typeof payload.price === 'string') {
        // Remove currency symbol and commas
        const numericPrice = parseFloat(payload.price.replace(/[$,]/g, ''));
        payload.price = numericPrice;
      }

      // Ensure image URL is properly formatted and available
      if (payload.image) {
        console.log('Using image URL:', payload.image);
        // Make sure image URL is a string and starts with http
        if (typeof payload.image !== 'string' || !payload.image.startsWith('http')) {
          console.warn('Invalid image URL format - removing from payload');
          delete payload.image;
        }
      } else {
        // Remove image property if null to avoid backend issues
        delete payload.image;
      }

      // Send the data to the API
      console.log('Creating inventory with data:', payload);
      const result = await mutateAsync(payload);

      // Invalidate and refetch inventories list
      queryClient.invalidateQueries(['inventory']);

      return result;
    } catch (error) {
      console.error('Error creating inventory:', error);
      throw error;
    }
  };

  return {
    createInventory,
    isCreating: isLoading
  };
};