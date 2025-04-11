import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Platform, View, Alert } from 'react-native';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/NavigationService';
import { checkAuthState } from './src/redux/slices/authSlice';
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
// Import notification dependencies
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Firebase messaging import (will only work in dev build)
// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';
// Conditionally import Firebase (will only work in dev build)
let messaging = null;
if (!isExpoGo) {
  try {
    messaging = require('@react-native-firebase/messaging').default;
    console.log('Firebase messaging imported successfully');
  } catch (error) {
    console.log('Firebase messaging import failed:', error);
  }
}
// Import notification service
import { registerForPushNotificationsAsync } from './src/services/notificationService';
// Import Firebase REST API service
import { registerExpoTokenWithFirebase } from './src/services/firebaseService';

// Configure notification handler for when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Child component to use Redux hooks
function AppContent() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [fcmToken, setFcmToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const messageListener = useRef();

  const dispatch = useDispatch();
  const { isLoggedIn, loading, user } = useSelector(state => state.auth);

  // Setup Firebase messaging if available (dev build)
  async function setupFirebaseMessaging() {
    try {
      // If Firebase messaging is not available or we're in Expo Go
      if (!messaging) {
        console.log('Firebase messaging not available, using Expo notifications only');
        await setupExpoNotifications();
        return;
      }

      console.log('Setting up Firebase Cloud Messaging...');

      // Request permission for iOS
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('iOS notification permission not granted, using Expo fallback');
          await setupExpoNotifications();
          return;
        }
      }

      // Get FCM token
      const token = await messaging().getToken();
      if (token) {
        setFcmToken(token);
        console.log('Firebase Cloud Messaging token:', token);
        await AsyncStorage.setItem('fcmToken', token);
      } else {
        console.warn('Failed to get FCM token');
        await setupExpoNotifications();
        return;
      }

      // Listen for token refresh
      const unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
        console.log('FCM token refreshed:', token);
        setFcmToken(token);
        await AsyncStorage.setItem('fcmToken', token);
      });

      // Set background message handler
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background:', remoteMessage);
      });

      // Handle foreground messages
      const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
        console.log('Firebase message received in foreground:', remoteMessage);

        // Display the notification as an alert
        Alert.alert(
          remoteMessage.notification?.title || 'New Message',
          remoteMessage.notification?.body || '',
          [{ text: 'OK' }]
        );
      });

      // Handle notification open events
      const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('App opened from background via notification:', remoteMessage);
        // Handle navigation based on the notification content
        // If needed, you can add navigation logic here
      });

      // Check if app was opened from a notification
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('App opened from quit state via notification:', initialNotification);
        // Handle navigation based on the notification content
        // If needed, you can add navigation logic here
      }

      // Store unsubscribe functions
      messageListener.current = {
        remove: () => {
          unsubscribeOnMessage();
          unsubscribeOnNotificationOpened();
          unsubscribeTokenRefresh();
        }
      };

      console.log('Firebase Cloud Messaging set up successfully');
    } catch (error) {
      console.error('Error setting up Firebase messaging:', error);
      await setupExpoNotifications();
    }
  }

  // Setup Expo notifications
  async function setupExpoNotifications() {
    try {
      // Request permission and get token
      const token = await registerForPushNotificationsAsync();

      if (token) {
        setExpoPushToken(token);
        console.log('Expo Push Token:', token);

        // Save token to AsyncStorage
        await AsyncStorage.setItem('pushNotificationToken', token);
      } else {
        console.warn('Failed to get Expo push token');
      }

      // Set up notification listeners
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        setNotification(notification);

        // Optionally show an alert for foreground notifications
        if (notification?.request?.content?.title) {
          Alert.alert(
            notification.request.content.title,
            notification.request.content.body || '',
            [{ text: 'OK' }]
          );
        }
      });

      // This listener is fired whenever a user taps on or interacts with a notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        const data = response.notification.request.content.data;

        // Handle navigation based on notification data
        // Example: if (data.screen) { navigation.navigate(data.screen, data.params); }
      });

      console.log('Expo notification listeners set up successfully');
    } catch (error) {
      console.error('Error setting up Expo notifications:', error);
    }
  }

  // Register token with Firebase when user logs in
  useEffect(() => {
    if (isLoggedIn && user?.id && expoPushToken) {
      registerExpoTokenWithFirebase(expoPushToken, user.id)
        .then(success => {
          if (success) {
            console.log('Successfully registered token with Firebase');
          }
        });
    }
  }, [isLoggedIn, user, expoPushToken]);

  useEffect(() => {
    const initializeApp = async () => {
      // Check login status
      dispatch(checkAuthState());

      // Set up notifications - try Firebase first, fallback to Expo
      await setupFirebaseMessaging();
    };

    initializeApp();

    // Clean up listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      if (messageListener.current && messageListener.current.remove) {
        messageListener.current.remove();
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