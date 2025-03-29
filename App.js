import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Platform, View } from 'react-native';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/NavigationService';
import { checkAuthState } from './src/redux/slices/authSlice';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  removeNotificationListeners
} from './src/services/notificationService';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/shared/api/queryClient';
import "./global.css"
import Toast from 'react-native-toast-message';
import { ThemeProvider } from './src/shared/theme';
import ThemedStatusBar from './src/components/ThemedStatusBar';
import { ThemedTailwindProvider } from './src/styles/ThemedTailwind';
// Import i18n configuration
import './src/translations/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/translations/i18n';

// Child component to use Redux hooks
function AppContent() {
  const dispatch = useDispatch();
  const { isLoggedIn, loading, user } = useSelector(state => state.auth);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);
  const notificationListeners = useRef(null);

  useEffect(() => {
    const initializeApp = async () => {
      // Check login status
      dispatch(checkAuthState());

      // Set up notifications
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        try {
          if (!expoPushToken) {
            const token = await registerForPushNotificationsAsync();
            setExpoPushToken(token);
          }

          if (!notificationListeners.current) {
            notificationListeners.current = setupNotificationListeners(
              notification => {
                setNotification(notification);
              },
              response => {
                const data = response.notification.request.content.data;
                NavigationService?.navigate(data.screen, data.params);
              }
            );
          }
        } catch (error) {
          console.log('Error setting up notifications:', error);
        }
      }
    };

    initializeApp();

    // Cleanup
    return () => {
      if (notificationListeners.current) {
        removeNotificationListeners(notificationListeners.current);
      }
    };
  }, [dispatch]);


  if (loading) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <ThemedStatusBar />
      <AppNavigator />
    </NavigationContainer>
  );
}

// Main component
export default function App() {


  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ThemeProvider>
            <ThemedTailwindProvider>
              <AppContent />
              <Toast />
            </ThemedTailwindProvider>
          </ThemeProvider>
        </Provider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}