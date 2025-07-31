import { Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState, useMemo } from 'react';
import MonthCalendar from '../components/home/MonthCalendar';
import WeekCalendar from '../components/home/WeekCalendar';
import CalendarHeader from '../components/home/CalendarHeader';
import TaskList from '../components/home/TaskList';
import { useReservation } from '../hooks/useReservation';
import { useCalendar } from '../hooks/useCalendar';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
    
    const { 
        cleaningTasks, 
        loading, 
        error, 
        fetchAllCleaningTasks,
        clearTaskCache,
        fetching,
        getTasksForDate,
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
        goToToday,
        findNextDateWithTasks
    } = useCalendar(cleaningTasks);

    // Memoized data
    const tasksForSelectedDate = useMemo(() => {
        return getTasksForDate(selectedDate);
    }, [selectedDate, getTasksForDate]);

    const allTasksGrouped = useMemo(() => {
        return getAllTasksGroupedByDate();
    }, [getAllTasksGroupedByDate]);

    const calendarDays = useMemo(() => {
        return generateWeekDays(selectedDate);
    }, [generateWeekDays, selectedDate]);

    const monthData = useMemo(() => {
        return generateMonthDays(selectedMonth);
    }, [generateMonthDays, selectedMonth]);

    const nextDateWithTasks = useMemo(() => {
        return findNextDateWithTasks(selectedDate);
    }, [findNextDateWithTasks, selectedDate]);

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

    // Handle scroll end reached - auto advance to next date
    const handleScrollEndReached = useCallback(() => {
        if (isAutoAdvancing || !dataLoaded || tasksForSelectedDate.length === 0) {
            return;
        }
        
        const nextDate = nextDateWithTasks;
        if (nextDate) {
            setIsAutoAdvancing(true);
            
            setTimeout(() => {
                selectDate(nextDate);
                setTimeout(() => {
                    setIsAutoAdvancing(false);
                }, 1000);
            }, 300);
        }
    }, [isAutoAdvancing, dataLoaded, tasksForSelectedDate.length, nextDateWithTasks, selectDate]);

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

            <View style={styles.weekCalendarContainer}>
                <WeekCalendar
                    calendarDays={calendarDays}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                />
            </View>

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

            <TaskList
                tasks={tasksForSelectedDate}
                selectedDate={selectedDate}
                allTasksCount={allTasksGrouped.length}
                loading={loading && !dataLoaded}
                error={error}
                refreshing={fetching}
                nextDateWithTasks={nextDateWithTasks}
                onTaskPress={handleTaskPress}
                onBookingInfoPress={handleBookingInfoPress}
                onRefresh={handleRefresh}
                onGoToToday={goToToday}
                onScrollEndReached={handleScrollEndReached}
                isAutoAdvancing={isAutoAdvancing}
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