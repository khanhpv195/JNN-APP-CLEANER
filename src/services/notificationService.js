import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Remove Firebase import for Expo Go compatibility

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Create notification channels for Android using Expo Notifications
export async function setupNotificationChannels() {
    if (Platform.OS === 'android') {
        try {
            // Create channel for messages
            await Notifications.setNotificationChannelAsync('messages', {
                name: 'Messages',
                description: 'Notifications for new messages',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#2196F3', // Blue color
                sound: 'default',
                enableVibrate: true,
                enableLights: true,
            });

            // Create channel for system notifications
            await Notifications.setNotificationChannelAsync('system', {
                name: 'System Notifications',
                description: 'System and app notifications',
                importance: Notifications.AndroidImportance.DEFAULT,
                vibrationPattern: [0, 100, 200, 100],
                sound: 'default',
            });

            // Create channel for maintenance notifications
            await Notifications.setNotificationChannelAsync('maintenance', {
                name: 'Maintenance Notifications',
                description: 'Notifications for maintenance tasks and updates',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#4CAF50', // Green color
                sound: 'default',
                enableVibrate: true,
                enableLights: true,
            });

            console.log('Expo notification channels created successfully');
        } catch (error) {
            console.error('Failed to create notification channels:', error);
        }
    }
};

// Register device for push notifications and get Expo Push Token
export async function registerForPushNotificationsAsync() {
    let token;

    try {
        console.log('Starting push notification registration...');

        // Only proceed on physical devices
        if (!Device.isDevice) {
            console.log('Push notifications are only available on physical devices');
            return null;
        }

        // Don't use stored token in production builds to ensure fresh token each time
        if (__DEV__) {
            // Check if we already have a stored token (only in development)
            const storedToken = await AsyncStorage.getItem('pushNotificationToken');
            if (storedToken) {
                console.log('Found stored push token:', storedToken);
                return storedToken;
            }
        }

        // Set up notification channels for Android
        if (Platform.OS === 'android') {
            await setupNotificationChannels();
        }

        // Check current permission status
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        console.log('Current notification permission status:', existingStatus);

        // Request permission if not already granted
        if (existingStatus !== 'granted') {
            console.log('Requesting notification permission...');
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
            console.log('New permission status:', finalStatus);
        }

        // Exit if permission denied
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token: Permission denied');
            return null;
        }

        // Get the projectId - try multiple ways to access it based on environment
        let projectId = null;

        // Try to get projectId from Constants (structure might differ between environments)
        if (Constants.expoConfig?.extra?.eas?.projectId) {
            projectId = Constants.expoConfig.extra.eas.projectId;
            console.log('Found projectId in Constants.expoConfig.extra.eas:', projectId);
        } else if (Constants.manifest?.extra?.eas?.projectId) {
            projectId = Constants.manifest.extra.eas.projectId;
            console.log('Found projectId in Constants.manifest.extra.eas:', projectId);
        } else if (Constants.manifest2?.extra?.expoClient?.projectId) {
            projectId = Constants.manifest2.extra.expoClient.projectId;
            console.log('Found projectId in Constants.manifest2.extra.expoClient:', projectId);
        } else if (Constants.expoConfig?.extra?.expoClient?.projectId) {
            projectId = Constants.expoConfig.extra.expoClient.projectId;
            console.log('Found projectId in Constants.expoConfig.extra.expoClient:', projectId);
        } else {
            console.warn('Could not find projectId in Constants. Available Constants:', JSON.stringify(Constants, null, 2));
        }

        // Log our attempt to get the Expo push token
        console.log('Getting Expo push token with projectId:', projectId);

        // Try different methods to get token based on environment
        try {
            if (projectId) {
                // Try with projectId first if available
                console.log('Attempting to get token with projectId');
                token = (await Notifications.getExpoPushTokenAsync({
                    projectId: projectId
                })).data;
                console.log('Successfully got token with projectId');
            } else {
                // Fallback without projectId
                console.log('Attempting to get token without projectId');
                token = (await Notifications.getExpoPushTokenAsync()).data;
                console.log('Successfully got token without projectId');
            }
        } catch (firstError) {
            console.error('First attempt to get push token failed:', firstError);

            // Try the opposite approach
            try {
                if (projectId) {
                    // If using projectId failed, try without it
                    console.log('First attempt with projectId failed, trying without projectId');
                    token = (await Notifications.getExpoPushTokenAsync()).data;
                } else {
                    // If not using projectId failed, try hardcoding the JNN CRM projectId
                    // This is just a fallback - replace with your actual project ID
                    console.log('First attempt without projectId failed, trying with hardcoded projectId');
                    token = (await Notifications.getExpoPushTokenAsync({
                        projectId: 'jnn-crm' // Replace with your Expo project ID
                    })).data;
                }
            } catch (secondError) {
                console.error('All attempts to get push token failed:', secondError);
                return null;
            }
        }

        if (token) {
            console.log('Expo Push Token obtained:', token);

            // Save token to AsyncStorage
            await AsyncStorage.setItem('pushNotificationToken', token);
            console.log('Push token saved to AsyncStorage');

            return token;
        } else {
            console.error('Failed to obtain Expo Push Token');
            return null;
        }
    } catch (error) {
        console.error('Error in registerForPushNotificationsAsync:', error);
        return null;
    }
}

// Send a local notification (for testing)
export async function sendLocalNotification(title, body, data = {}) {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                data: data,
            },
            trigger: { seconds: 1 },
        });
        console.log('Local notification scheduled');
        return true;
    } catch (error) {
        console.error('Error sending local notification:', error);
        return false;
    }
}

// Set up notification listeners
export function setupNotificationListeners(onNotification, onNotificationResponse) {
    // When a notification is received while the app is running
    const notificationListener = Notifications.addNotificationReceivedListener(
        notification => {
            console.log('Notification received in foreground:', notification);
            if (onNotification) onNotification(notification);
        }
    );

    // When the user interacts with a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(
        response => {
            console.log('User interacted with notification:', response);
            if (onNotificationResponse) onNotificationResponse(response);
        }
    );

    return { notificationListener, responseListener };
}

// Remove notification listeners
export function removeNotificationListeners(listeners) {
    if (listeners?.notificationListener) {
        Notifications.removeNotificationSubscription(listeners.notificationListener);
    }
    if (listeners?.responseListener) {
        Notifications.removeNotificationSubscription(listeners.responseListener);
    }
}

// Test notification functionality
export async function testNotification() {
    try {
        // Get the token first - this will also check permissions
        const token = await registerForPushNotificationsAsync();

        if (!token) {
            return {
                success: false,
                message: 'Could not get notification token. Please check permissions.'
            };
        }

        // With Expo Go, we should have an Expo push token
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Test Notification",
                body: "This is a test notification to verify permissions are working",
                data: { type: 'test' },
            },
            trigger: null, // Send immediately
        });

        console.log('Test notification sent with ID:', notificationId);

        return {
            success: true,
            message: 'Expo push token obtained and test notification sent',
            token: token,
            notificationId
        };
    } catch (error) {
        console.error('Failed to send test notification:', error);
        return {
            success: false,
            message: `Error: ${error.message}`
        };
    }
}