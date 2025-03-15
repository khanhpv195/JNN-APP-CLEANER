import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ToastAndroid,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

// API hooks
import { useSendMessage, useSendMessageWithImages, useUploadMessageImages, useMarkMessageAsRead } from '@/shared/api/messageApis';

// Components
import HeaderUser from './components/headerUser';
import InputBar from './components/inpurtBar';
import ChatBox from './components/chatBox';

// Constants
const MAX_IMAGE_SIZE = 1; // Maximum size in MB

export default function ChatComponent() {
  const route = useRoute();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // Get route params
  const { messages, reservationId, guestId } = route.params;

  // API hooks
  const { mutateAsync: sendMessage } = useSendMessage();
  const { mutateAsync: sendMessageWithImages } = useSendMessageWithImages();
  const { mutateAsync: uploadImages } = useUploadMessageImages();
  const { mutateAsync: markAsRead } = useMarkMessageAsRead();

  // Combine server messages with local pending messages
  const allMessages = [...messages, ...localMessages].sort(
    (a, b) => new Date(a.created_at || Date.now()) - new Date(b.created_at || Date.now())
  );

  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [allMessages]);

  // Đánh dấu tin nhắn đã đọc khi vào xem chi tiết
  useEffect(() => {
    if (reservationId) {
      markAsRead(reservationId)
        .then(() => {
          // Refresh messages danh sách để cập nhật trạng thái đã đọc
          queryClient.invalidateQueries(['messages']);
        })
        .catch(error => {
          console.error('Error marking message as read:', error);
        });
    }
  }, [reservationId]);

  // Find guest information
  const guest = allMessages.find(msg => msg.sender_role === null);

  // Handle sending message with optional images
  const handleSendMessage = async (text) => {
    if ((text.trim() === '' && selectedImages.length === 0) || isLoading) return;

    setIsLoading(true);

    try {
      // Create a temporary message for immediate display
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        body: text,
        sender_role: 'host',
        attachments: [],
        // No created_at indicates this is a pending message
      };

      setLocalMessages(prev => [...prev, tempMessage]);

      // Prepare message data with correct structure
      const messageData = {
        body: text,
        images: selectedImages
      };

      // Send message
      const response = await sendMessage(messageData);

      if (response.success) {
        // Remove the temporary message
        setLocalMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));

        // Clear selected images
        setSelectedImages([]);

        // Refresh messages
        queryClient.invalidateQueries(['messages', 'reservation', reservationId]);

        // Show success toast on Android
        if (Platform.OS === 'android') {
          ToastAndroid.show('Message sent successfully', ToastAndroid.SHORT);
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);

      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to send message', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Failed to send message');
      }

      // Mark the temporary message as failed
      setLocalMessages(prev =>
        prev.map(msg =>
          msg._id === `temp-${Date.now()}`
            ? { ...msg, failed: true }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendMessage = (failedMessage) => {
    // Remove the failed message
    setLocalMessages(prev => prev.filter(msg => msg._id !== failedMessage._id));

    // Attempt to send it again
    handleSendMessage(failedMessage.body);
  };

  const handleUploadResponse = (response) => {
    console.log('Handling upload response:', response);

    if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
      // Lấy URL ảnh từ response.data
      const imageUrls = response.data;
      console.log('Got image URLs:', imageUrls);

      // Thêm các URL ảnh vào state
      setSelectedImages(prev => [...prev, ...imageUrls]);
    } else {
      console.error('Invalid upload response:', response);
      Alert.alert('Error', 'Failed to get image URL from server');
    }
  };

  const handleImageSelected = async (imageAsset) => {
    try {
      setIsUploading(true);

      // Tạo FormData
      const formData = new FormData();
      formData.append('files', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: `image-${Date.now()}.jpg`
      });

      console.log('Uploading image...');

      // Gọi API upload ảnh
      const response = await uploadImages(formData);
      console.log('Upload API response:', response);

      // Xử lý response
      if (response?.success) {
        handleUploadResponse(response);
      } else {
        throw new Error('Upload failed: ' + (response?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      // Mobile version
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' && libraryStatus !== 'granted') {
        Alert.alert('Permission Required', 'Camera and photo library permissions are required');
        return;
      }

      Alert.alert(
        'Select Image',
        'Choose image source',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              try {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaType.Images,
                  allowsEditing: true,
                  aspect: [4, 3],
                  quality: 0.5,
                  maxWidth: 1920,
                  maxHeight: 1920,
                });

                if (!result.canceled && result.assets && result.assets[0]) {
                  await handleImageSelected(result.assets[0]);
                }
              } catch (err) {
                console.error('Camera error:', err);
                Alert.alert('Error', 'Failed to take photo');
              }
            },
          },
          {
            text: 'Choose from Library',
            onPress: async () => {
              try {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaType.Images,
                  allowsEditing: true,
                  aspect: [4, 3],
                  quality: 0.5,
                  maxWidth: 1920,
                  maxHeight: 1920,
                });

                if (!result.canceled && result.assets && result.assets[0]) {
                  await handleImageSelected(result.assets[0]);
                }
              } catch (err) {
                console.error('Library error:', err);
                Alert.alert('Error', 'Failed to pick image from library');
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <HeaderUser
          name={guest?.sender?.full_name}
          email={guest?.sender?.email}
          url={guest?.sender?.avatar}
        />

        <FlatList
          ref={flatListRef}
          data={allMessages}
          renderItem={({ item }) => (
            <ChatBox
              msg={item}
              onResend={() => handleResendMessage(item)}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
        />

        {/* Input Bar */}
        <InputBar
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onImagePick={handleImagePick}
          selectedImages={selectedImages}
          isUploading={isUploading}
          onRemoveImage={(index) => {
            setSelectedImages(prev => prev.filter((_, i) => i !== index));
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}