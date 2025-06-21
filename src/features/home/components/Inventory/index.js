import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRightIcon } from 'react-native-heroicons/outline'
import { useTranslation } from 'react-i18next';

import InventoryCard from '@/components/InventoryCard';
import NavigationService from '@/navigation/NavigationService'
import Loading from '@/components/ui/Loading';

import { useGetInventories } from '@/hooks/useInventory'

const Inventory = () => {
  const { t } = useTranslation();
  const { inventories, isLoading, setFetching } = useGetInventories()

  if (isLoading) {
    return <Loading />
  }

  const inventoryItems = inventories || [];
  const inventoryCount = inventoryItems.length;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('dashboard.inventory', 'Inventory')}</Text>
          <View style={styles.badgeGray}>
            <Text style={styles.badgeTextGray}>{inventoryCount}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewMoreButtonGray}
          onPress={() => NavigationService.navigate('inventory')}
        >
          <ChevronRightIcon size={22} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {inventoryCount === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No inventory items found</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {inventoryItems.slice(0, 3).map((item, index) => (
            <View key={`inventory-${index}`} style={[
              styles.cardContainer,
              index < inventoryItems.slice(0, 3).length - 1 && styles.cardWithBorder
            ]}>
              <InventoryCard item={item} />
            </View>
          ))}

          {inventoryCount > 3 && (
            <TouchableOpacity
              style={styles.viewAllButtonGray}
              onPress={() => NavigationService.navigate('inventory')}
            >
              <Text style={styles.viewAllTextGray}>View All ({inventoryCount})</Text>
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
    color: '#4B5563',
  },
  badgeGray: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeTextGray: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 12,
  },
  viewMoreButtonGray: {
    backgroundColor: '#F9FAFB',
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
  viewAllButtonGray: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllTextGray: {
    color: '#4B5563',
    fontWeight: '600',
  }
})

export default Inventory