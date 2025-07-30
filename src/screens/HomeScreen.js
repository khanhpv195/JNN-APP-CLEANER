import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { format, isSameDay } from 'date-fns';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MonthCalendar from '../components/home/MonthCalendar';
import WeekCalendar from '../components/home/WeekCalendar';
import { useReservation } from '../hooks/useReservation';

const SELECTED_DATE_KEY = '@cleaner_app/selected_date';
const DAYS_TO_LOAD = 30; // Tải dữ liệu cho 30 ngày để hiển thị chấm đỏ

export default function HomeScreen() {
    const navigation = useNavigation();
    // Initialize with today's date, will be updated by persisted date if available
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedMonth, setSelectedMonth] = useState(new Date(today));
    const [calendarDays, setCalendarDays] = useState([]);
    const [months, setMonths] = useState([]);
    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const [allTasks, setAllTasks] = useState([]);
    const [tasksForSelectedDate, setTasksForSelectedDate] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const scrollViewRef = useRef(null);
    const currentVisibleDateRef = useRef(new Date());
    
    const { 
        cleaningTasks, 
        loading, 
        error, 
        updateTask, 
        fetchAllCleaningTasks,
        clearTaskCache,
        fetching,
        getTasksForDate,
        getAllTasksGroupedByDate
    } = useReservation();
    
    // Refs to track state
    const isMounted = useRef(true);
    const currentMonthRef = useRef(`${selectedMonth.getFullYear()}-${selectedMonth.getMonth()}`);

    // Load persisted date on mount
    useEffect(() => {
        const loadPersistedDate = async () => {
            try {
                const savedDateStr = await AsyncStorage.getItem(SELECTED_DATE_KEY);
                if (savedDateStr) {
                    const savedDate = new Date(savedDateStr);
                    // Check if saved date is valid and not too old (more than 30 days)
                    const today = new Date();
                    const daysDiff = Math.abs(today - savedDate) / (1000 * 60 * 60 * 24);
                    
                    if (!isNaN(savedDate.getTime()) && daysDiff <= 30) {
                        setSelectedDate(savedDate);
                        setSelectedMonth(savedDate);
                        currentVisibleDateRef.current = savedDate;
                        console.log('[HomeScreen] Loaded persisted date:', savedDate.toDateString());
                    } else {
                        // Use today's date if saved date is invalid or too old
                        console.log('[HomeScreen] Saved date is invalid or too old, using today');
                        const todayDate = new Date();
                        setSelectedDate(todayDate);
                        setSelectedMonth(todayDate);
                        currentVisibleDateRef.current = todayDate;
                    }
                } else {
                    // No saved date, use today
                    console.log('[HomeScreen] No saved date, using today');
                    const todayDate = new Date();
                    setSelectedDate(todayDate);
                    setSelectedMonth(todayDate);
                    currentVisibleDateRef.current = todayDate;
                }
            } catch (error) {
                console.error('Error loading persisted date:', error);
                // Fallback to today's date
                const todayDate = new Date();
                setSelectedDate(todayDate);
                setSelectedMonth(todayDate);
                currentVisibleDateRef.current = todayDate;
            }
        };
        loadPersistedDate();
        
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Save selected date whenever it changes
    useEffect(() => {
        const persistDate = async () => {
            try {
                await AsyncStorage.setItem(SELECTED_DATE_KEY, selectedDate.toISOString());
            } catch (error) {
                console.error('Error persisting selected date:', error);
            }
        };
        persistDate();
    }, [selectedDate]);

    // Initial data load - only once when component mounts
    useEffect(() => {
        if (!dataLoaded && isMounted.current) {
            console.log('[HomeScreen] Initial data load');
            fetchAllCleaningTasks().then(() => {
                setDataLoaded(true);
                console.log('[HomeScreen] Initial data loaded');
            });
        }
    }, [fetchAllCleaningTasks, dataLoaded]);

    // Update all tasks when cleaningTasks changes
    useEffect(() => {
        if (isMounted.current && dataLoaded) {
            const groupedTasks = getAllTasksGroupedByDate();
            setAllTasks(groupedTasks);
            console.log(`[HomeScreen] Data changed: Found ${groupedTasks.length} days with tasks`);
        }
    }, [cleaningTasks, getAllTasksGroupedByDate, dataLoaded]);

    // Update tasks for selected date whenever selectedDate or cleaningTasks changes
    useEffect(() => {
        if (isMounted.current && selectedDate) {
            const tasksForDate = getTasksForDate(selectedDate);
            setTasksForSelectedDate(tasksForDate);
            console.log(`[HomeScreen] Selected date tasks updated: ${tasksForDate.length} tasks for ${selectedDate.toDateString()}`);
        }
    }, [selectedDate, cleaningTasks, getTasksForDate]);

    // Update calendar UI when tasks or dates change
    useEffect(() => {
        if (isMounted.current) {
            generateCalendarDays(selectedDate);
            generateMonths(selectedMonth);
        }
    }, [selectedDate, selectedMonth, cleaningTasks, generateCalendarDays, generateMonths]);

    // Refresh data when screen is focused - but only if data hasn't been loaded yet
    useFocusEffect(
        useCallback(() => {
            console.log('[HomeScreen] Screen focused');
            if (isMounted.current && !dataLoaded && !fetching) {
                console.log('[HomeScreen] Loading data on focus');
                fetchAllCleaningTasks().then(() => {
                    setDataLoaded(true);
                });
            }
            
            return () => {
                console.log('[HomeScreen] Screen unfocused');
            };
        }, [fetchAllCleaningTasks, dataLoaded, fetching])
    );

    // Scroll handling removed - we now show tasks for selected date only

    // Generate calendar days for week view
    const generateCalendarDays = useCallback((centerDate = new Date()) => {
        const baseDateForCalendar = new Date(centerDate);
        baseDateForCalendar.setHours(0, 0, 0, 0);

        const days = [];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = -3; i <= 3; i++) {
            const date = new Date(baseDateForCalendar);
            date.setDate(baseDateForCalendar.getDate() + i);
            date.setHours(0, 0, 0, 0);

            // Check if this date is today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isToday = date.getTime() === today.getTime();

            // Check for tasks on this day
            const tasksForThisDay = getTasksForDate(date);
            const hasTask = tasksForThisDay.length > 0;

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
    }, [getTasksForDate]);

    // Generate months for month calendar
    const generateMonths = useCallback((centerDate = new Date()) => {
        const months = [];
        const baseYear = centerDate.getFullYear();

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

            // Add empty days for proper alignment
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

                // Check for tasks on this day
                const tasksForThisDay = getTasksForDate(date);
                const hasTask = tasksForThisDay.length > 0;

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
    }, [getTasksForDate]);

    // Handle date selection
    const handleDateSelect = (fullDate) => {
        const newSelectedDate = new Date(fullDate);
        newSelectedDate.setHours(0, 0, 0, 0);
        
        console.log(`[HomeScreen] Selected date: ${newSelectedDate.toDateString()}`);
        
        // Update selected date
        setSelectedDate(newSelectedDate);
        currentVisibleDateRef.current = newSelectedDate;

        // Update the selected month if the date is in a different month
        if (newSelectedDate.getMonth() !== selectedMonth.getMonth() ||
            newSelectedDate.getFullYear() !== selectedMonth.getFullYear()) {
            setSelectedMonth(newSelectedDate);
        }
    };
    

    // Handle month selection
    const handleMonthSelect = (monthIndex) => {
        try {
            // Validate monthIndex
            if (typeof monthIndex !== 'number' || monthIndex < 0 || monthIndex > 11) {
                console.error(`[HomeScreen] Invalid month index: ${monthIndex}`);
                return;
            }
            
            console.log(`[HomeScreen] Month selected: ${monthIndex}`);
            
            // Safely create new date
            const newDate = new Date(selectedMonth.getFullYear(), monthIndex, 1);
            
            // Validate the created date
            if (isNaN(newDate.getTime())) {
                console.error(`[HomeScreen] Invalid date created for month: ${monthIndex}`);
                return;
            }
            
            setSelectedMonth(newDate);

            // If there's no selected date in this month, set it to the 1st
            const currentSelectedMonth = selectedDate.getMonth();
            const currentSelectedYear = selectedDate.getFullYear();
            
            if (currentSelectedMonth !== monthIndex || currentSelectedYear !== newDate.getFullYear()) {
                // Set selected date to the 1st of the month
                const newSelectedDate = new Date(newDate);
                setSelectedDate(newSelectedDate);
                
                // Update tasks for the selected date safely
                if (getTasksForDate) {
                    const tasks = getTasksForDate(newSelectedDate);
                    console.log(`[HomeScreen] Month changed, found ${tasks.length} tasks for ${newSelectedDate.toDateString()}`);
                }
            }
        } catch (error) {
            console.error(`[HomeScreen] Error in handleMonthSelect:`, error);
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        console.log('[HomeScreen] Manual refresh triggered');
        clearTaskCache();
        setDataLoaded(false);
        fetchAllCleaningTasks().then(() => {
            setDataLoaded(true);
        });
    };

    // Function to clear old saved date (for debugging purposes)
    const clearSavedDate = async () => {
        try {
            await AsyncStorage.removeItem(SELECTED_DATE_KEY);
            console.log('[HomeScreen] Cleared saved date');
            // Reset to today's date
            const todayDate = new Date();
            setSelectedDate(todayDate);
            setSelectedMonth(todayDate);
            currentVisibleDateRef.current = todayDate;
        } catch (error) {
            console.error('Error clearing saved date:', error);
        }
    };

    // Handle task press
    const handleTaskPress = (task) => {
        console.log('[HomeScreen] Task pressed:', task._id);
        navigation.navigate('TaskDetail', {
            taskId: task._id,
            task: task,
            refreshOnReturn: true
        });
    };

    // Handle booking info press
    const handleBookingInfoPress = (task) => {
        console.log('[HomeScreen] Booking info pressed for task:', task._id);
        
        // Extract booking information
        const propertyName = task.propertyId?.name || 'Unknown Property';
        const guestName = task.reservationDetails?.guest?.name || 'Unknown Guest';
        const checkIn = task.reservationDetails?.checkIn ? new Date(task.reservationDetails.checkIn).toLocaleDateString() : 'N/A';
        const checkOut = task.reservationDetails?.checkOut ? new Date(task.reservationDetails.checkOut).toLocaleDateString() : 'N/A';
        const guests = task.reservationDetails?.numberOfGuests || 'N/A';
        const reservationId = task.reservationId ? task.reservationId : 'N/A';
        
        // Show alert with booking information
        Alert.alert(
            'Booking Information',
            `Property: ${propertyName}\nGuest: ${guestName}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nGuests: ${guests}\nReservation ID: ${reservationId}`,
            [{ text: 'Close' }]
        );
    };

    // Toggle calendar expanded
    const toggleCalendarExpanded = () => {
        setCalendarExpanded(!calendarExpanded);
    };

    // Handle year navigation
    const handlePrevYear = () => {
        const prevYear = new Date(selectedMonth);
        prevYear.setFullYear(prevYear.getFullYear() - 1);
        setSelectedMonth(prevYear);
    };

    const handleNextYear = () => {
        const nextYear = new Date(selectedMonth);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setSelectedMonth(nextYear);
    };

    // Render a date header
    const renderDateHeader = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dateObj = new Date(date);
        const isToday = dateObj.toDateString() === today.toDateString();
        
        const isTomorrow = new Date(today);
        isTomorrow.setDate(today.getDate() + 1);
        const isTomorrowDate = dateObj.toDateString() === isTomorrow.toDateString();
        
        let dateLabel;
        if (isToday) {
            dateLabel = "Today";
        } else if (isTomorrowDate) {
            dateLabel = "Tomorrow";
        } else {
            dateLabel = "";
        }
        
        return (
            <View 
                key={`header-${date}`} 
                style={styles.dateHeader}
            >
                <Text style={styles.dateHeaderText}>
                    {dateLabel ? `${dateLabel} - ` : ""}
                    {format(new Date(date), 'EEE, MMM d yyyy')}
                </Text>
            </View>
        );
    };

    // Render a task
    const renderTask = (task) => {
        const {
            _id,
            status,
            propertyId,
            checkOutDate,
            checkInDate,
            reservationId = ''
        } = task;

        // Format dates
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        };

        const formatTime = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
        };

        // Get property details
        const propertyName = propertyId?.name || 'Unknown Property';
        const address = propertyId?.address || {};

        // Format address
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

        // Get guest name
        const guestName = task.reservationDetails?.guest?.name || 'Unknown Guest';

        return (
            <TouchableOpacity key={_id} onPress={() => handleTaskPress(task)}>
                <View style={styles.taskCard}>
                    <Text style={styles.propertyTitle}>{propertyName}</Text>
                    <Text style={styles.addressText}>{formattedAddress}</Text>
                    
                    <View style={styles.timeInfo}>
                        <Text style={styles.timeInfoText}>
                            Check-in: {formatDate(checkInDate)} • {formatTime(checkInDate)}
                        </Text>
                        <Text style={styles.timeInfoText}>
                            Check-out: {formatDate(checkOutDate)} • {formatTime(checkOutDate)}
                        </Text>
                    </View>
                    
                    <Text style={styles.reservationId}>Reservation ID: {reservationId ? reservationId.slice(-8).toUpperCase() : 'N/A'} </Text>

                    <Text style={styles.reservationId}>Guest: {guestName} </Text>
                    
                    <TouchableOpacity 
                        style={styles.bookingInfoButton}
                        onPress={() => handleBookingInfoPress(task)}
                    >
                        <Ionicons name="information-circle-outline" size={16} color="#00BFA6" />
                        <Text style={styles.bookingInfoText}>Booking Info</Text>
                        <Ionicons name="chevron-down" size={16} color="#00BFA6" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Task</Text>
                <TouchableOpacity 
                    style={styles.refreshButton} 
                    onPress={handleRefresh}
                    disabled={fetching}
                >
                    <Ionicons 
                        name="refresh" 
                        size={24} 
                        color={fetching ? "#CCCCCC" : "#00BFA6"} 
                    />
                </TouchableOpacity>
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

            {loading && !dataLoaded ? (
                <View style={styles.centeredContent}>
                    <ActivityIndicator size="large" color="#00BFA6" />
                    <Text style={styles.loadingText}>Loading requests...</Text>
                </View>
            ) : error ? (
                <View style={styles.centeredContent}>
                    <Ionicons name="alert-circle" size={64} color="#FF3B30" />
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleRefresh}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : tasksForSelectedDate.length === 0 ? (
                <View style={styles.centeredContent}>
                    <Ionicons name="calendar-outline" size={64} color="#CCCCCC" />
                    <Text style={styles.noTasksText}>No cleaning requests for {selectedDate.toDateString()}</Text>
                    {allTasks.length > 0 && (
                        <Text style={styles.helperText}>
                            {`${allTasks.length} task groups available on other dates`}
                        </Text>
                    )}
                    {dataLoaded ? null : (
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={handleRefresh}
                        >
                            <Text style={styles.retryButtonText}>Refresh</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.taskListContainer}
                    contentContainerStyle={styles.taskListContent}
                    showsVerticalScrollIndicator={true}
                    scrollEventThrottle={16}
                >
                    {renderDateHeader(selectedDate)}
                    {tasksForSelectedDate.map(task => renderTask(task))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
    },
    refreshButton: {
        padding: 8,
        borderRadius: 20,
    },
    weekCalendarContainer: {
        marginBottom: 16,
    },
    calendarToggle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 8,
    },
    monthYearText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#00BFA6',
        marginRight: 4,
    },
    compactCalendarContainer: {
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    yearNavigator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    yearButton: {
        padding: 4,
    },
    yearText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    selectedDateHeader: {
        marginVertical: 16,
    },
    selectedDateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    taskListContainer: {
        flex: 1,
    },
    taskListContent: {
        paddingBottom: 16,
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    errorTitle: {
        marginTop: 16,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
    },
    errorText: {
        marginTop: 8,
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#00BFA6',
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    noTasksText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    taskCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#00BFA6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    propertyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    timeInfo: {
        marginBottom: 12,
    },
    timeInfoText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    reservationId: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    taskActions: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 12,
        marginBottom: 12,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bookingInfoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookingInfoText: {
        color: '#00BFA6',
        fontSize: 14,
        fontWeight: '500',
        marginHorizontal: 8,
    },
    dateHeader: {
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    dateHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    helperText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
}); 