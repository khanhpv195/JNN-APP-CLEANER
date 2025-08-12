import React, { memo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeLinearGradient from '../common/SafeLinearGradient';
import { hapticFeedback } from '../../utils/haptics';
import { 
    validateTaskData, 
    createGuestDisplayText, 
    safeFormatDateTime,
    extractPropertyInfo 
} from '../../utils/dataUtils';

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
    
    // Production-ready data validation and extraction
    const taskValidation = validateTaskData(task);
    const propertyInfo = extractPropertyInfo(task);
    const guestDisplayInfo = createGuestDisplayText(taskValidation.guest);
    
    // Safe date formatting
    const checkIn = safeFormatDateTime(task.checkInDate);
    const checkOut = safeFormatDateTime(task.checkOutDate);

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
                    {/* Property Information */}
                    <View style={styles.propertySection}>
                        <Text style={styles.propertyTitle} numberOfLines={1}>
                            {propertyInfo.hasPropertyData ? propertyInfo.name : 'Property Name Not Available'}
                        </Text>
                        {!propertyInfo.hasPropertyData && (
                            <View style={styles.missingDataIndicator}>
                                <Ionicons name="alert-circle" size={16} color="#FF9800" />
                                <Text style={styles.missingDataText}>Property details incomplete</Text>
                            </View>
                        )}
                    </View>

                    {/* Check-in Information */}
                    <View style={styles.timeSection}>
                        <Text style={styles.timeLabel}>Started:</Text>
                        {checkIn.hasDate ? (
                            <Text style={styles.timeText}>
                                {checkIn.date} • {checkIn.time}
                            </Text>
                        ) : (
                            <Text style={styles.missingTimeText}>
                                {checkIn.displayDate} • {checkIn.displayTime}
                            </Text>
                        )}
                    </View>
                    
                    {/* Check-out Information */}
                    <View style={styles.timeSection}>
                        <Text style={styles.timeLabel}>Ended:</Text>
                        {checkOut.hasDate ? (
                            <Text style={styles.timeText}>
                                {checkOut.date} • {checkOut.time}
                            </Text>
                        ) : (
                            <Text style={styles.missingTimeText}>
                                {checkOut.displayDate} • {checkOut.displayTime}
                            </Text>
                        )}
                    </View>

                    {/* Guest Information - Only show if available */}
                    {guestDisplayInfo.showField && (
                        <View style={styles.guestSection}>
                            <Text style={styles.reservationText}>
                                {guestDisplayInfo.text}
                            </Text>
                            {!guestDisplayInfo.isComplete && (
                                <View style={styles.incompleteDataIndicator}>
                                    <Ionicons name="information-circle" size={14} color="#666" />
                                    <Text style={styles.incompleteDataText}>
                                        Missing {guestDisplayInfo.missingData}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Booking Info Button - Always show but adjust text */}
                    <TouchableOpacity 
                        style={styles.bookingInfoButton}
                        onPress={() => {
                            hapticFeedback.light();
                            onBookingInfoPress(task);
                        }}
                        activeOpacity={0.6}
                    >
                        <Ionicons name="location" size={16} color="#00BFA6" />
                        <Text style={styles.bookingInfoText}>
                            {taskValidation.isDataComplete ? 'Booking info' : 'View details'}
                        </Text>
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
    
    // Property Section
    propertySection: {
        marginBottom: 16,
    },
    propertyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    missingDataIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    missingDataText: {
        fontSize: 12,
        color: '#FF9800',
        fontWeight: '500',
        marginLeft: 4,
    },
    // Time Section
    timeSection: {
        marginBottom: 8,
    },
    timeLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginBottom: 4,
    },
    timeText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        marginBottom: 4,
    },
    missingTimeText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    
    // Guest Section
    guestSection: {
        marginTop: 16,
        marginBottom: 16,
    },
    reservationText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginBottom: 4,
    },
    incompleteDataIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: 'rgba(102, 102, 102, 0.1)',
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    incompleteDataText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '400',
        marginLeft: 3,
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