import { useMutation } from "@tanstack/react-query";

import { UPLOAD } from "../shared/api/fetch";

export const useUploadImages = () => {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: async (formData) => {
      const endpoint = '/uploadCleaningImages';
      console.log('Uploading to endpoint:', endpoint);

      // Gọi API với headers phù hợp
      const response = await UPLOAD(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });

      // Log response để debug
      console.log('API Response:', response.data);



      return response.data;
    },
  });

  return { mutateAsync, ...rest };
};