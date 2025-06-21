import { View, Image, ScrollView } from 'react-native'

const ScrollImageX = ({ images }) => {
  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
    <View className="flex-row mt-4 space-x-2 snap-x overscroll-x-auto">
      {images && images.map(img => (
        <Image 
          source={{ uri: img?.thumbnail_url }}
          className="w-1/2 h-32 rounded-lg nap-center"
          key={img?.url}
        />
      ))}
    </View>
    </ScrollView>
  )
}

export default ScrollImageX