import NavigationService from '@/navigation/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Flag to prevent multiple session expiration handlers from running simultaneously
let isHandlingSessionExpiration = false;

// This function will be called by fetch.js when a session expires
export const handleSessionExpiration = async () => {
  // Only handle session expiration once to prevent loops
  if (isHandlingSessionExpiration) {
    console.log('Already handling session expiration, skipping...');
    return;
  }

  isHandlingSessionExpiration = true;
  console.log('Authentication error, clearing session and redirecting to login');

  try {
    // Clear stored credentials
    await AsyncStorage.multiRemove(['accessToken', 'user']);

    // Don't navigate if we're already on the Login screen
    const currentRouteName = NavigationService.getCurrentRoute();
    console.log('Current route before session expired navigation:', currentRouteName);

    if (currentRouteName !== 'Login') {
      // Navigate to login screen with a delay
      setTimeout(() => {
        NavigationService.navigate('Login', { sessionExpired: true });
        // Reset the flag after navigation is complete
        setTimeout(() => {
          isHandlingSessionExpiration = false;
          console.log('Session expiration handler completed, flag reset');
        }, 1000);
      }, 100);
    } else {
      // Reset the flag since we're not navigating
      setTimeout(() => {
        isHandlingSessionExpiration = false;
        console.log('Already on login screen, session expiration handler completed');
      }, 1000);
    }
  } catch (error) {
    console.error('Error in session expiration handler:', error);
    isHandlingSessionExpiration = false;
  }
};

// Function to register a callback that will be called when session expires
// This will be used by authSlice.js to update the Redux state
let sessionExpirationCallbacks = [];

export const registerSessionExpirationCallback = (callback) => {
  sessionExpirationCallbacks.push(callback);
};

// Function to trigger all registered callbacks
export const notifySessionExpired = () => {
  sessionExpirationCallbacks.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('Error in session expiration callback:', error);
    }
  });
}; 