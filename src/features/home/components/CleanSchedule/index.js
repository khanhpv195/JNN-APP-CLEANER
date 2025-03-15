import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRightIcon } from 'react-native-heroicons/outline'
import { useTranslation } from 'react-i18next';

import CleaningScheduleCard from '@/components/CleaningScheduleCard';
import NavigationService from '@/navigation/NavigationService'
import Loading from '@/components/ui/Loading';

import { useGetCleaners } from '@/hooks/useGetCleaners'

const CleanSchedule = () => {
  const { t } = useTranslation();
  const { cleaners, isLoading, setFetching } = useGetCleaners()

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('dashboard.cleaningSchedule', 'Cleaning Schedule')}</Text>
          <View style={styles.badgeBlue}>
            <Text style={styles.badgeTextBlue}>{cleaners.length}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.viewMoreButtonBlue}
          onPress={() => NavigationService.navigate('cleaning-schedule')}
        >
          <ChevronRightIcon size={22} color="#2E90FA" />
        </TouchableOpacity>
      </View>
      
      {cleaners.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No cleaning tasks found</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {cleaners.slice(0, 3).map((item, index) => (
            <View key={`cleaning-${index}`} style={[
              styles.cardContainer,
              index < cleaners.slice(0, 3).length - 1 && styles.cardWithBorder
            ]}>
              <CleaningScheduleCard item={item} />
            </View>
          ))}
          
          {cleaners.length > 3 && (
            <TouchableOpacity 
              style={styles.viewAllButtonBlue}
              onPress={() => NavigationService.navigate('cleaning-schedule')}
            >
              <Text style={styles.viewAllTextBlue}>View All ({cleaners.length})</Text>
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
    color: '#2E90FA',
  },
  badgeBlue: {
    backgroundColor: '#EFF8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeTextBlue: {
    color: '#2E90FA',
    fontWeight: '600',
    fontSize: 12,
  },
  viewMoreButtonBlue: {
    backgroundColor: '#F0F9FF',
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
  viewAllButtonBlue: {
    marginTop: 12,
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllTextBlue: {
    color: '#2E90FA',
    fontWeight: '600',
  }
})

export default CleanSchedule