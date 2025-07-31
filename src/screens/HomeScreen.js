import { Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState, useMemo } from 'react';
import MonthCalendar from '../components/home/MonthCalendar';
import WeekCalendar from '../components/home/WeekCalendar';
import CalendarHeader from '../components/home/CalendarHeader';
import TimelineTaskList from '../components/home/TimelineTaskList';
import { useReservation } from '../hooks/useReservation';
import { useCalendar } from '../hooks/useCalendar';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    
    const { 
        cleaningTasks, 
        loading, 
        error, 
        fetchAllCleaningTasks,
        clearTaskCache,
        fetching,
        getAllTasksGroupedByDate
    } = useReservation();
    
    const {
        selectedDate,
        selectedMonth,
        loadPersistedDate,
        generateWeekDays,
        generateMonthDays,
        selectDate,
        selectMonth,
        navigateYear,
        goToToday
    } = useCalendar(cleaningTasks);

    // Helper function to create timeline data - only from today onwards
    const createTimelineData = useCallback(() => {
        const tasksGrouped = getAllTasksGroupedByDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Filter and group tasks by date - only today and future dates
        const futureGroups = tasksGrouped
            .map(group => {
                const groupDate = new Date(group.date);
                groupDate.setHours(0, 0, 0, 0);
                
                return {
                    date: group.date,
                    tasks: group.tasks,
                    isToday: groupDate.getTime() === today.getTime(),
                    isTomorrow: groupDate.getTime() === tomorrow.getTime(),
                    dateObj: groupDate
                };
            })
            .filter(group => group.dateObj >= today); // Only today and future

        // Always include TODAY even if no tasks
        const todayExists = futureGroups.some(group => group.isToday);
        if (!todayExists) {
            futureGroups.unshift({
                date: today.toISOString(),
                tasks: [],
                isToday: true,
                isTomorrow: false,
                dateObj: today
            });
        }

        // Sort: Today first, Tomorrow second, then chronologically
        const sortedGroups = futureGroups.sort((a, b) => {
            if (a.isToday) return -1;
            if (b.isToday) return 1;
            if (a.isTomorrow) return -1;
            if (b.isTomorrow) return 1;
            return a.dateObj - b.dateObj;
        });

        return sortedGroups;
    }, [getAllTasksGroupedByDate]);

    // Memoized data
    const timelineData = useMemo(() => {
        return createTimelineData();
    }, [createTimelineData]);

    const calendarDays = useMemo(() => {
        return generateWeekDays(selectedDate);
    }, [generateWeekDays, selectedDate]);

    const monthData = useMemo(() => {
        return generateMonthDays(selectedMonth);
    }, [generateMonthDays, selectedMonth]);

    // Initialize calendar data on mount
    useEffect(() => {
        loadPersistedDate();
    }, [loadPersistedDate]);

    // Initial data load
    useEffect(() => {
        if (!dataLoaded) {
            fetchAllCleaningTasks().then(() => {
                setDataLoaded(true);
            });
        }
    }, [fetchAllCleaningTasks, dataLoaded]);

    // Refresh data when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (!dataLoaded && !fetching) {
                fetchAllCleaningTasks().then(() => {
                    setDataLoaded(true);
                });
            }
        }, [fetchAllCleaningTasks, dataLoaded, fetching])
    );

    // Handle task press
    const handleTaskPress = useCallback((task) => {
        navigation.navigate('TaskDetail', {
            taskId: task._id,
            task: task,
            refreshOnReturn: true
        });
    }, [navigation]);

    // Handle booking info press
    const handleBookingInfoPress = useCallback((task) => {
        const propertyName = task.propertyId?.name || 'Unknown Property';
        const guestName = task.reservationDetails?.guest?.name || 'Unknown Guest';
        const checkIn = task.reservationDetails?.checkIn ? new Date(task.reservationDetails.checkIn).toLocaleDateString() : 'N/A';
        const checkOut = task.reservationDetails?.checkOut ? new Date(task.reservationDetails.checkOut).toLocaleDateString() : 'N/A';
        const guests = task.reservationDetails?.numberOfGuests || 'N/A';
        const reservationId = task.reservationId ? task.reservationId : 'N/A';
        
        Alert.alert(
            'Booking Information',
            `Property: ${propertyName}\nGuest: ${guestName}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nGuests: ${guests}\nReservation ID: ${reservationId}`,
            [{ text: 'Close' }]
        );
    }, []);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        clearTaskCache();
        setDataLoaded(false);
        fetchAllCleaningTasks().then(() => {
            setDataLoaded(true);
        });
    }, [clearTaskCache, fetchAllCleaningTasks]);

    // Handle date selection
    const handleDateSelect = useCallback((date) => {
        selectDate(date);
        if (calendarExpanded) {
            setCalendarExpanded(false);
        }
    }, [selectDate, calendarExpanded]);

    // Handle month selection
    const handleMonthSelect = useCallback((monthIndex) => {
        selectMonth(monthIndex);
    }, [selectMonth]);

    // Handle year navigation
    const handlePrevYear = useCallback(() => {
        navigateYear(-1);
    }, [navigateYear]);

    const handleNextYear = useCallback(() => {
        navigateYear(1);
    }, [navigateYear]);

    // Handle refresh with haptic feedback
    const handleRefreshWithFeedback = useCallback(() => {
        handleRefresh();
    }, [handleRefresh]);

    // Toggle calendar expanded
    const toggleCalendarExpanded = useCallback(() => {
        setCalendarExpanded(!calendarExpanded);
    }, [calendarExpanded]);

    return (
        <View style={styles.container}>
            <CalendarHeader
                selectedDate={selectedDate}
                selectedMonth={selectedMonth}
                isExpanded={calendarExpanded}
                onToggleExpanded={toggleCalendarExpanded}
                onPrevYear={handlePrevYear}
                onNextYear={handleNextYear}
                isLoading={loading && !dataLoaded}
            />

            {/* WeekCalendar hidden in timeline view to avoid confusion */}

            {calendarExpanded && (
                <View style={styles.monthCalendarContainer}>
                    <MonthCalendar
                        months={[monthData]}
                        selectedMonth={selectedMonth}
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        onMonthSelect={handleMonthSelect}
                    />
                </View>
            )}

            <TimelineTaskList
                timelineData={timelineData}
                loading={loading && !dataLoaded}
                error={error}
                refreshing={fetching}
                onTaskPress={handleTaskPress}
                onBookingInfoPress={handleBookingInfoPress}
                onRefresh={handleRefreshWithFeedback}
                onGoToToday={goToToday}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        padding: 16,
    },
    weekCalendarContainer: {
        marginBottom: 16,
    },
    monthCalendarContainer: {
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
});