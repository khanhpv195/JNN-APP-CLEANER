import React, { memo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../../utils/haptics';
import { 
    validateTaskData, 
    createGuestDisplayText, 
    safeFormatDateTime,
    extractPropertyInfo 
} from '../../utils/dataUtils';
import { getTaskColor } from '../../utils/calendarUtils';

// Expandable Booking Info Component
const BookingInfoSection = memo(({ task, isExpanded, onToggle }) => {
    const taskValidation = validateTaskData(task);
    const propertyInfo = extractPropertyInfo(task);
    const guestInfo = taskValidation.guest;
    
    if (!isExpanded) return null;
    
    return (
        <View style={styles.bookingDetailsContainer}>
            <View style={styles.bookingDetailRow}>
                <Text style={styles.bookingLabel}>Property Type:</Text>
                <Text style={styles.bookingValue}>Hospitable</Text>
            </View>
            
            {/* Guest Arrival/Departure */}
            {task.checkInDate && (
                <View style={styles.bookingDetailRow}>
                    <Ionicons name="log-in" size={16} color="#666" />
                    <Text style={styles.bookingValue}>
                        Guest Arrives: {safeFormatDateTime(task.checkInDate).hasDate 
                            ? new Date(task.checkInDate).toLocaleDateString('en-US', { 
                                weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                            })
                            : 'Date not set'
                        }
                    </Text>
                </View>
            )}
            
            {task.checkOutDate && (
                <View style={styles.bookingDetailRow}>
                    <Ionicons name="log-out" size={16} color="#666" />
                    <Text style={styles.bookingValue}>
                        Guest Leaves: {safeFormatDateTime(task.checkOutDate).hasDate 
                            ? new Date(task.checkOutDate).toLocaleDateString('en-US', { 
                                weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                            })
                            : 'Date not set'
                        }
                    </Text>
                </View>
            )}
            
            {/* Address */}
            {propertyInfo.hasAddress && (
                <View style={styles.bookingDetailRow}>
                    <Ionicons name="location" size={16} color="#666" />
                    <Text style={styles.bookingValue}>
                        Address: {propertyInfo.address}
                    </Text>
                </View>
            )}
            
            {/* Additional guest info if available */}
            {task.reservationDetails?.numberOfGuests && (
                <View style={styles.bookingDetailRow}>
                    <Ionicons name="people" size={16} color="#666" />
                    <Text style={styles.bookingValue}>
                        Guests: {task.reservationDetails.numberOfGuests}
                    </Text>
                </View>
            )}
        </View>
    );
});

const TaskCardCompact = memo(({ 
    task, 
    onPress, 
    onBookingInfoPress,
    style 
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [bookingExpanded, setBookingExpanded] = useState(false);
    
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
    
    // Enhanced data extraction
    const taskValidation = validateTaskData(task);
    const propertyInfo = extractPropertyInfo(task);
    const guestDisplayInfo = createGuestDisplayText(taskValidation.guest);
    const taskColor = getTaskColor(task);
    
    // Safe date formatting
    const startTime = safeFormatDateTime(task.checkInDate);
    const endTime = safeFormatDateTime(task.checkOutDate);
    
    const handleBookingToggle = () => {
        hapticFeedback.light();
        setBookingExpanded(!bookingExpanded);
        // Also call the original handler for any additional logic
        if (onBookingInfoPress) {
            onBookingInfoPress(task);
        }
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
            <Animated.View style={[
                styles.container, 
                { 
                    transform: [{ scale: scaleAnim }],
                    borderLeftColor: taskColor.border
                }
            ]}>
                <View style={[styles.cardContent, { backgroundColor: taskColor.background }]}>
                    {/* Property Name - Prominent */}
                    <Text style={styles.propertyTitle} numberOfLines={1}>
                        {propertyInfo.hasPropertyData ? propertyInfo.name : 'Property Name Not Available'}
                    </Text>

                    {/* Time Information - Compact Layout */}
                    <View style={styles.timeContainer}>
                        <View style={styles.timeSection}>
                            <Text style={styles.timeLabel}>Start:</Text>
                            <Text style={styles.timeValue}>
                                {startTime.hasDate 
                                    ? `${startTime.date} • ${startTime.time}`
                                    : 'Time not set'
                                }
                            </Text>
                        </View>
                        
                        <View style={styles.timeSection}>
                            <Text style={styles.timeLabel}>End:</Text>
                            <Text style={styles.timeValue}>
                                {endTime.hasDate 
                                    ? `${endTime.date} • ${endTime.time}`
                                    : 'Time not set'
                                }
                            </Text>
                        </View>
                    </View>

                    {/* Guest Information - Compact Display */}
                    {guestDisplayInfo.showField && (
                        <Text style={styles.guestText}>
                            {guestDisplayInfo.text}
                        </Text>
                    )}

                    {/* Action Icons Row */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionIcon}>
                            <Ionicons name="person" size={16} color="#666" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.actionIcon}>
                            <Ionicons name="refresh" size={16} color="#FF6B35" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.actionIcon}>
                            <Ionicons name="eye" size={16} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Expandable Booking Info */}
                    <TouchableOpacity 
                        style={styles.bookingInfoToggle}
                        onPress={handleBookingToggle}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="location" size={16} color="#00BFA6" />
                        <Text style={styles.bookingInfoText}>Booking info</Text>
                        <Ionicons 
                            name={bookingExpanded ? "chevron-up" : "chevron-down"} 
                            size={16} 
                            color="#00BFA6" 
                        />
                    </TouchableOpacity>

                    {/* Expandable Details */}
                    <BookingInfoSection 
                        task={task}
                        isExpanded={bookingExpanded}
                        onToggle={handleBookingToggle}
                    />
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderLeftWidth: 4,
    },
    cardContent: {
        padding: 16,
    },
    
    // Property Title
    propertyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    
    // Time Container - Compact Layout
    timeContainer: {
        marginBottom: 12,
    },
    timeSection: {
        marginBottom: 4,
    },
    timeLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    timeValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
        marginTop: 2,
    },
    
    // Guest Information
    guestText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginBottom: 12,
    },
    
    // Action Icons Row
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    actionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F7FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Booking Info Toggle
    bookingInfoToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    bookingInfoText: {
        color: '#00BFA6',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        marginLeft: 8,
    },
    
    // Expandable Booking Details
    bookingDetailsContainer: {
        paddingTop: 12,
        gap: 8,
    },
    bookingDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bookingLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        minWidth: 100,
    },
    bookingValue: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
});

export default TaskCardCompact;