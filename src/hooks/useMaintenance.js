import { useState, useEffect } from "react"
import maintenanceApis from "@/shared/api/maintenanceApis"

export const useGetMaintenance = () => {
  const [maintenances, setMaintenances] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    let ignore = false
    const getListTask = async () => {
      try {
        setIsLoading(true);
        const params = {
          page: 1,
          limit: 20,
        };
        console.log('Fetching maintenance tasks...');
        const res = await maintenanceApis.getList(params);

        if (!res || !res?.tasks) {
          console.error('Invalid maintenance data structure:', res);
          setMaintenances([]);
        } else {
          setMaintenances(res.tasks);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching maintenance tasks:', err);
        setMaintenances([]);
        setIsLoading(false);
      }
    };
    if (!ignore) {
      getListTask();
    }

    return () => {
      ignore = true
    }
  }, [fetching]);

  return {
    maintenances,
    isLoading,
    setFetching
  };
};