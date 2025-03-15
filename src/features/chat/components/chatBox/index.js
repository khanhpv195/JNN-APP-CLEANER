import { View, Text, Image, TouchableOpacity, ScrollView, Modal } from 'react-native'
import { useState } from 'react'
import { XIcon } from 'react-native-heroicons/outline'
import ImageViewer from '@/components/ui/ImageViewer'

const ChatBox = ({ msg, onResend }) => {
  const isSent = msg.sender_role === 'host';
  const isGuest = msg.sender_role === null;
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);

  const hasAttachments = msg.attachments && msg.attachments.length > 0;

  const handleOpenImage = (image) => {
    setSelectedImage(image);
    setImageViewerVisible(true);
  };

  return (
    <View className={`mb-4 ${isSent ? 'items-end' : 'items-start'}`}>
      <View className={`flex-row ${isSent ? 'justify-end' : 'justify-start'}`}>
        {isGuest && (
          <View className="relative mr-2">
            <Image
              source={{ uri: msg.sender.avatar }}
              className="w-8 h-8 rounded-full"
            />
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </View>
        )}

        <View className={`max-w-[80%] ${isSent ? 'bg-green-500' : isGuest ? 'bg-gray-200' : 'bg-white'} rounded-3xl p-3`}>
          {msg.body && msg.body.trim() !== '' && (
            <Text className={isSent ? 'text-white' : 'text-gray-800'}>
              {msg.body}
            </Text>
          )}
          {msg.created_at && (
            <Text className={`text-xs ${isSent ? 'text-green-200' : 'text-gray-500'} mt-1 text-right`}>
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        {isSent && !msg.created_at && (
          <TouchableOpacity onPress={onResend} className="ml-2">
            <Text className="text-red-500">Gửi lại</Text>
          </TouchableOpacity>
        )}
      </View>

      {hasAttachments && (
        <View className={`mt-2 max-w-[80%] ${isSent ? 'self-end' : 'self-start'}`}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
          >
            {msg.attachments.map((attachment, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => handleOpenImage(attachment)}
                className="mr-2"
              >
                <Image
                  source={{ uri: attachment.url }}
                  className="rounded-lg"
                  style={{ width: 150, height: 150 }}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isImageViewerVisible && selectedImage && (
        <ImageViewer
          isVisible={isImageViewerVisible}
          imageUrls={[{ url: selectedImage.url }]}
          onClose={() => setImageViewerVisible(false)}
        />
      )}
    </View>
  )
}

export default ChatBox