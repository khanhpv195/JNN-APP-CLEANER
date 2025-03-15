import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Create notification channels for Android
export async function setupNotificationChannels() {
    if (Platform.OS === 'android') {
        // Tạo channel cho tin nhắn
        await Notifications.setNotificationChannelAsync('messages', {
            name: 'Messages',
            description: 'Notifications for new messages',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2196F3', // Màu xanh dương
            sound: 'default',
            enableVibrate: true,
            enableLights: true,
        });

        // Tạo channel cho thông báo hệ thống
        await Notifications.setNotificationChannelAsync('system', {
            name: 'System Notifications',
            description: 'System and app notifications',
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 100, 200, 100],
            sound: 'default',
        });
        
        console.log('Notification channels created');
    }
};

// Register device for push notifications
export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
        if (Device.isDevice) {
            // Thiết lập các kênh thông báo
            await setupNotificationChannels();

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return null;
            }

            // Get the Expo push token
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            })).data;

            console.log('Expo Push Token:', token);
        } else {
            return null;
        }
    }

    return token;
}

// Send a local notification (for testing)
export async function sendLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            data: data,
        },
        trigger: { seconds: 1 },
    });
}

// Set up notification listeners
export function setupNotificationListeners(onNotification, onNotificationResponse) {
    // When a notification is received while the app is running
    const notificationListener = Notifications.addNotificationReceivedListener(
        notification => {
            console.log('Notification received:', notification);
            if (onNotification) onNotification(notification);
        }
    );

    // When the user interacts with a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(
        response => {
            console.log('Notification response:', response);
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