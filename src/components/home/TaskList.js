import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { STATUS } from '../../constants/status';

const TaskList = ({ 
    tasks, 
    onTaskPress, 
    onRefresh, 
    loading, 
    onEndReached,
    onEndReachedThreshold,
    ListFooterComponent,
    style,
    scrollEnabled = true,
    showsVerticalScrollIndicator = true
}) => {
    // Add state to prevent multiple onEndReached calls
    const [onEndReachedCalledDuringMomentum, setOnEndReachedCalledDuringMomentum] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case STATUS.PENDING:
                return '#FFA000'; // Orange
            case STATUS.IN_PROGRESS:
                return '#1976D2'; // Blue
            case STATUS.COMPLETED:
                return '#4CAF50'; // Green
            default:
                return '#666'; // Gray
        }
    };

    const formatCheckoutDateTime = (dateString) => {
        if (!dateString) {
            return {
                date: 'Not scheduled',
                time: 'To be determined'
            };
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return {
                date: 'Invalid date',
                time: 'Invalid time'
            };
        }

        return {
            date: date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            time: date.toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            })
        };
    };

    const renderTask = ({ item }) => {
        const {
            _id,
            status,
            propertyId,
            checkOutDate,
            checkInDate,
            price = { amount: 0, currency: 'USD' },
            urgency = 'MEDIUM',
            reservationId = ''
        } = item;

        // Format dates with better error handling
        const checkout = formatCheckoutDateTime(checkOutDate);
        const checkin = formatCheckoutDateTime(checkInDate);

        // Get property details from propertyId
        const propertyName = propertyId?.name || 'Unknown Property';
        const address = propertyId?.address || {};

        // Format address properly
        let formattedAddress = 'No address available';
        if (address) {
            if (typeof address === 'string') {
                formattedAddress = address;
            } else if (address.display) {
                formattedAddress = address.display;
            } else if (address.street) {
                formattedAddress = `${address.street}, ${address.city || ''}, ${address.state || ''} ${address.postcode || ''}`;
            }
        }

        // Format price
        const priceAmount = price?.amount || 0;
        const formattedPrice = (priceAmount / 100).toLocaleString('en-US', {
            style: 'currency',
            currency: price?.currency || 'USD',
            minimumFractionDigits: 2
        });

        // Access code from property
        const accessCode = propertyId?.access_code || 'N/A';

        // Urgency color
        const getUrgencyColor = (urgencyLevel) => {
            switch (urgencyLevel) {
                case 'HIGH': return '#ff5252';
                case 'MEDIUM': return '#ffa726';
                case 'LOW': return '#66bb6a';
                default: return '#ffa726';
            }
        };

        return (
            <TouchableOpacity
                style={[
                    styles.taskCard,
                    { borderLeftWidth: 4, borderLeftColor: getStatusColor(status) }
                ]}
                onPress={() => onTaskPress(item)}
            >
                {/* Header with title and badges */}
                <View style={styles.cardHeader}>
                    <Text style={styles.propertyTitle} numberOfLines={2}>
                        {propertyName}
                    </Text>
                    <View style={styles.badgeContainer}>
                        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(urgency) }]}>
                            <Text style={styles.badgeText}>{urgency}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                            <Text style={styles.badgeText}>{status.replace('_', ' ')}</Text>
                        </View>
                    </View>
                </View>

                {/* Address */}
                <Text style={styles.addressText} numberOfLines={2}>
                    {formattedAddress}
                </Text>

                {/* Time Information */}
                <View style={styles.timeSection}>
                    <View style={styles.timeRow}>
                        <Text style={styles.timeLabel}>Start:</Text>
                        <Text style={styles.timeValue}>
                            {checkin.date} • {checkin.time}
                        </Text>
                    </View>
                    <View style={styles.timeRow}>
                        <Text style={styles.timeLabel}>End:</Text>
                        <Text style={styles.timeValue}>
                            {checkout.date} • {checkout.time}
                        </Text>
                    </View>
                </View>

                {/* Property Code */}
                <View style={styles.codeSection}>
                    <Text style={styles.codeText}>
                        #{reservationId ? reservationId.slice(-8).toUpperCase() : 'N/A'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Handle end reached with debounce
    const handleEndReached = () => {
        if (!onEndReachedCalledDuringMomentum && onEndReached) {
            onEndReached();
            setOnEndReachedCalledDuringMomentum(true);
        }
    };

    return (
        <FlatList
            data={tasks}
            keyExtractor={(item) => item.id || item._id}
            renderItem={renderTask}
            contentContainerStyle={[styles.taskList, style]}
            refreshing={loading}
            onRefresh={onRefresh}
            onEndReached={handleEndReached}
            onEndReachedThreshold={onEndReachedThreshold || 0.5}
            onMomentumScrollBegin={() => setOnEndReachedCalledDuringMomentum(false)}
            ListFooterComponent={ListFooterComponent}
            scrollEnabled={scrollEnabled}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        />
    );
};

const styles = StyleSheet.create({
    taskList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    taskCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    propertyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 12,
        lineHeight: 22,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 6,
        flexShrink: 0,
    },
    urgencyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 18,
    },
    timeSection: {
        marginBottom: 16,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    timeLabel: {
        fontSize: 14,
        color: '#666',
        width: 50,
    },
    timeValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    codeSection: {
        alignItems: 'flex-end',
    },
    codeText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
});

export default TaskList; 