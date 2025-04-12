import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/authentication/ForgotPassword';
import SettingsScreen from '../screens/SettingsScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';
import HomeScreen from '../screens/HomeScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import RequestScreen from '../screens/RequestScreen';
import PropertyProblemScreen from '../screens/PropertyProblemScreen';
import AccountBankScreen from '../screens/AccountBankScreen';
import CompletedChecklistScreen from '../screens/CompletedChecklistScreen';
import { useTheme } from '../shared/theme';
import InventoryNavigator from './inventory';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


function MainAppNavigator() {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <Tab.Navigator screenOptions={() => ({
            headerShown: false,
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: {
                backgroundColor: theme.background,
                borderTopColor: theme.border
            }
        })}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: t('navigation.home'),
                    tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={24} />,
                }}
            />
            <Tab.Screen
                name="Requests"
                component={RequestScreen}
                options={{
                    title: t('navigation.requests', 'Requests'),
                    tabBarIcon: ({ color }) => <Ionicons name="notifications" color={color} size={24} />,
                }}
            />
            <Tab.Screen
                name="Inventory"
                component={InventoryNavigator}
                options={{
                    title: t('navigation.inventory', 'Inventory'),
                    tabBarIcon: ({ color }) => <Ionicons name="list" color={color} size={24} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: t('settings.title', 'Settings'),
                    tabBarIcon: ({ color }) => <Ionicons name="settings" color={color} size={24} />,
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { isLoggedIn } = useSelector(state => state.auth);
    const { theme } = useTheme();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Main" component={MainAppNavigator} />
                    <Stack.Screen
                        name="TaskDetail"
                        component={TaskDetailsScreen}
                        options={{
                            headerShown: true,
                            title: 'Task Details',
                            headerStyle: {
                                backgroundColor: theme.background,
                            },
                            headerTintColor: theme.text,
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                        }}
                    />
                    <Stack.Screen
                        name="CompletedChecklist"
                        component={CompletedChecklistScreen}
                        options={{
                            title: 'Completed Checklist',
                            headerShown: true
                        }}
                    />
                    <Stack.Screen
                        name="PropertyProblem"
                        component={PropertyProblemScreen}
                        options={{ headerShown: true, title: 'Property Problem' }}
                    />
                    <Stack.Screen
                        name="AccountBank"
                        component={AccountBankScreen}
                        options={{ headerShown: false, title: 'Bank Information' }}
                    />

                    <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} options={{ headerShown: false }} />
                </>
            )}
        </Stack.Navigator>
    );
} 