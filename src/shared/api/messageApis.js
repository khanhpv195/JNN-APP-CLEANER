import { POST, UPLOAD } from './fetch'
import { useFetchData } from '../../hooks/useQuery'
import { useQueryClient, useMutation } from '@tanstack/react-query'

const messageApis = {
    getAllMessages: (params) => {
        return POST('/getAllMessages', {
            body: params
        })
    },

    markMessageAsRead: (reservationId) => {
        return POST('/markMessageAsRead', {
            body: { reservationId }
        })
    },

    markAllMessagesAsRead: () => {
        return POST('/markAllMessagesAsRead', {
            body: {}
        })
    },

    sendMessage: (params) => {
        return POST('/sendMessage', {
            body: params
        })
    },

    sendMessageWithImages: (params, images) => {
        const formData = new FormData()

        // Add message data
        formData.append('messageData', JSON.stringify(params))

        // Add images if any
        if (images && images.length > 0) {
            images.forEach((image, index) => {
                const fileExtension = image.uri.split('.').pop()
                formData.append('images', {
                    uri: image.uri,
                    type: `image/${fileExtension}`,
                    name: `image_${index}.${fileExtension}`
                })
            })
        }

        return UPLOAD('/sendMessageWithImages', formData)
    },

    uploadMessageImages: (images) => {
        const formData = new FormData()

        if (images && images.length > 0) {
            images.forEach((image, index) => {
                const fileExtension = image.uri.split('.').pop()
                formData.append('images', {
                    uri: image.uri,
                    type: `image/${fileExtension}`,
                    name: `image_${index}.${fileExtension}`
                })
            })
        }

        return UPLOAD('/uploadCleaningImages', formData)
    },

    getMessagesByReservationId: (params) => {
        return POST('/getMessagesByReservationId', {
            body: params
        })
    }
}

// React Query hooks
export function useMessages(params, options = {}) {
    return useFetchData({
        url: '/getAllMessages',
        queryKey: ['messages', params],
        options: {
            ...options,
            method: 'POST',
            body: params,
        },
        queryFn: () => messageApis.getAllMessages(params)
    })
}

export function useMarkMessageAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reservationId) => messageApis.markMessageAsRead(reservationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });
}

export const useMarkAllMessagesAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            return messageApis.markAllMessagesAsRead();
        },
        onSuccess: () => {
            // Invalidate and refetch messages query to update the UI
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
};

export function useMessagesByReservation(reservationId, options = {}) {
    const params = { reservationId }
    return useFetchData({
        url: '/getMessagesByReservationId',
        queryKey: ['messages', 'reservation', reservationId],
        options: {
            ...options,
            method: 'POST',
            body: params
        },
        queryFn: () => messageApis.getMessagesByReservationId(params)
    })
}

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => messageApis.sendMessage(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });
}

export function useSendMessageWithImages() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ params, images }) => messageApis.sendMessageWithImages(params, images),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });
}

export function useUploadMessageImages() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (images) => messageApis.uploadMessageImages(images),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messageImages'] });
        }
    });
}

export default messageApis
