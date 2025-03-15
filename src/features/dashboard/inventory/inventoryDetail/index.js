import { useLayoutEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native'
import { ChevronLeftIcon } from "react-native-heroicons/outline"
import { useNavigation, useRoute } from '@react-navigation/native'

import { useGetInventory } from '@/hooks/useInventory'
import Loading from '@/components/ui/Loading'
import ScrollImageX from '@/components/ui/ScrollImageX'


const InfoRow = ({ label, value, badge = false }) => (
  <View className="flex-row justify-between items-center py-3">
    <Text className="text-gray-600">{label}</Text>
    {badge ? (
      <View className="bg-orange-400 px-3 py-1 rounded-full">
        <Text className="text-white text-sm font-semibold">{value}</Text>
      </View>
    ) : (
      <Text className="text-gray-900 font-semibold">{value}</Text>
    )}
  </View>
);

export default function DetailInventoryScreen() {
  const navigation = useNavigation()
  const route = useRoute()

  const { id } = route.params

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Detail Inventory',
      headerTitleAlign: "center",
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
      },
    });
  }, [navigation, route])

  const { inventory, isLoading, setFetching } = useGetInventory(id)

  if (isLoading) {
    return <Loading />
  }

  return (
    <View className="flex-1 bg-white py-4">
      <ScrollView className="flex-1">
        {/* Inventory Information */}
        <View className="px-4 rounded-2xl border border-neutral-200 divide-y divide-neutral-200">
          <InfoRow label="Name" value={inventory?.name} />
          <InfoRow label="Quantity" value={inventory?.quantity} />
          <InfoRow label="Status" value={inventory?.status} badge />
        </View>

        {/* Inventory Notes */}
        <View className="py-4">
          <Text className="text-black-600 font-semibold mb-2">Inventory notes</Text>
          <View className="rounded-2xl p-4 border border-neutral-200">
            <Text className="text-black-800 leading-relaxed">
              {inventory?.description}
            </Text>
          </View>
        </View>

        {/* Images */}
        <View className="py-4 w-full">
          <Text className="text-black-600 font-semibold mb-2">Image</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
            <View className="w-full flex-row mt-4 space-x-4 snap-x overscroll-x-auto">
              {inventory && inventory?.photos?.map((image, index) => (
                <Image
                  source={{ uri: image }}
                  key={index}
                  className="p-28 h-32 rounded-2xl nap-center"
                  resizeMode="cover"
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="p-4">
        <TouchableOpacity
          className="w-full bg-green-500 py-4 rounded-xl"
          onPress={() => console.log('Completed')}
        >
          <Text className="text-white text-center font-semibold">Completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}