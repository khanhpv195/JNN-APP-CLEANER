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
        // Only proceed on physical devices
        if (!Device.isDevice) {
            console.log('Push notifications are only available on physical devices');
            return null;
        }
        
        // Check if we already have a stored token
        const storedToken = await AsyncStorage.getItem('pushNotificationToken');
        if (storedToken) {
            console.log('Found stored push token:', storedToken);
            return storedToken;
        }
        
        // Set up notification channels for Android
        if (Platform.OS === 'android') {
            await setupNotificationChannels();
        }
        
        // Check current permission status
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        // Request permission if not already granted
        if (existingStatus !== 'granted') {
            console.log('Requesting notification permission...');
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        
        // Exit if permission denied
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token: Permission denied');
            return null;
        }
        
        // Get the Expo push token
        console.log('Getting Expo push token...');
        console.log('Project ID:', Constants.expoConfig?.extra?.eas?.projectId);
        
        // Try to get token with or without projectId
        try {
            // First try with projectId
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            })).data;
        } catch (projectIdError) {
            console.warn('Error getting token with projectId:', projectIdError);
            
            // Try without projectId as fallback
            try {
                token = (await Notifications.getExpoPushTokenAsync()).data;
            } catch (tokenError) {
                console.error('Failed to get push token:', tokenError);
                return null;
            }
        }
        
        console.log('Expo Push Token obtained:', token);
        
        // Save tokens
        if (token) {
            await AsyncStorage.setItem('pushNotificationToken', token);
            console.log('Push token saved to AsyncStorage');
        }
        
        return token;
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