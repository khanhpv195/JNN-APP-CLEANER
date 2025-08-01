import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import InventoryListScreen from '../../screens/InventoryListScreen';
import InventoryCreateScreen from '../../screens/InventoryCreateScreen';
import InventoryDetailScreen from '../../screens/InventoryDetailScreen';
const ProjectStack = createStackNavigator();

export default function InventoryNavigator() {
    const { t } = useTranslation();

    return (
        <ProjectStack.Navigator screenOptions={{ headerShown: false }}>
            <ProjectStack.Screen
                name="inventory"
                component={InventoryListScreen}
                options={({ navigation }) => ({
                    tabBarIcon: ({ color }) => <Ionicons name="albums" color={color} size={24} />,
                    title: t('navigation.inventory'),
                    headerShown: false,
                })}
            />
            <ProjectStack.Screen
                name="detail_inventory"
                component={InventoryDetailScreen}
                options={({ navigation }) => ({
                    headerShown: false
                })}
            />

            <ProjectStack.Screen
                name="create_inventory"
                component={InventoryCreateScreen}
                options={({ navigation }) => ({
                    headerShown: false,
                })}
            />
        </ProjectStack.Navigator>
    );
}