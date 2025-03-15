import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import firebaseService, { checkNotificationPermission } from '../shared/config/firebase';
import NotificationPermissionPopup from '../components/NotificationPermissionPopup';

const NotificationsScreen = () => {
    const [fcmToken, setFcmToken] = useState(null);
    const [error, setError] = useState(null);
    const [showPermissionPopup, setShowPermissionPopup] = useState(false);

    const getFCMToken = async () => {
        try {
            // First check if we have permission
            const hasPermission = await checkNotificationPermission();

            if (!hasPermission) {
                setShowPermissionPopup(true);
                return;
            }

            const token = await firebaseService.getFCMToken();
            if (token) {
                setFcmToken(token);
                console.log('FCM Token:', token);
            } else {
                setError('Could not get FCM token');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error getting FCM token:', err);
        }
    };

    useEffect(() => {
        getFCMToken();
    }, []);

    const handleAcceptNotifications = async () => {
        setShowPermissionPopup(false);
        const token = await firebaseService.getFCMToken();
        if (token) {
            setFcmToken(token);
        }
    };

    const handleDeclineNotifications = () => {
        setShowPermissionPopup(false);
        setError('Notifications permission denied');
    };

    return (
        <View>
            <Text>Notifications Screen</Text>
            {fcmToken && <Text>FCM Token: {fcmToken.substring(0, 20)}...</Text>}
            {error && <Text>Error: {error}</Text>}

            <NotificationPermissionPopup
                visible={showPermissionPopup}
                onAccept={handleAcceptNotifications}
                onDecline={handleDeclineNotifications}
            />
        </View>
    );
};

export default NotificationsScreen; 