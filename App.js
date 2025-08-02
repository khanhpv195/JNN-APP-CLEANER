import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider, useDispatch, useSelector } from 'react-redux';
import "./global.css";
import ThemedStatusBar from './src/components/ThemedStatusBar';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/NavigationService';
import { checkAuthState } from './src/redux/slices/authSlice';
import { store } from './src/redux/store';
import { queryClient } from './src/shared/api/queryClient';
import { ThemeProvider } from './src/shared/theme';
import { ThemedTailwindProvider } from './src/styles/ThemedTailwind';
// Import i18n configuration
import { I18nextProvider } from 'react-i18next';
import './src/translations/i18n';
import i18n from './src/translations/i18n';
// Import notification dependencies
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
// Import notification service
import { registerForPushNotificationsAsync } from './src/services/notificationService';
// Import Expo Updates
import * as Updates from 'expo-updates';
// Import session handlers
import { initializeSessionHandlers } from './src/services/registerSessionHandlers';

// Initialize session handlers
initializeSessionHandlers();

// Configure notification handler for when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Check for updates function with channel support
async function checkForUpdates() {
  try {
    // Check if running in development mode
    if (__DEV__) {
      console.log('Update checking disabled in development mode');
      return;
    }

    if (!Updates.checkForUpdateAsync) {
      console.log('Updates.checkForUpdateAsync is not available');
      return;
    }

    console.log('Checking for updates...');
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      Alert.alert(
        "Update Available",
        "A new version is available. Would you like to update now?",
        [
          {
            text: "Later",
            style: "cancel"
          },
          {
            text: "Update",
            onPress: async () => {
              try {
                console.log('Fetching update...');
                await Updates.fetchUpdateAsync();
                Alert.alert(
                  "Update Ready",
                  "The update has been downloaded. The app will now restart to apply the changes.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        console.log('Reloading app with update...');
                        Updates.reloadAsync();
                      }
                    }
                  ]
                );
              } catch (error) {
                Alert.alert("Error", "Failed to download the update. Please try again later.");
                console.error('Error fetching update:', error);
              }
            }
          }
        ]
      );
    } else {
      console.log('No updates available');
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

// Child component to use Redux hooks
function AppContent() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const dispatch = useDispatch();
  const { isLoggedIn, loading, user } = useSelector(state => state.auth);

  // Setup Expo notifications
  async function setupExpoNotifications() {
    try {
      console.log('Setting up Expo notifications...');

      // Request permission and get token
      const token = await registerForPushNotificationsAsync();

      if (token) {
        setExpoPushToken(token);
        console.log('Expo Push Token successfully set in component state:', token);

        // Save token to AsyncStorage
        await AsyncStorage.setItem('pushNotificationToken', token);
        console.log('Push token saved to AsyncStorage from AppContent');
      } else {
        console.warn('Failed to get Expo push token in setupExpoNotifications');
      }

      // Set up notification listeners
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        setNotification(notification);
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

  // Get a new expo token when user logs in if we don't have one
  useEffect(() => {
    if (isLoggedIn && user?.id && !expoPushToken) {
      const getToken = async () => {
        try {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            setExpoPushToken(token);
            console.log('Got new Expo push token after login:', token);
            await AsyncStorage.setItem('pushNotificationToken', token);
          }
        } catch (error) {
          console.error('Error getting token after login:', error);
        }
      };

      getToken();
    }
  }, [isLoggedIn, user, expoPushToken]);

  useEffect(() => {
    const initializeApp = async () => {
      // Check login status
      dispatch(checkAuthState());

      // Set up notifications
      await setupExpoNotifications();

      // Check for updates when app starts (if not in development mode)
      if (!__DEV__) {
        await checkForUpdates();
      }
    };

    initializeApp();

    // Setup event listener for when app resumes from background (if not in development mode)
    let updateSubscription;
    if (!__DEV__ && Updates.useUpdateEvents) {
      console.log('Setting up update event listeners');
      try {
        updateSubscription = Updates.useUpdateEvents(event => {
          if (event.type === Updates.UpdateEventType.UPDATE_AVAILABLE) {
            console.log('Update event detected: UPDATE_AVAILABLE');
            checkForUpdates();
          } else if (event.type === Updates.UpdateEventType.NO_UPDATE_AVAILABLE) {
            console.log('Update event detected: NO_UPDATE_AVAILABLE');
          } else {
            console.log('Update event detected:', event.type);
          }
        });
      } catch (error) {
        console.error('Error setting up update events:', error);
      }
    } else if (!__DEV__ && Updates.addListener) {
      console.log('Setting up legacy update listeners');
      try {
        updateSubscription = Updates.addListener(async (event) => {
          console.log('Update event detected:', event.type);
          if (event.type === Updates.UpdateEventType.UPDATE_AVAILABLE) {
            await checkForUpdates();
          }
        });
      } catch (error) {
        console.error('Error setting up update listeners:', error);
      }
    }

    // Clean up listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      if (updateSubscription && updateSubscription.remove) {
        updateSubscription.remove();
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