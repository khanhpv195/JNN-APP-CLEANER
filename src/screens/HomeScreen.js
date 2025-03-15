import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useReservation } from '../hooks/useReservation';
import { STATUS } from '../constants/status';
import { useTheme, useThemedStyles } from '../shared/theme';
export default function HomeScreen() {
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);
    const { cleaningTasks, loading, error, updateTask, fetchCleaningTasks } = useReservation();
    const { theme } = useTheme();
    // We need to wrap the styles into a function that accepts theme
    const themedStyles = useThemedStyles((theme) => ({
        ...styles,
        container: {
            ...styles.container,
            backgroundColor: theme.background || '#f5f5f5',
        }
    }));

    console.log('cleaningTasks', cleaningTasks);
    // Add this function to filter tasks by selected date
    const getFilteredTasks = () => {
        // Nếu không có ngày, hiển thị tất cả task cho ngày hiện tại
        const today = new Date().toDateString();
        const isToday = selectedDate.toDateString() === today;

        return cleaningTasks.filter(task => {
            // Nếu không có checkOutDate và đang xem ngày hiện tại, hiển thị task
            if (!task.checkOutDate) return isToday;

            // Nếu có checkOutDate, kiểm tra xem có trùng với ngày đã chọn không
            const taskDate = new Date(task.checkOutDate);
            return taskDate.toDateString() === selectedDate.toDateString();
        });
    };

    useEffect(() => {
        generateCalendarDays();
        fetchCleaningTasks(selectedDate);
    }, [selectedDate]);

    const generateCalendarDays = () => {
        const today = new Date();
        const days = [];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = -3; i <= 3; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            days.push({
                date: date.getDate(),
                fullDate: date,
                day: daysOfWeek[date.getDay()],
                hasTask: cleaningTasks.some(task => {
                    // Nếu không có checkOutDate, hiển thị ở ngày hiện tại
                    if (!task.checkOutDate) return i === 0;

                    // Nếu có checkOutDate, kiểm tra xem có trùng với ngày không
                    const taskDate = new Date(task.checkOutDate);
                    return taskDate.toDateString() === date.toDateString();
                }),
                isToday: i === 0
            });
        }
        setCalendarDays(days);
    };

    const handleDateSelect = (fullDate) => {
        setSelectedDate(new Date(fullDate));
    };

    const handleRefresh = () => {
        fetchCleaningTasks();
    };

    const handleTaskPress = (task) => {
        navigation.navigate('TaskDetail', {
            taskId: task._id,
            task: task
        });
    };

    // Calendar render
    const renderCalendar = () => (
        <View style={styles.calendarContainer}>
            <View style={styles.header}>
                <Text style={styles.monthText}>
                    {selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <View style={styles.headerButtons}>

                    <TouchableOpacity onPress={handleRefresh}>
                        <Ionicons name="refresh" size={24} color="#00BFA5" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                        <Ionicons name="notifications-outline" size={24} color="#00BFA5" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.calendar}
            >
                {calendarDays.map((day) => (
                    <TouchableOpacity
                        key={day.date}
                        style={[
                            styles.dayButton,
                            selectedDate.toDateString() === day.fullDate.toDateString() && styles.selectedDay
                        ]}
                        onPress={() => handleDateSelect(day.fullDate)}
                    >
                        <Text style={styles.dayText}>{day.day}</Text>
                        <Text style={[
                            styles.dateText,
                            selectedDate.toDateString() === day.fullDate.toDateString() && styles.selectedDayText
                        ]}>{day.date}</Text>
                        {day.hasTask && <View style={styles.taskDot} />}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    // Task item render
    const renderTask = ({ item }) => {
        const formatCheckoutDateTime = (dateString) => {
            if (!dateString) return {
                date: 'Not specified',
                time: 'Not specified'
            };

            const date = new Date(dateString);
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

        // Sử dụng checkOutDate hoặc ngày hiện tại nếu không có
        const checkout = formatCheckoutDateTime(item.checkOutDate || new Date());

        // Lấy thông tin từ propertyDetails
        const propertyName = item.propertyDetails?.name || 'Unnamed Property';
        const price = item.propertyDetails?.price_cleaning || 0;

        // Lấy địa chỉ từ propertyDetails nếu có
        let address = 'No address provided';
        if (item.propertyDetails?.address) {
            if (typeof item.propertyDetails.address === 'object' && item.propertyDetails.address.display) {
                address = item.propertyDetails.address.display;
            } else if (typeof item.propertyDetails.address === 'string') {
                address = item.propertyDetails.address;
            }
        }

        return (
            <TouchableOpacity
                style={[
                    styles.taskCard,
                    item.readyToClean && styles.readyCard,
                    item.accepted && styles.acceptedCard
                ]}
                onPress={() => handleTaskPress(item)}
            >
                <View style={styles.taskHeader}>
                    <Text style={styles.roomNumber}>{propertyName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                    </View>
                </View>

                <Text style={styles.taskAddress}>{address}</Text>

                <View style={styles.infoGrid}>
                    <View style={styles.checkoutInfo}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <View style={styles.checkoutTexts}>
                            <Text style={styles.checkoutDate}>{checkout.date}</Text>
                            <Text style={styles.checkoutTime}>{checkout.time}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.propertyInfo}>
                        <View style={styles.infoItem}>
                            <Ionicons name="cash-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>
                                ${(price / 100).toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="home-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>
                                ID: {item.propertyId?.substring(0, 8) || 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Add loading and error states
    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text>Error: {error}</Text>
                <TouchableOpacity onPress={handleRefresh}>
                    <Text>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={themedStyles.container}>
            {renderCalendar()}
            <FlatList
                data={getFilteredTasks()}
                renderItem={renderTask}
                keyExtractor={item => item._id}  // Changed from item.id to item._id
                contentContainerStyle={themedStyles.listContent}
                refreshing={loading}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    <View style={themedStyles.emptyContainer}>
                        <Text style={themedStyles.emptyText}>No tasks for this date</Text>
                    </View>
                }
            />
        </View>
    );
}

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

const getStatusText = (status) => {
    return status;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    calendarContainer: {
        backgroundColor: 'white',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    monthText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    calendar: {
        paddingVertical: 10,
    },
    dayButton: {
        alignItems: 'center',
        padding: 10,
        width: 60,
    },
    selectedDay: {
        backgroundColor: '#00BFA5',
        borderRadius: 25,
    },
    dayText: {
        color: '#666',
        marginBottom: 5,
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    selectedDayText: {
        color: 'white',
    },
    taskDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#00BFA5',
        marginTop: 4,
    },
    listContent: {
        padding: 15,
    },
    taskCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#666',
    },
    readyCard: {
        borderLeftColor: '#00BFA5',
    },
    acceptedCard: {
        borderLeftColor: '#4CAF50',
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    roomNumber: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    acceptButton: {
        backgroundColor: '#00BFA5',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
    },
    acceptButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    acceptedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    acceptedText: {
        color: '#4CAF50',
        marginLeft: 5,
        fontWeight: 'bold',
    },
    taskTitle: {
        fontSize: 16,
        marginBottom: 5,
    },
    taskAddress: {
        color: '#666',
        marginBottom: 10,
    },
    checkoutTime: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        color: '#666',
        marginLeft: 5,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    infoGrid: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    checkoutInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkoutTexts: {
        marginLeft: 8,
    },
    checkoutDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    checkoutTime: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 8,
    },
    propertyInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});