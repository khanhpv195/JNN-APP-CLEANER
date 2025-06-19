import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useReservation } from '../hooks/useReservation';
import { STATUS } from '../constants/status';
import WeekCalendar from '../components/home/WeekCalendar';
import MonthCalendar from '../components/home/MonthCalendar';
import TaskList from '../components/home/TaskList';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);
    const [months, setMonths] = useState([]);
    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const { cleaningTasks, loading, error, updateTask, fetchCleaningTasksNotPending, setFetching, getAllCachedTasks, clearTaskCache, taskCache } = useReservation();

    console.log('cleaningTasks in HomeScreen:', cleaningTasks);


    const refreshData = () => {
        // Force refresh by clearing cache and fetching current date
        clearTaskCache();
        
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



    // Effect for data fetching - only triggered by explicit actions
    useEffect(() => {
        // Initial data load only
        console.log('Initial data load');
        const dateToFetch = new Date(selectedDate);
        dateToFetch.setHours(0, 0, 0, 0);
        fetchCleaningTasksNotPending(dateToFetch);
        generateMonths(selectedMonth);
    }, []); // Empty dependency array - only run once on mount

    // Effect for date changes to update calendar visuals
    useEffect(() => {
        console.log('Selected date changed, updating calendar UI');
        generateCalendarDays(selectedDate);
    }, [selectedDate]);

    // Effect for month changes to update month calendar
    useEffect(() => {
        console.log('Selected month changed, updating month calendar');
        generateMonths(selectedMonth);
    }, [selectedMonth]);

    // Effect to regenerate calendars when tasks are loaded
    useEffect(() => {
        console.log('Tasks loaded, regenerating calendars');
        generateCalendarDays(selectedDate);
        generateMonths(selectedMonth);
    }, [cleaningTasks.length]);

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

                // Check for ALL tasks on this day using cached tasks, not just PENDING (consistent with generateCalendarDays)
                const allCachedTasks = getAllCachedTasks();
                const tasksForThisDay = allCachedTasks.filter(task => {
                    // Skip all PENDING tasks
                    if (task.status === STATUS.PENDING) return false;
                    
                    // Check both checkOutDate and reservationDetails.checkOut
                    if (task.checkOutDate) {
                        const taskDate = new Date(task.checkOutDate);
                        taskDate.setHours(0, 0, 0, 0);
                        return taskDate.toDateString() === date.toDateString();
                    } else if (task.reservationDetails?.checkOut) {
                        const taskDate = new Date(task.reservationDetails.checkOut);
                        taskDate.setHours(0, 0, 0, 0);
                        return taskDate.toDateString() === date.toDateString();
                    }
                    return false;
                });

                const hasTask = tasksForThisDay.length > 0;

                if (hasTask) {
                    console.log(`Month calendar: Date ${date.toDateString()} has ${tasksForThisDay.length} tasks`);
                }

                days.push({
                    day,
                    fullDate: date,
                    isToday,
                    hasTask,
                    tasksCount: tasksForThisDay.length
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

        const allCachedTasks = getAllCachedTasks();
        console.log('Generating calendar days with cached tasks count:', allCachedTasks.length);

        for (let i = -3; i <= 3; i++) {
            const date = new Date(baseDateForCalendar);
            date.setDate(baseDateForCalendar.getDate() + i);
            date.setHours(0, 0, 0, 0); // Ensure all dates are at midnight

            // Check if this date is today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isToday = date.getTime() === today.getTime();

            // Check for ALL tasks on this day using cached tasks, not just PENDING
            const tasksForThisDay = allCachedTasks.filter(task => {
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



    if (error) {
        // Special case for permission error
        if (error.includes('permission')) {
            return (
                <View style={styles.container}>
                    <MonthCalendar
                        months={months}
                        selectedMonth={selectedMonth}
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        onMonthSelect={handleMonthSelect}
                    />
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
                <MonthCalendar
                    months={months}
                    selectedMonth={selectedMonth}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onMonthSelect={handleMonthSelect}
                />
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
                <WeekCalendar
                    calendarDays={calendarDays}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                />
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
                    <MonthCalendar
                        months={months}
                        selectedMonth={selectedMonth}
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        onMonthSelect={handleMonthSelect}
                    />
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
                <TaskList
                    tasks={filteredTasks}
                    onTaskPress={handleTaskPress}
                    onRefresh={handleRefresh}
                    loading={loading}
                />
            )}
        </View>
    );
}



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
    helperText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
}); 