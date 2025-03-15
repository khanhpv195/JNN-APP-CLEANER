import { useLayoutEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Image, StyleSheet } from 'react-native';
import { ChevronRightIcon, BellIcon, Cog8ToothIcon } from 'react-native-heroicons/outline';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import NavigationService from '@/navigation/NavigationService';
import Logo from '../../../assets/images/Logo.png'
import { Colors } from '@/shared/constants/colors';

// Components
import Chart from './components/Chart';
import MaintainRequest from './components/MaintanRequest';
import CleanSchedule from './components/CleanSchedule';
import Inventory from './components/Inventory';

const DashboardScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation()
  const route = useRoute()


  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerLeft: () => (
        <View className="py-2 ml-4 rounded-full">
          <Image source={Logo} />
        </View>
      ),
      headerRight: () => (
        <View className="flex-row gap-4 mr-4 items-center">
          <TouchableOpacity className="py-2 rounded-full">
            <BellIcon size={30} color={Colors.neutral} />
          </TouchableOpacity>
          <TouchableOpacity className="py-2 rounded-full" onPress={() => NavigationService.navigate('Settings')}>
            <Cog8ToothIcon size={30} color={Colors.neutral} />
          </TouchableOpacity>
        </View>
      )
    });
  }, [navigation, route])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Filter */}
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>{t('dashboard.performance', 'Performance')}</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>{t('dashboard.filter', 'Filter')}</Text>
            <ChevronRightIcon size={20} color="#000" className="rotate-90" />
          </TouchableOpacity>
        </View>
        
        {/* Performance Chart */}
        <View style={styles.chartContainer}>
          <Chart />
        </View>

        {/* Maintenance Request Section */}
        <View style={styles.sectionContainer}>
          <MaintainRequest />
        </View>

        {/* Cleaning Schedule Section */}
        <View style={styles.sectionContainer}>
          <CleanSchedule />
        </View>

        {/* Inventory Section */}
        <View style={styles.sectionContainer}>
          <Inventory />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8fa',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterText: {
    marginRight: 8,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: 'white',
    marginBottom: 12,
    paddingBottom: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f8fa',
  },
  sectionContainer: {
    backgroundColor: 'white',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f8fa',
  }
});

export default DashboardScreen;