import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { STATUS } from '../constants/status';
import { useReservation } from '../hooks/useReservation';

export default function RequestScreen() {
    const navigation = useNavigation();
    const { cleaningTasks, loading, error, updateTask, fetchPendingCleaningTasks } = useReservation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    const refreshData = useCallback(() => {
        fetchPendingCleaningTasks();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!hasInitialized) {
                refreshData();
                setHasInitialized(true);
            }
        }, [hasInitialized, refreshData])
    );

    const pendingTasks = cleaningTasks;

    const handleTaskPress = (task) => {
        navigation.navigate('TaskDetail', {
            taskId: task._id,
            task: task,
            refreshOnReturn: true
        });
    };

    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Notification', message);
        }
    };

    const handleAcceptTask = async (task) => {
        try {
            setIsSubmitting(true);
            const response = await updateTask(task._id, {
                status: STATUS.IN_PROGRESS
            });

            if (response?.success) {
                showToast(response.message || 'Task accepted successfully');
                refreshData();
                navigation.navigate('TaskDetail', {
                    taskId: task._id,
                    task: response.data,
                    refreshOnReturn: true
                });
            } else {
                showToast(response.message || 'Failed to accept task');
            }
        } catch (error) {
            showToast('Failed to accept task. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRefresh = useCallback(() => {
        refreshData();
    }, [refreshData]);

    const formatDateTime = (dateString) => {
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

    const getUrgencyColor = (urgencyLevel) => {
        switch (urgencyLevel) {
            case 'HIGH': return '#ff5252';
            case 'MEDIUM': return '#ffa726';
            case 'LOW': return '#66bb6a';
            default: return '#ffa726';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case STATUS.PENDING: return '#FFA000';
            case STATUS.IN_PROGRESS: return '#1976D2';
            case STATUS.COMPLETED: return '#4CAF50';
            default: return '#666';
        }
    };

    const renderTask = ({ item }) => {
        const {
            status,
            propertyId,
            checkOutDate,
            checkInDate,
            price = { amount: 0, currency: 'USD' },
            urgency = 'MEDIUM',
            reservationId = ''
        } = item;

        const checkout = formatDateTime(checkOutDate);
        const checkin = formatDateTime(checkInDate);
        const propertyName = propertyId?.name || 'Unknown Property';
        const address = propertyId?.address || {};

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

        const priceAmount = price?.amount || 0;
        const formattedPrice = (priceAmount / 100).toLocaleString('en-US', {
            style: 'currency',
            currency: price?.currency || 'USD',
            minimumFractionDigits: 2
        });

        const accessCode = propertyId?.access_code || 'N/A';

        return (
            <TouchableOpacity
                style={[styles.taskCard, { borderLeftColor: getStatusColor(status) }]}
                onPress={() => handleTaskPress(item)}
            >
                <View style={styles.taskHeader}>
                    <Text style={styles.roomNumber}>{propertyName}</Text>
                    <View style={styles.headerRight}>
                        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(urgency) }]}>
                            <Text style={styles.urgencyText}>{urgency}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                            <Text style={styles.statusText}>{status}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.taskTitle}>{propertyName}</Text>
                <Text style={styles.taskAddress}>{formattedAddress}</Text>

                <View style={styles.infoGrid}>
                    <View style={styles.rowContainer}>
                        <View style={styles.checkoutInfo}>
                            <Ionicons name="calendar-outline" size={16} color="#666" />
                            <View style={styles.checkoutTexts}>
                                <Text style={styles.checkoutLabel}>Check-out:</Text>
                                <Text style={[styles.checkoutDate, !checkOutDate && styles.noDateText]}>
                                    {checkout.date}
                                </Text>
                                <Text style={[styles.checkoutTime, !checkOutDate && styles.noDateText]}>
                                    {checkout.time}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.checkoutInfo}>
                            <Ionicons name="calendar-outline" size={16} color="#666" />
                            <View style={styles.checkoutTexts}>
                                <Text style={styles.checkoutLabel}>Check-in:</Text>
                                <Text style={[styles.checkoutDate, !checkInDate && styles.noDateText]}>
                                    {checkin.date}
                                </Text>
                                <Text style={[styles.checkoutTime, !checkInDate && styles.noDateText]}>
                                    {checkin.time}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.propertyInfo}>
                        <View style={styles.infoItem}>
                            <Ionicons name="cash-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>{formattedPrice}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="key-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>Code: {accessCode}</Text>
                        </View>
                    </View>

                    {reservationId && (
                        <View style={styles.reservationInfo}>
                            <Ionicons name="bookmark-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>Reservation: {reservationId}</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.acceptButton, isSubmitting && styles.disabledButton]}
                    onPress={() => handleAcceptTask(item)}
                    disabled={isSubmitting}
                >
                    <Text style={styles.acceptButtonText}>
                        {isSubmitting ? 'Processing...' : 'Accept Request'}
                    </Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    if (error) {
        if (error.includes('permission')) {
            return (
                <View style={styles.container}>
                    <View style={styles.errorContainer}>
                        <Ionicons name="lock-closed" size={48} color="#FF3B30" />
                        <Text style={styles.errorTitle}>Access Restricted</Text>
                        <Text style={styles.errorText}>
                            You don't have permission to view pending requests. Please contact an administrator.
                        </Text>
                        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color="#FF3B30" />
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cleaning Requests</Text>
                <Text style={styles.taskCount}>{pendingTasks.length} pending</Text>
            </View>

            {loading && pendingTasks.length === 0 ? (
                <View style={styles.centeredContent}>
                    <ActivityIndicator size="large" color="#00BFA6" />
                    <Text style={styles.loadingText}>Loading requests...</Text>
                </View>
            ) : pendingTasks.length === 0 ? (
                <View style={styles.centeredContent}>
                    <Ionicons name="calendar-outline" size={64} color="#CCCCCC" />
                    <Text style={styles.noTasksText}>No pending requests available</Text>
                </View>
            ) : (
                <FlatList
                    data={pendingTasks}
                    keyExtractor={(item) => item.id || item._id}
                    renderItem={renderTask}
                    contentContainerStyle={styles.taskList}
                    refreshing={loading}
                    onRefresh={handleRefresh}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#ffffff',
        marginTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#E1E5E9',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    taskCount: {
        fontSize: 14,
        color: '#00BFA6',
        fontWeight: '600',
        backgroundColor: 'rgba(0, 191, 166, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    taskList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    taskCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    roomNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    taskTitle: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    taskAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 20,
    },
    infoGrid: {
        marginBottom: 16,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    checkoutInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        marginRight: 8,
    },
    checkoutTexts: {
        marginLeft: 8,
        flex: 1,
    },
    checkoutLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    checkoutDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 2,
    },
    checkoutTime: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#E1E5E9',
        marginVertical: 12,
    },
    propertyInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoText: {
        marginLeft: 6,
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    reservationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E1E5E9',
    },
    urgencyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    urgencyText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    acceptButton: {
        backgroundColor: '#00BFA5',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#00BFA5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    acceptButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.6,
        shadowOpacity: 0.1,
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 80,
    },
    noTasksText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: '#1A1A1A',
    },
    errorText: {
        color: '#666',
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 24,
    },
    retryButton: {
        backgroundColor: '#00BFA5',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noDateText: {
        color: '#ff5252',
        fontStyle: 'italic',
    },
});