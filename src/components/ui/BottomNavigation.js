import { View, TouchableOpacity, Text, ScrollView } from 'react-native'

const BottomNavigation = ({ btnIndex, setBtnIndex, navigatesBtn }) => {
  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{/* was: className="flex-initial bg-white" */}}>
      <View style={{/* was: className="flex-row justify-around items-center py-4 gap-2 border-gray-200 snap-x" */}}>
        {navigatesBtn.map((btn, index) => (
          <TouchableOpacity key={btn} style={{/* was: className="items-center" */}} onPress={() => setBtnIndex(index)}>
            <View className={`${btnIndex == index ? 'bg-black' : 'bg-white'} rounded-full px-4 py-2 nap-center border border-neutral-200`}>
              <Text className={btnIndex == index ? 'text-white' : 'text-black'}>{btn}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

export default BottomNavigation