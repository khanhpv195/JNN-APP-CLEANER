import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase project configuration - Lấy từ GoogleService-Info.plist
const FIREBASE_API_KEY = 'AIzaSyC3OKbnTdIBpw10TQeNJ1yZL87D-ixM7VI';
const FIREBASE_PROJECT_ID = 'jnn-crm';

// Firebase Authentication REST API
const FIREBASE_AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts`;
const FIREBASE_DATABASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const FIREBASE_FCM_URL = 'https://fcm.googleapis.com/fcm/send';

// Store the Expo push token in Firebase
export async function registerExpoTokenWithFirebase(expoPushToken, userId) {
  try {
    if (!expoPushToken || !userId) {
      console.error('Missing token or userId');
      return false;
    }

    const tokenData = {
      fields: {
        token: { stringValue: expoPushToken },
        platform: { stringValue: Platform.OS },
        deviceId: { stringValue: await getDeviceId() },
        userId: { stringValue: userId },
        createdAt: { timestampValue: new Date().toISOString() }
      }
    };

    const response = await fetch(`${FIREBASE_DATABASE_URL}/pushTokens/${userId}_${Platform.OS}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenData)
    });

    if (!response.ok) {
      throw new Error(`Error storing token: ${response.status}`);
    }

    console.log('Successfully registered Expo Push Token with Firebase');
    return true;
  } catch (error) {
    console.error('Error registering token with Firebase:', error);
    return false;
  }
}

// Get a unique device identifier (or generate one)
async function getDeviceId() {
  try {
    let deviceId = await AsyncStorage.getItem('deviceId');
    
    if (!deviceId) {
      deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting deviceId:', error);
    return `${Platform.OS}_${Date.now()}`;
  }
}

// Send a notification using Firebase Cloud Messaging REST API
export async function sendPushNotification(targetToken, title, body, data = {}) {
  try {
    // You need a server key from Firebase console
    const FIREBASE_SERVER_KEY = 'YOUR_FIREBASE_SERVER_KEY'; // This should be stored securely on your server
    
    const message = {
      to: targetToken,
      notification: {
        title,
        body,
        sound: 'default',
      },
      data,
    };

    // In a real app, this should be done from your server, not client-side
    // This is just for demo purposes
    const response = await fetch(FIREBASE_FCM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify(message),
    });

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return null;
  }
}

// Fetch notifications from Firestore
export async function fetchUserNotifications(userId, limit = 20) {
  try {
    if (!userId) return [];
    
    const response = await fetch(
      `${FIREBASE_DATABASE_URL}/userNotifications?` +
      `orderBy=createdAt` +
      `&where.fields.userId.stringValue=${userId}` +
      `&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching notifications: ${response.status}`);
    }

    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
}

// Update notification status (read/unread)
export async function updateNotificationStatus(notificationId, isRead) {
  try {
    const updateData = {
      fields: {
        isRead: { booleanValue: isRead },
        updatedAt: { timestampValue: new Date().toISOString() }
      }
    };

    const response = await fetch(`${FIREBASE_DATABASE_URL}/userNotifications/${notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`Error updating notification: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating notification status:', error);
    return false;
  }
} 