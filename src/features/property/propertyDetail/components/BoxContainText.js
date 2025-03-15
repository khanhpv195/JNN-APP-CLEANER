import { View, TouchableOpacity, Text } from 'react-native'
import { PencilIcon } from "react-native-heroicons/outline";

const BoxContainText = ({ title, content }) => {
  return (
    <View className="border border-gray-200 divide-y divide-gray-200 px-5 rounded-2xl bg-white">
      <View className="flex-row justify-between items-start py-4">
        <Text className="font-semibold capitalize">{title}</Text>
        <TouchableOpacity>
          <PencilIcon size={16} color="#2E90FA" />
        </TouchableOpacity>
      </View>
      <Text className="text-gray-600 text-sm py-4">
        {content}
      </Text>
    </View>
  )
}

export default BoxContainText