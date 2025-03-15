import { Colors } from '@/shared/constants/colors'
import { View, TouchableOpacity, TextInput, Image, ScrollView, Alert } from 'react-native'
import { 
  CameraIcon,
  FaceSmileIcon,
  PaperAirplaneIcon,
  XCircleIcon,
} from "react-native-heroicons/outline"
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'

const InputBar = ({ message, setMessage, onSendMessage, isLoading }) => {
  const [selectedImages, setSelectedImages] = useState([])

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need permission to access your photos')
        return
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      })
      
      if (!result.canceled && result.assets) {
        // Only allow up to 5 images total
        const newImages = result.assets.slice(0, 5 - selectedImages.length)
        
        if (selectedImages.length + newImages.length > 5) {
          Alert.alert('Limit Exceeded', 'You can only select up to 5 images')
        }
        
        setSelectedImages([...selectedImages, ...newImages])
      }
    } catch (error) {
      console.error('Image selection error:', error)
      Alert.alert('Error', 'There was an error selecting images')
    }
  }

  const removeImage = (index) => {
    const newImages = [...selectedImages]
    newImages.splice(index, 1)
    setSelectedImages(newImages)
  }

  const handleSend = () => {
    if (message.trim() === '' && selectedImages.length === 0) return
    
    onSendMessage(message, selectedImages)
    setMessage('')
    setSelectedImages([])
  }

  return (
    <View className="border-t border-gray-200">
      {selectedImages.length > 0 && (
        <ScrollView 
          horizontal
          className="p-2"
          showsHorizontalScrollIndicator={false}
        >
          {selectedImages.map((image, index) => (
            <View key={index} className="relative mr-2">
              <Image 
                source={{ uri: image.uri }} 
                className="w-20 h-20 rounded-md"
              />
              <TouchableOpacity 
                className="absolute top-1 right-1 bg-white rounded-full"
                onPress={() => removeImage(index)}
              >
                <XCircleIcon size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      
      <View className="p-4 flex-row items-center space-x-1">
        <TouchableOpacity className="p-2" onPress={pickImage}>
          <CameraIcon size={24} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity className="p-2">
          <FaceSmileIcon size={24} color={Colors.primary} />
        </TouchableOpacity>
        
        <View className="flex-1 bg-gray-100 rounded-full px-4 py-2">
          <TextInput
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            className="text-gray-900 outline-none"
            multiline
          />
        </View>
        
        <TouchableOpacity 
          className={`${isLoading ? 'bg-gray-400' : 'bg-green-500'} p-2 rounded-full`}
          onPress={handleSend}
          disabled={isLoading}
        >
          <PaperAirplaneIcon size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default InputBar