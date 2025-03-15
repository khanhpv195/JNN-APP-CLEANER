import { View, ScrollView, SafeAreaView, FlatList } from 'react-native';

// Components
import MaintenanceCard from '@/components/MaintenanaceCard'
import Loading from '@/components/ui/Loading';

import { useGetMaintenance } from '@/hooks/useMaintenance';

const MaintenanceComponent = () => {
  const { maintenances, isLoading, setFetching } = useGetMaintenance()

  if(isLoading) {
    return <Loading />
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1">
        <View className="flex flex-col gap-5 py-5">
          <FlatList 
            data={maintenances}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MaintenanceCard item={item} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default MaintenanceComponent