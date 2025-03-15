import { useState, useEffect } from "react"
import propertyApis from "@/shared/api/propertyApis"

// get all properties
export const useGetProperty = () => {
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    let ignore = false
    const getData = async () => {
      try {
        setIsLoading(true)
        const params = {
          page: 1,
          limit: 20
        }
        const res = await propertyApis.getList(params)
        if (!res.success) return

        setProperties(res.data.properties)
        setIsLoading(false)
      } catch (err) {
        console.log(err)
        setIsLoading(true)
      }
    }
    if (!ignore) {
      getData()
    }

    return () => {
      ignore = true
    }
  }, [fetching])

  return {
    properties,
    isLoading,
    setFetching
  };
};

// get property detail
export const useGetPropertyDetail = ({ propertyId }) => {
  const [property, setProperty] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  if (!propertyId) return

  useEffect(() => {
    let ignore = false
    const getData = async () => {
      try {
        setIsLoading(true)

        const res = await propertyApis.getDetail({ propertyId })
        if (!res.success) return

        setProperty(res.data)
        setIsLoading(false)
      } catch (err) {
        console.log(err)
        setIsLoading(true)
      }
    }
    if (!ignore) {
      getData()
    }

    return () => {
      ignore = true
    }
  }, [fetching, propertyId])

  return {
    property,
    isLoading,
    setFetching
  };
};

export const useUpdateProperty = () => {
  const updateProperty = async (propertyId, data) => {
    console.log("useUpdateProperty.updateProperty called with propertyId:", propertyId);
    console.log("useUpdateProperty.updateProperty called with data:", data);

    try {
      // Cấu trúc dữ liệu theo yêu cầu API
      const requestData = {
        propertyId,
        data
      };
      console.log("Request data for API:", requestData);

      const response = await propertyApis.updateProperty(requestData);
      console.log("API response:", response);
      return response;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  };

  const addNote = async (propertyId, noteData) => {
    console.log('noteData', noteData)
    try {
      const requestData = {
        propertyId,
        content: noteData.content
      };

      const response = await propertyApis.addNote(requestData);
      return response;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  return { updateProperty, addNote };
};