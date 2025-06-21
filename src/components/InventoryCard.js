import { View, Text, Image, TouchableOpacity } from "react-native"

import NavigationService from "@/navigation/NavigationService"

const InventoryCard = ({ item }) => {
  return (
    <TouchableOpacity onPress={() => NavigationService.navigate('detail_inventory', { id: item?._id })}>
    <View style={{/* was: className="border border-neutral-200 rounded-2xl divide-y divide-neutral-200 p-4  gap-5 flex-col my-2.5" */}}>
      <View style={{/* was: className="flex-row gap-5 items-center justify-start" */}}>
        <View style={{/* was: className="" */}}>
          <Image source={{uri: item?.image || 'https://v0.dev/placeholder.svg'}} style={{/* was: className="rounded-2xl h-16 w-16" */}} />
        </View>
        <View style={{/* was: className="flex-col gap-2 justify-start" */}}>
          <Text style={{/* was: className="font-semibold" */}}>{item?.name}</Text>
          <Text>{item?.description}</Text>
        </View>
      </View>
      <View style={{/* was: className="justify-between items-center flex-row pt-3" */}}>
        <View style={{/* was: className="flex-row gap-2" */}}>
          <Text>Quantity:</Text>
          <Text style={{/* was: className="font-semibold" */}}>{item?.quantity}</Text>
        </View>
        <View className={`${item?.status == 'Completed' ? 'bg-primary' : 'bg-orange-400'} px-3 py-1 rounded-full`}>
          <Text style={{/* was: className="text-white font-medium" */}}>{item?.status || 'Completed'}</Text>
        </View>
      </View>
    </View>
    </TouchableOpacity>
  )
}

export default InventoryCard