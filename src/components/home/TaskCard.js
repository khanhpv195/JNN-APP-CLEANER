import React, { memo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeLinearGradient from '../common/SafeLinearGradient';
import { hapticFeedback } from '../../utils/haptics';

const TaskCard = memo(({ 
    task, 
    onPress, 
    onBookingInfoPress,
    style 
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    
    const handlePressIn = () => {
        hapticFeedback.light();
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };
    
    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };
    
    const {
        _id,
        propertyId,
        checkOutDate,
        checkInDate,
        reservationId = '',
        reservationDetails
    } = task;

    const formatDateTime = (dateString) => {
        if (!dateString) return { date: 'N/A', time: 'N/A' };
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
        };
    };

    const checkIn = formatDateTime(checkInDate);
    const checkOut = formatDateTime(checkOutDate);
    
    const propertyName = propertyId?.name || 'Unknown Property';
    const guestName = reservationDetails?.guest?.name || task.guest?.name || null;

    return (
        <TouchableOpacity 
            onPress={() => {
                hapticFeedback.selection();
                onPress(task);
            }}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={[style]}
        >
            <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.cardContent}>
                    <Text style={styles.propertyTitle} numberOfLines={1}>
                        {propertyName}
                    </Text>

                    <Text style={styles.timeLabel}>Started:</Text>
                    <Text style={styles.timeText}>
                        {checkIn.date} • {checkIn.time}
                    </Text>
                    
                    <Text style={styles.timeLabel}>Ended:</Text>
                    <Text style={styles.timeText}>
                        {checkOut.date} • {checkOut.time}
                    </Text>

                    <Text style={styles.reservationText}>
                        #{reservationId ? reservationId.slice(-8).toUpperCase() : '24142181'} {guestName || 'Paula Minorelli'}
                    </Text>

                    <TouchableOpacity 
                        style={styles.bookingInfoButton}
                        onPress={() => {
                            hapticFeedback.light();
                            onBookingInfoPress(task);
                        }}
                        activeOpacity={0.6}
                    >
                        <Ionicons name="location" size={16} color="#00BFA6" />
                        <Text style={styles.bookingInfoText}>Booking info</Text>
                        <Ionicons name="chevron-down" size={16} color="#00BFA6" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
    },
    cardContent: {
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#00BFA6',
    },
    propertyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    timeLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginBottom: 4,
        marginTop: 8,
    },
    timeText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        marginBottom: 4,
    },
    reservationText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginTop: 16,
        marginBottom: 16,
    },
    bookingInfoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 16,
    },
    bookingInfoText: {
        color: '#00BFA6',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        marginLeft: 8,
    },
});

export default TaskCard;