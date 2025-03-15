import { View, Text, Image, TouchableOpacity } from 'react-native'
import {
  ChevronLeftIcon
} from "react-native-heroicons/outline"
import { PhoneArrowUpRightIcon } from 'react-native-heroicons/solid'

import { Colors } from '@/shared/constants/colors'
import NavigationService from '@/navigation/NavigationService'

const HeaderUser = ({ url, name, email }) => {
  return (
    <View className="flex-row items-center p-4 border-b border-gray-200">
      <TouchableOpacity className="pr-2" onPress={() => NavigationService.goBack()}>
        <ChevronLeftIcon size={24} color="#000" />
      </TouchableOpacity>

      <View className="flex-row flex-1 items-center ml-2">
        <View className="relative">
          <Image
            source={{ uri: url }}
            className="w-10 h-10 rounded-full"
          />
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </View>

        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900">{name}</Text>
          <Text className="text-sm text-gray-500">{email}</Text>
        </View>

        <TouchableOpacity className="p-2" onPress={() => NavigationService.navigate('aircall')}>
          <PhoneArrowUpRightIcon size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default HeaderUser