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

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (messageData) => {
            const { body, images = [], reservationId } = messageData;

            // Chuẩn bị dữ liệu gửi lên API
            const payload = {
                body,
                reservationId
            };

            // Nếu có ảnh, thêm vào payload
            if (images && images.length > 0) {
                payload.images = images;
            }

            // Gọi API gửi tin nhắn
            return await messageApis.sendMessage(payload);
        },
        onSuccess: (data, variables) => {
            // Làm mới danh sách tin nhắn sau khi gửi thành công
            const { conversationId, reservationId } = variables;

            if (conversationId) {
                queryClient.invalidateQueries(['messages', 'conversation', conversationId]);
            }

            if (reservationId) {
                queryClient.invalidateQueries(['messages', 'reservation', reservationId]);
            }

            queryClient.invalidateQueries(['messages']);
        }
    });
};



export default messageApis
