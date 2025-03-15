import { useState } from 'react'
import { FlatList, ScrollView, SafeAreaView, View } from 'react-native'

import InventoryCard from '@/components/InventoryCard'

import { useGetInventories } from '@/hooks/useInventory'
import Loading from '@/components/ui/Loading'

const InventoryComponet = () => {

  const { inventories, isLoading, setFetching } = useGetInventories()

  if(isLoading) {
    return <Loading />
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1">
        <View className="flex flex-col gap-5 py-5">
          <FlatList 
            data={inventories}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <InventoryCard item={item} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default InventoryComponet