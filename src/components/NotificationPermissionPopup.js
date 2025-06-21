import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

const NotificationPermissionPopup = ({ visible, onAccept, onDecline }) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <Text style={styles.title}>Bật thông báo</Text>

                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🔔</Text>
                    </View>

                    <Text style={styles.description}>
                        Cho phép ứng dụng gửi thông báo để nhận các cập nhật quan trọng về:
                    </Text>

                    <View style={styles.bulletPoints}>
                        <Text style={styles.bulletPoint}>• Trạng thái đơn hàng</Text>
                        <Text style={styles.bulletPoint}>• Thông báo mới</Text>
                        <Text style={styles.bulletPoint}>• Cập nhật quan trọng</Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.declineButton]}
                            onPress={onDecline}
                        >
                            <Text style={[styles.buttonText, styles.declineText]}>Để sau</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.acceptButton]}
                            onPress={onAccept}
                        >
                            <Text style={[styles.buttonText, styles.acceptText]}>Cho phép</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxWidth: 340,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: '#333',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    icon: {
        fontSize: 40,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
        textAlign: 'left',
    },
    bulletPoints: {
        marginBottom: 20,
        paddingLeft: 10,
    },
    bulletPoint: {
        fontSize: 15,
        color: '#666',
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#007AFF',
    },
    declineButton: {
        backgroundColor: '#f5f5f5',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    acceptText: {
        color: 'white',
    },
    declineText: {
        color: '#666',
    },
});

export default NotificationPermissionPopup; 