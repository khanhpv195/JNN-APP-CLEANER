import React from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import NavigationService from '@/navigation/NavigationService';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/components';
import { useTranslation } from 'react-i18next';

export default function AccountScreen() {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { theme } = useTheme();
    const { t } = useTranslation();

    const handleLogout = () => {
        Alert.alert(
            t('account.logout', "Logout"),
            t('account.logoutConfirmation', "Are you sure you want to logout?"),
            [
                {
                    text: t('common.cancel', "Cancel"),
                    style: "cancel"
                },
                {
                    text: t('account.logout', "Logout"),
                    onPress: () => {
                        dispatch(logout());
                        Alert.alert(
                            t('account.logoutSuccess', "Logout successfully"),
                            t('account.logoutMessage', "You have logged out of the application.")
                        );
                    }
                }
            ]
        );
    };

    // Create dynamic styles with the current theme
    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            backgroundColor: theme.primary,
            padding: 16,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
        },
        profileSection: {
            backgroundColor: theme.card,
            padding: 20,
            marginBottom: 20,
        },
        username: {
            fontSize: 18,
            fontWeight: '500',
            color: theme.text,
        },
        menuSection: {
            backgroundColor: theme.card,
            paddingHorizontal: 16,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        menuText: {
            fontSize: 16,
            color: theme.text,
        },
        signOutText: {
            color: theme.error || '#FF3B30',
        },
    });

    return (
        <SafeAreaView style={dynamicStyles.container}>
            {/* Header */}
            <View style={dynamicStyles.header}>
                <ThemedText style={dynamicStyles.headerTitle}>{t('navigation.profile', 'Profile')}</ThemedText>
            </View>

            {/* Profile Info */}
            <View style={dynamicStyles.profileSection}>
                <View style={styles.avatarContainer}>
                    <ThemedText style={dynamicStyles.username}>{user?.email}</ThemedText>
                </View>
            </View>

            {/* Menu Items */}
            <View style={dynamicStyles.menuSection}>


                <TouchableOpacity
                    style={dynamicStyles.menuItem}
                    onPress={() => {
                        NavigationService.navigate('ChangePassword');
                    }}
                >
                    <ThemedText style={dynamicStyles.menuText}>{t('account.changePassword', 'Change password')}</ThemedText>
                    <Ionicons name="lock-closed-outline" size={24} color={theme.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={dynamicStyles.menuItem}
                    onPress={() => {
                        NavigationService.navigate('Settings');
                    }}
                >
                    <ThemedText style={dynamicStyles.menuText}>{t('settings.title', 'Settings')}</ThemedText>
                    <Ionicons name="settings-outline" size={24} color={theme.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[dynamicStyles.menuItem, styles.signOutItem]}
                    onPress={handleLogout}
                >
                    <ThemedText style={[dynamicStyles.menuText, dynamicStyles.signOutText]}>{t('account.signOut', 'Sign out')}</ThemedText>
                    <Ionicons name="log-out-outline" size={24} color={theme.error || '#FF3B30'} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Static styles that don't depend on the theme
const styles = StyleSheet.create({
    avatarContainer: {
        alignItems: 'center',
    },
    signOutItem: {
        borderBottomWidth: 0,
    },
});