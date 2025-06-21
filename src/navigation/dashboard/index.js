import { createStackNavigator } from '@react-navigation/stack';
import { FunnelIcon, ArrowLeftIcon } from 'react-native-heroicons/outline'
import { TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next';

import HomeScreen from '@/screens/HomeScreen';
import MaintenanceScreen from '@/screens/dashboard/MaintenanceScreen';
import CleaningScheduleScreen from '@/screens/dashboard/CleaningScheduleScreen';

const ProjectStack = createStackNavigator();

export default function DashboardNavigator() {
  const { t } = useTranslation();

  return (
    <ProjectStack.Navigator screenOptions={{ headerShown: true }}>
      <ProjectStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: t('navigation.home')
        }}
      />
      <ProjectStack.Screen
        name="maintenance"
        component={MaintenanceScreen}
        options={({ navigation }) => ({
          title: t('navigation.maintenance', 'Maintenance'),
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#000',
          },
          headerRight: () => (
            <View style={{/* was: className="py-2 mr-4 px-2 bg-[#EFF8FF] rounded-full" */}}>
              <FunnelIcon size={20} color="#2E90FA" />
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{/* was: className="py-2 px-2 ml-4 bg-neutral-50 rounded-full" */}}>
              <ArrowLeftIcon size={20} color="#000" />
            </TouchableOpacity>
          )
        })
        }
      />

      <ProjectStack.Screen
        name="cleaning-schedule"
        component={CleaningScheduleScreen}
        options={({ navigation }) => ({
          title: t('navigation.cleaningSchedule', 'Cleaning Schedule'),
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#000',
          },
          headerRight: () => (
            <View style={{/* was: className="py-2 mr-4 px-2 bg-[#EFF8FF] rounded-full" */}}>
              <FunnelIcon size={20} color="#2E90FA" />
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{/* was: className="py-2 px-2 ml-4 bg-neutral-50 rounded-full" */}}>
              <ArrowLeftIcon size={20} color="#000" />
            </TouchableOpacity>
          )
        })
        }
      />
    </ProjectStack.Navigator>
  );
}