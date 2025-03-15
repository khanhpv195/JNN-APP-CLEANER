import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRightIcon } from 'react-native-heroicons/outline'
import { useTranslation } from 'react-i18next';

import MaintenanceCard from '@/components/MaintenanaceCard';
import Loading from '@/components/ui/Loading';

import NavigationService from '@/navigation/NavigationService'
import { useGetMaintenance } from '@/hooks/useMaintenance'

const MaintainRequest = () => {
  const { t } = useTranslation();
  const { maintenances, isLoading, setFetching } = useGetMaintenance()

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('dashboard.maintenanceRequest', 'Maintenance Request')}</Text>
          <View style={styles.badgeRed}>
            <Text style={styles.badgeTextRed}>{maintenances.length}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.viewMoreButtonRed}
          onPress={() => NavigationService.navigate('maintenance')}
        >
          <ChevronRightIcon size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>
      
      {maintenances.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No maintenance requests found</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {maintenances.slice(0, 3).map((item, index) => (
            <View key={`maintenance-${index}`} style={[
              styles.cardContainer,
              index < maintenances.slice(0, 3).length - 1 && styles.cardWithBorder
            ]}>
              <MaintenanceCard item={item} />
            </View>
          ))}
          
          {maintenances.length > 3 && (
            <TouchableOpacity 
              style={styles.viewAllButtonRed}
              onPress={() => NavigationService.navigate('maintenance')}
            >
              <Text style={styles.viewAllTextRed}>View All ({maintenances.length})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  badgeRed: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeTextRed: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 12,
  },
  viewMoreButtonRed: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 20,
  },
  emptyContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6B7280',
  },
  listContainer: {
    paddingBottom: 8,
  },
  cardContainer: {
    paddingVertical: 8,
  },
  cardWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  viewAllButtonRed: {
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllTextRed: {
    color: '#EF4444',
    fontWeight: '600',
  }
})

export default MaintainRequest