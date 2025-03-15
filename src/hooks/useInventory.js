import { useState, useEffect } from "react"
import listInventoryApis, { useUpdateInventory as useUpdateInventoryQuery } from "@/shared/api/inventoryApis"
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
        console.log(res?.data?.inventory)
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