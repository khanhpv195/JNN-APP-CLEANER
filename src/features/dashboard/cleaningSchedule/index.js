import { SafeAreaView, ScrollView, View, FlatList } from 'react-native'

import CleaningScheduleCard from '@/components/CleaningScheduleCard'
import Loading from '@/components/ui/Loading'

import { useGetCleaners } from '@/hooks/useGetCleaners'

const CleaningScheduleComponent = () => {
  const { cleaners, isLoading, setFetching } = useGetCleaners()

  if(isLoading) {
    return <Loading />
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
      <View className="flex flex-col gap-5 py-5">
          <FlatList 
            data={cleaners}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CleaningScheduleCard item={item} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CleaningScheduleComponent