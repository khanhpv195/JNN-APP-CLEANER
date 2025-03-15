import { useState, useEffect } from "react"
import cleanrApis from "@/shared/api/cleanerApis"

export const useGetCleaners = () => {
  const [cleaners, setCleaners] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    let ignore = false
    const getData = async () => {
      try {
        setIsLoading(true);

        const res = await cleanrApis.getList();
        setCleaners(res.data.tasks);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(true);
      }
    };
    if(!ignore){
      getData();
    }

    return () => {
      ignore = true
    }
  }, [fetching]);

  return {
    cleaners,
    isLoading,
    setFetching
  };
};