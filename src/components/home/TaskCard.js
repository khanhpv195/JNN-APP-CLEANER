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
                month: 'short',
                day: 'numeric',
                year: 'numeric'
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
    const guestName = reservationDetails?.guest?.name || 'Unknown Guest';
    
    const formatAddress = () => {
        const address = propertyId?.address;
        if (!address) return 'No address available';
        
        if (typeof address === 'string') return address;
        if (address.display) return address.display;
        if (address.street) {
            return `${address.street}, ${address.city || ''}, ${address.state || ''} ${address.postcode || ''}`.trim();
        }
        return 'No address available';
    };

    const getStatusColor = () => {
        const now = new Date();
        const checkOutTime = new Date(checkOutDate);
        const checkInTime = new Date(checkInDate);
        
        if (now < checkInTime) return '#2196F3'; // Blue - Upcoming
        if (now >= checkInTime && now <= checkOutTime) return '#FF9800'; // Orange - In Progress
        return '#4CAF50'; // Green - Ready for cleaning
    };

    const getStatusText = () => {
        const now = new Date();
        const checkOutTime = new Date(checkOutDate);
        const checkInTime = new Date(checkInDate);
        
        if (now < checkInTime) return 'Upcoming';
        if (now >= checkInTime && now <= checkOutTime) return 'Guest Checked In';
        return 'Ready for Cleaning';
    };

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
                <SafeLinearGradient
                    colors={['#FFFFFF', '#F8F9FA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
                    
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.propertyTitle} numberOfLines={1}>
                                    {propertyName}
                                </Text>
                                <View style={styles.statusBadge}>
                                    <Text style={[styles.statusText, { color: getStatusColor() }]}>
                                        {getStatusText()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.addressText} numberOfLines={2}>
                            {formatAddress()}
                        </Text>

                        <View style={styles.timeSection}>
                            <View style={styles.timeRow}>
                                <View style={styles.timeIcon}>
                                    <Ionicons name="log-in-outline" size={16} color="#4CAF50" />
                                </View>
                                <View style={styles.timeDetails}>
                                    <Text style={styles.timeLabel}>Check-in</Text>
                                    <Text style={styles.timeValue}>
                                        {checkIn.date} • {checkIn.time}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.timeRow}>
                                <View style={styles.timeIcon}>
                                    <Ionicons name="log-out-outline" size={16} color="#FF5722" />
                                </View>
                                <View style={styles.timeDetails}>
                                    <Text style={styles.timeLabel}>Check-out</Text>
                                    <Text style={styles.timeValue}>
                                        {checkOut.date} • {checkOut.time}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.guestSection}>
                            <View style={styles.guestInfo}>
                                <Ionicons name="person-outline" size={16} color="#666" />
                                <Text style={styles.guestName} numberOfLines={1}>
                                    {guestName}
                                </Text>
                            </View>
                            
                            <Text style={styles.reservationId}>
                                ID: {reservationId ? reservationId.slice(-8).toUpperCase() : 'N/A'}
                            </Text>
                        </View>

                        <TouchableOpacity 
                            style={styles.bookingInfoButton}
                            onPress={() => {
                                hapticFeedback.light();
                                onBookingInfoPress(task);
                            }}
                            activeOpacity={0.6}
                        >
                            <Ionicons name="information-circle-outline" size={16} color="#00BFA6" />
                            <Text style={styles.bookingInfoText}>View Details</Text>
                            <Ionicons name="chevron-forward" size={16} color="#00BFA6" />
                        </TouchableOpacity>
                    </View>
                </SafeLinearGradient>
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
    },
    gradient: {
        position: 'relative',
    },
    statusIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    content: {
        padding: 20,
        paddingLeft: 24,
    },
    header: {
        marginBottom: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    propertyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(0, 191, 166, 0.1)',
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 20,
    },
    timeSection: {
        marginBottom: 16,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 191, 166, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    timeDetails: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    timeValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        marginTop: 2,
    },
    guestSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    guestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    guestName: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    reservationId: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    bookingInfoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 191, 166, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 191, 166, 0.2)',
    },
    bookingInfoText: {
        color: '#00BFA6',
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 8,
    },
});

export default TaskCard;