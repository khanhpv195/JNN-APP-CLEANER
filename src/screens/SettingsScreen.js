import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { logout } from '@/redux/slices/authSlice';

export default function SettingsScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Navigation handlers
  const navigateToLanguageSettings = () => {
    navigation.navigate('LanguageSettings');
  };

  const navigateToThemeSettings = () => {
    navigation.navigate('ThemeSettings');
  };

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

  const navigateToBankInformation = () => {
    navigation.navigate('AccountBank');
  };

  // Dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.primary,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    section: {
      backgroundColor: theme.card,
      margin: 16,
      borderRadius: 8,
      padding: 16,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      color: theme.text,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border || '#eee',
    },
    settingLabel: {
      fontSize: 16,
      color: theme.text,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileContainer: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
      backgroundColor: theme.primary,
    },
    profileName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    profileEmail: {
      fontSize: 16,
      color: theme.textSecondary || '#777',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>{t('settings.title', 'Settings')}</Text>
      </View>

      <ScrollView>
        {/* Profile Section (if user is available) */}
        {user && (
          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.profileContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={dynamicStyles.profileImage} />
              ) : (
                <View style={dynamicStyles.profileImage}>
                  <Text style={{ fontSize: 40, color: 'white', textAlign: 'center', lineHeight: 100 }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <Text style={dynamicStyles.profileName}>{user.name || 'User'}</Text>
              <Text style={dynamicStyles.profileEmail}>{user.email || ''}</Text>
            </View>
          </View>
        )}

        {/* Settings Options */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.title', 'Settings')}</Text>

          {/* Language Settings Option */}
          <TouchableOpacity
            style={dynamicStyles.settingItem}
            onPress={navigateToLanguageSettings}
          >
            <View style={dynamicStyles.settingRow}>
              <Ionicons name="language-outline" size={24} color={theme.primary} style={{ marginRight: 16 }} />
              <Text style={dynamicStyles.settingLabel}>{t('settings.language', 'Language')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#777" />
          </TouchableOpacity>

          {/* Theme Settings Option */}
          <TouchableOpacity
            style={dynamicStyles.settingItem}
            onPress={navigateToThemeSettings}
          >
            <View style={dynamicStyles.settingRow}>
              <Ionicons name="color-palette-outline" size={24} color={theme.primary} style={{ marginRight: 16 }} />
              <Text style={dynamicStyles.settingLabel}>{t('settings.theme', 'Theme')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#777" />
          </TouchableOpacity>

          {/* Bank Information Option */}
          <TouchableOpacity
            style={dynamicStyles.settingItem}
            onPress={navigateToBankInformation}
          >
            <View style={dynamicStyles.settingRow}>
              <Ionicons name="cash-outline" size={24} color={theme.primary} style={{ marginRight: 16 }} />
              <Text style={dynamicStyles.settingLabel}>{t('settings.bankInformation', 'Bank Information')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#777" />
          </TouchableOpacity>

          {/* Logout Option */}
          <TouchableOpacity
            style={[dynamicStyles.settingItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <View style={dynamicStyles.settingRow}>
              <Ionicons name="log-out-outline" size={24} color={theme.error || '#FF3B30'} style={{ marginRight: 16 }} />
              <Text style={[dynamicStyles.settingLabel, { color: theme.error || '#FF3B30' }]}>{t('account.signOut', 'Sign out')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.error || '#FF3B30'} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.about', 'About')}</Text>

          {/* App Version */}
          <View style={[dynamicStyles.settingItem, { borderBottomWidth: 0 }]}>
            <Text style={dynamicStyles.settingLabel}>Version</Text>
            <Text style={{ color: theme.textSecondary || '#777' }}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}