import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { initializeFirebaseMessaging } from '../config/firebase';

export default function TestNotification() {
    const [token, setToken] = useState(null);
    const [status, setStatus] = useState('');

    const requestPermissionAndToken = async () => {
        try {
            setStatus('Đang xin quyền và lấy token...');
            const fcmToken = await initializeFirebaseMessaging();
            if (fcmToken) {
                setToken(fcmToken);
                setStatus('Đã lấy được token!');
            } else {
                setStatus('Không lấy được token');
            }
        } catch (error) {
            setStatus('Lỗi: ' + error.message);
        }
    };

    const copyToken = () => {
        if (token) {
            navigator.clipboard.writeText(token)
                .then(() => setStatus('Đã copy token!'))
                .catch(err => setStatus('Lỗi copy: ' + err.message));
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={requestPermissionAndToken}
            >
                <Text style={styles.buttonText}>
                    Xin quyền & Lấy FCM Token
                </Text>
            </TouchableOpacity>

            {status ? (
                <Text style={styles.status}>{status}</Text>
            ) : null}

            {token ? (
                <View style={styles.tokenContainer}>
                    <Text style={styles.tokenLabel}>FCM Token:</Text>
                    <Text style={styles.token} numberOfLines={3}>
                        {token}
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, styles.copyButton]}
                        onPress={copyToken}
                    >
                        <Text style={styles.buttonText}>Copy Token</Text>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    status: {
        marginVertical: 10,
        color: '#666',
    },
    tokenContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    tokenLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    token: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
    },
    copyButton: {
        backgroundColor: '#2196F3',
    },
}); 