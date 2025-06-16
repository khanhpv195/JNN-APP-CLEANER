import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Dimensions, Platform, ToastAndroid, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useReservation } from '../hooks/useReservation';
import { STATUS } from '../constants/status';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);
    const [months, setMonths] = useState([]);
    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const { cleaningTasks, loading, error, updateTask, fetchCleaningTasksNotPending, setFetching } = useReservation();
    const screenWidth = Dimensions.get('window').width;
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log('cleaningTasks in HomeScreen:', cleaningTasks);


    const refreshData = () => {
        // Force refresh by using a new Date object
        const dateToFetch = new Date(selectedDate);
        dateToFetch.setHours(0, 0, 0, 0);

        fetchCleaningTasksNotPending(dateToFetch);

        generateCalendarDays(selectedDate);
        generateMonths(selectedMonth);
    };

    useFocusEffect(
        React.useCallback(() => {
            console.log('Home screen focused, refreshing data');
            refreshData();

            return () => {
                console.log('Home screen unfocused');
            };
        }, []) // Remove selectedDate dependency to prevent continuous refreshes
    );

    // Add this function to filter tasks by selected date
    const getFilteredTasks = () => {
        console.log('Filtering tasks in HomeScreen:', cleaningTasks.length);

        // Filter tasks - show all except PENDING
        return cleaningTasks.filter(task => {
            // Skip all PENDING tasks
            if (task.status === STATUS.PENDING) {
                console.log('Task filtered out because it is PENDING:', task._id);
                return false;
            }

            // Filter by date
            if (task.checkOutDate) {
                const taskDate = new Date(task.checkOutDate);
                taskDate.setHours(0, 0, 0, 0);

                const compareDate = new Date(selectedDate);
                compareDate.setHours(0, 0, 0, 0);

                const matched = taskDate.toDateString() === compareDate.toDateString();
                if (!matched) {
                    console.log(`Task ${task._id} does not match date. Task date: ${taskDate.toDateString()}, Selected date: ${compareDate.toDateString()}`);
                }
                return matched;
            }

            // Default: show tasks without date
            return true;
        });
    };

    // Handle load more when reaching end of list
    const handleLoadMore = useCallback(async () => {
        // Không làm gì khi kéo đến cuối danh sách
        // Đã loại bỏ tính năng tự động chuyển sang ngày tiếp theo
        console.log('Reached end of list, disabled auto-load next day feature');
        return;
    }, []);

    // Split into two separate effects to prevent refresh loops
    // Effect for date changes to update calendar visuals
    useEffect(() => {
        console.log('Selected date changed, updating calendar UI');
        generateCalendarDays(selectedDate);
    }, [selectedDate]);

    // Effect for data fetching - only triggered by explicit actions
    useEffect(() => {
        // Initial data load only
        console.log('Initial data load');
        const dateToFetch = new Date(selectedDate);
        dateToFetch.setHours(0, 0, 0, 0);
        fetchCleaningTasksNotPending(dateToFetch);
        generateMonths(selectedMonth);
    }, []); // Empty dependency array - only run once on mount

    // Generate months for 3-month calendar
    const generateMonths = (centerDate = new Date()) => {
        const months = [];
        // Base year from selected date
        const baseYear = selectedMonth.getFullYear();

        // Generate all 12 months of the year
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
            const monthDate = new Date(baseYear, monthIndex, 1);
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth();

            // Get days in month
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // Get weekday of first day (0 = Sunday, 1 = Monday, etc.)
            const firstDayOfMonth = new Date(year, month, 1).getDay();

            // Build days for this month
            const days = [];

            // Add empty days for proper alignment (empty days before month starts)
            for (let j = 0; j < firstDayOfMonth; j++) {
                days.push({
                    empty: true,
                    day: ''
                });
            }

            // Add actual days
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isToday = date.toDateString() === today.toDateString();

                // Check if there are tasks for this day
                const hasTask = cleaningTasks.some(task => {
                    if (task.status === STATUS.PENDING) return false;
                    if (!task.checkOutDate) return false;

                    const taskDate = new Date(task.checkOutDate);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate.toDateString() === date.toDateString();
                });

                days.push({
                    day,
                    fullDate: date,
                    isToday,
                    hasTask
                });
            }

            months.push({
                year,
                month,
                monthName: monthDate.toLocaleString('en-US', { month: 'long' }),
                days
            });
        }

        setMonths(months);
    };

    const generateCalendarDays = (centerDate = new Date()) => {
        const baseDateForCalendar = new Date(centerDate);
        baseDateForCalendar.setHours(0, 0, 0, 0); // Normalize date to start of day

        const days = [];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        console.log('Generating calendar days with tasks count:', cleaningTasks.length);

        for (let i = -3; i <= 3; i++) {
            const date = new Date(baseDateForCalendar);
            date.setDate(baseDateForCalendar.getDate() + i);
            date.setHours(0, 0, 0, 0); // Ensure all dates are at midnight

            // Check if this date is today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isToday = date.getTime() === today.getTime();

            // Check for ALL tasks on this day, not just PENDING
            const tasksForThisDay = cleaningTasks.filter(task => {
                // Check both checkOutDate and reservationDetails.checkOut
                if (task.checkOutDate) {
                    const taskDate = new Date(task.checkOutDate);
                    taskDate.setHours(0, 0, 0, 0); // Normalize task date
                    return taskDate.toDateString() === date.toDateString();
                } else if (task.reservationDetails?.checkOut) {
                    const taskDate = new Date(task.reservationDetails.checkOut);
                    taskDate.setHours(0, 0, 0, 0); // Normalize task date
                    return taskDate.toDateString() === date.toDateString();
                }
                return false;
            });

            const hasTask = tasksForThisDay.length > 0;

            if (hasTask) {
                console.log(`Date ${date.toDateString()} has ${tasksForThisDay.length} tasks`);
            }

            days.push({
                date: date.getDate(),
                fullDate: date,
                day: daysOfWeek[date.getDay()],
                hasTask,
                isToday,
                tasksCount: tasksForThisDay.length
            });
        }
        setCalendarDays(days);
    };

    const handleDateSelect = (fullDate) => {
        // Create a new date object with time set to midnight to ensure consistency
        const newSelectedDate = new Date(fullDate);
        newSelectedDate.setHours(0, 0, 0, 0);

        // Log date in a readable format
        console.log('Selected date:',
            `${newSelectedDate.getFullYear()}-${String(newSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(newSelectedDate.getDate()).padStart(2, '0')}`
        );

        // Check if this is a different date than currently selected
        if (newSelectedDate.toDateString() !== selectedDate.toDateString()) {
            setSelectedDate(newSelectedDate);

            fetchCleaningTasksNotPending(newSelectedDate);
        }

        // Update the selected month if the date is in a different month
        if (newSelectedDate.getMonth() !== selectedMonth.getMonth() ||
            newSelectedDate.getFullYear() !== selectedMonth.getFullYear()) {
            setSelectedMonth(newSelectedDate);
        }
    };

    const handlePrevMonth = () => {
        const prevMonth = new Date(selectedMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        setSelectedMonth(prevMonth);
        generateMonths(prevMonth);
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(selectedMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setSelectedMonth(nextMonth);
        generateMonths(nextMonth);
    };

    const handleRefresh = () => {
        console.log('Manual refresh triggered for request screen');
        refreshData();
    };

    const handleTaskPress = (task) => {
        console.log('Selected task:', task);
        navigation.navigate('TaskDetail', {
            taskId: task._id,
            task: task,
            refreshOnReturn: true
        });
    };

    // Handle prev year
    const handlePrevYear = () => {
        const prevYear = new Date(selectedMonth);
        prevYear.setFullYear(prevYear.getFullYear() - 1);
        setSelectedMonth(prevYear);
        generateMonths(prevYear);
    };

    // Handle next year
    const handleNextYear = () => {
        const nextYear = new Date(selectedMonth);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setSelectedMonth(nextYear);
        generateMonths(nextYear);
    };

    // Handle month selection
    const handleMonthSelect = (monthIndex) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(monthIndex);
        newDate.setDate(1);
        setSelectedMonth(newDate);

        // If there's no selected date in this month, set it to the 1st
        const currentSelectedMonth = selectedDate.getMonth();
        const currentSelectedYear = selectedDate.getFullYear();
        if (currentSelectedMonth !== monthIndex || currentSelectedYear !== newDate.getFullYear()) {
            setSelectedDate(newDate);
        }
    };

    const toggleCalendarExpanded = () => {
        setCalendarExpanded(!calendarExpanded);
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
                // Refresh the task list after accepting
                refreshData();
                // Navigate to task details
                navigation.navigate('TaskDetail', {
                    taskId: task._id,
                    task: response.data,
                    refreshOnReturn: true
                });
            } else {
                showToast(response.message || 'Failed to accept task');
            }
        } catch (error) {
            console.error('Error accepting task:', error);
            showToast('Failed to accept task. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calendar render for week view
    const renderWeekCalendar = () => (
        <View style={styles.weekCalendar}>
            {calendarDays.map((day, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.dayItem,
                        day.isToday && styles.dayItemToday,
                        day.fullDate.toDateString() === selectedDate.toDateString() && styles.dayItemSelected
                    ]}
                    onPress={() => handleDateSelect(day.fullDate)}
                >
                    <Text
                        style={[
                            styles.weekdayText,
                            day.isToday && styles.todayText,
                            day.fullDate.toDateString() === selectedDate.toDateString() && styles.weekdayTextSelected
                        ]}
                    >
                        {day.day}
                    </Text>
                    <Text
                        style={[
                            styles.dayText,
                            day.isToday && styles.todayText,
                            day.fullDate.toDateString() === selectedDate.toDateString() && styles.dayTextSelected
                        ]}
                    >
                        {day.date}
                    </Text>
                    {day.hasTask && (
                        <View style={[
                            styles.taskDot,
                            day.fullDate.toDateString() === selectedDate.toDateString() ?
                                { backgroundColor: 'white' } : { backgroundColor: '#FF5252' }
                        ]}>
                            {day.tasksCount > 1 && (
                                <Text style={[
                                    styles.taskCount,
                                    day.fullDate.toDateString() === selectedDate.toDateString() ?
                                        { color: '#00BFA6' } : { color: 'white' }
                                ]}>
                                    {day.tasksCount}
                                </Text>
                            )}
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );

    // Render footer for FlatList
    const renderFooter = () => {
        return null;
    };

    // Render 1-year calendar
    const renderMonthCalendar = () => {
        const currentMonth = months.find(m => m.month === selectedMonth.getMonth());

        if (!currentMonth) return null;

        return (
            <View style={styles.monthCalendarWrapper}>
                <Text style={styles.currentMonthTitle}>
                    {currentMonth.monthName} {selectedMonth.getFullYear()}
                </Text>

                <View style={styles.daysOfWeekRow}>
                    <Text style={styles.dayOfWeek}>S</Text>
                    <Text style={styles.dayOfWeek}>M</Text>
                    <Text style={styles.dayOfWeek}>T</Text>
                    <Text style={styles.dayOfWeek}>W</Text>
                    <Text style={styles.dayOfWeek}>T</Text>
                    <Text style={styles.dayOfWeek}>F</Text>
                    <Text style={styles.dayOfWeek}>S</Text>
                </View>

                <View style={styles.monthDaysGrid}>
                    {currentMonth.days.map((day, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.calendarDay,
                                day.empty && styles.emptyDay,
                                day.isToday && styles.calendarToday,
                                day.fullDate &&
                                selectedDate.toDateString() === day.fullDate.toDateString() &&
                                styles.calendarDaySelected
                            ]}
                            onPress={() => day.fullDate && handleDateSelect(day.fullDate)}
                            disabled={day.empty}
                        >
                            <Text style={[
                                styles.calendarDayText,
                                day.isToday && styles.todayText,
                                day.fullDate &&
                                selectedDate.toDateString() === day.fullDate.toDateString() &&
                                styles.calendarDayTextSelected
                            ]}>
                                {day.day}
                            </Text>
                            {day.hasTask && <View style={[
                                styles.taskDot,
                                day.fullDate && selectedDate.toDateString() === day.fullDate.toDateString() ?
                                    { backgroundColor: 'white' } : { backgroundColor: '#FF5252' }
                            ]}>
                                {day.tasksCount > 1 && (
                                    <Text style={[
                                        styles.taskCount,
                                        day.fullDate && selectedDate.toDateString() === day.fullDate.toDateString() ?
                                            { color: '#00BFA6' } : { color: 'white' }
                                    ]}>
                                        {day.tasksCount}
                                    </Text>
                                )}
                            </View>}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.monthSelector}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthsScrollView}>
                        {months.map((month, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.monthButton,
                                    month.month === selectedMonth.getMonth() && styles.selectedMonthButton
                                ]}
                                onPress={() => handleMonthSelect(month.month)}
                            >
                                <Text style={[
                                    styles.monthButtonText,
                                    month.month === selectedMonth.getMonth() && styles.selectedMonthButtonText
                                ]}>
                                    {month.monthName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        );
    };

    // Task item render
    const renderTask = ({ item }) => {
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
                onPress={() => handleTaskPress(item)}
            >
                <View style={styles.taskHeader}>
                    <Text style={styles.roomNumber}>{propertyName}</Text>
                    <View style={styles.headerRight}>
                        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(urgency) }]}>
                            <Text style={styles.urgencyText}>{urgency}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                            <Text style={styles.statusText}>{getStatusText(status)}</Text>
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
                            <Text style={styles.infoText}>
                                {formattedPrice}
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="key-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>
                                Code: {accessCode}
                            </Text>
                        </View>
                    </View>

                    {reservationId && (
                        <View style={styles.reservationInfo}>
                            <Ionicons name="bookmark-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>
                                Reservation: {reservationId}
                            </Text>
                        </View>
                    )}
                </View>

                {/* No action buttons needed in home page */}
            </TouchableOpacity>
        );
    };

    if (error) {
        // Special case for permission error
        if (error.includes('permission')) {
            return (
                <View style={styles.container}>
                    {renderMonthCalendar()}
                    <View style={styles.errorContainer}>
                        <Ionicons name="lock-closed" size={48} color="#FF3B30" />
                        <Text style={styles.errorTitle}>Access Restricted</Text>
                        <Text style={styles.errorText}>
                            You don't have permission to view pending requests. Please contact an administrator.
                        </Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={handleRefresh}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        // For other errors
        return (
            <View style={styles.container}>
                {renderMonthCalendar()}
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color="#FF3B30" />
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleRefresh}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const filteredTasks = getFilteredTasks();
    const pendingTasks = cleaningTasks.filter(task => task.status === STATUS.PENDING);
    console.log(
        `Total tasks: ${cleaningTasks.length}, ` +
        `Pending tasks: ${pendingTasks.length}, ` +
        `Filtered tasks: ${filteredTasks.length}`
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Task</Text>
            </View>

            <View style={styles.weekCalendarContainer}>
                {renderWeekCalendar()}
            </View>

            <TouchableOpacity
                style={styles.calendarToggle}
                onPress={toggleCalendarExpanded}
            >
                <Text style={styles.monthYearText}>
                    {calendarExpanded ? "Hide Calendar" : "Show Calendar"}
                </Text>
                <Ionicons
                    name={calendarExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#00BFA6"
                />
            </TouchableOpacity>

            {calendarExpanded && (
                <View style={styles.compactCalendarContainer}>
                    <View style={styles.yearNavigator}>
                        <TouchableOpacity onPress={handlePrevYear} style={styles.yearButton}>
                            <Ionicons name="chevron-back" size={24} color="#00BFA6" />
                        </TouchableOpacity>
                        <Text style={styles.yearText}>{selectedMonth.getFullYear()}</Text>
                        <TouchableOpacity onPress={handleNextYear} style={styles.yearButton}>
                            <Ionicons name="chevron-forward" size={24} color="#00BFA6" />
                        </TouchableOpacity>
                    </View>
                    {renderMonthCalendar()}
                </View>
            )}

            {loading && filteredTasks.length === 0 ? (
                <View style={styles.centeredContent}>
                    <ActivityIndicator size="large" color="#00BFA6" />
                    <Text style={styles.loadingText}>Loading requests...</Text>
                </View>
            ) : filteredTasks.length === 0 ? (
                <View style={styles.centeredContent}>
                    <Ionicons name="calendar-outline" size={64} color="#CCCCCC" />
                    <Text style={styles.noTasksText}>No cleaning requests for this date</Text>
                    {pendingTasks.length > 0 && (
                        <Text style={styles.helperText}>
                            {`${pendingTasks.length} pending tasks available on other dates`}
                        </Text>
                    )}
                </View>
            ) : (
                <FlatList
                    data={filteredTasks}
                    keyExtractor={(item) => item.id || item._id}
                    renderItem={renderTask}
                    contentContainerStyle={styles.taskList}
                    ListFooterComponent={renderFooter}
                    refreshing={loading}
                    onRefresh={handleRefresh}
                />
            )}
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
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: '#ffffff',
        marginTop: 50,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    refreshButton: {
        padding: 8,
        marginRight: 8,
    },
    notificationButton: {
        padding: 8,
    },
    yearNavigator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        backgroundColor: '#ffffff',
    },
    yearButton: {
        padding: 8,
    },
    yearText: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 16,
    },
    calendarToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#e6f7f5',
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    monthYearText: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
        color: '#00BFA6',
    },
    compactCalendarContainer: {
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 16,
        paddingBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    weekCalendarContainer: {
        marginTop: 8,
        marginBottom: 16,
    },
    monthRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginTop: 8,
        marginBottom: 16,
    },
    monthItem: {
        width: '30%',
        alignItems: 'center',
        paddingVertical: 8,
        marginVertical: 4,
        borderRadius: 8,
    },
    monthItemSelected: {
        backgroundColor: '#e6f7f5',
    },
    monthName: {
        fontSize: 14,
        color: '#333',
    },
    monthNameSelected: {
        color: '#00BFA6',
        fontWeight: 'bold',
    },
    weekCalendar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    dayItem: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        minWidth: 40,
    },
    dayItemToday: {
        backgroundColor: '#e6f7f5',
    },
    dayItemSelected: {
        backgroundColor: '#00BFA6',
    },
    dayText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    weekdayText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    weekdayTextSelected: {
        color: '#ffffff',
    },
    monthCalendarWrapper: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        margin: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    currentMonthTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    daysOfWeekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dayOfWeek: {
        width: '14.28%',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
    },
    monthDaysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
    },
    emptyDay: {
        opacity: 0,
    },
    calendarDayText: {
        fontSize: 14,
        color: '#333',
    },
    monthSelector: {
        marginTop: 16,
    },
    monthsScrollView: {
        paddingVertical: 8,
    },
    monthButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
        backgroundColor: '#f2f2f2',
    },
    selectedMonthButton: {
        backgroundColor: '#00BFA6',
    },
    monthButtonText: {
        fontSize: 14,
        color: '#666',
    },
    selectedMonthButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
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
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderLeftWidth: 4,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    taskCustomerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    taskAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    taskCustomerInitial: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
    },
    taskCustomerName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    taskStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: '#FFF9C4',
    },
    taskStatusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFA000',
    },
    taskDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskIcon: {
        marginRight: 8,
    },
    taskText: {
        fontSize: 14,
        color: '#555',
    },
    taskButtonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    taskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#00BFA6',
    },
    taskButtonLabel: {
        color: '#ffffff',
        fontWeight: 'bold',
        marginLeft: 4,
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
        marginBottom: 10,
    },
    errorText: {
        color: '#666',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#00BFA5',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    calendarToday: {
        backgroundColor: '#e6f7f5',
        borderRadius: 16,
    },
    calendarDaySelected: {
        backgroundColor: '#00BFA6',
        borderRadius: 16,
    },
    calendarDayTextSelected: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    todayText: {
        color: '#00BFA5',
        fontWeight: 'bold',
    },
    taskDot: {
        minWidth: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
        marginTop: 4,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    taskCount: {
        fontSize: 8,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    acceptButton: {
        backgroundColor: '#00BFA5',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    acceptButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
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
    roomNumber: {
        fontSize: 18,
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
    readyCard: {
        borderLeftColor: '#00BFA5',
    },
    dayTextSelected: {
        color: '#ffffff',
    },
    helperText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    urgencyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    urgencyText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    checkoutLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reservationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    noDateText: {
        color: '#ff5252',
        fontStyle: 'italic',
    },
    disabledButton: {
        opacity: 0.7,
    },
    actionButton: {
        backgroundColor: '#00BFA5',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
}); 