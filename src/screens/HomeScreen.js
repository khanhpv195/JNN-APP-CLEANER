import { Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState, useMemo } from 'react';
import MonthCalendar from '../components/home/MonthCalendar';
import CalendarHeader from '../components/home/CalendarHeader';
import WeekCalendar from '../components/home/WeekCalendar';
import TimelineTaskList from '../components/home/TimelineTaskList';
import { useReservation } from '../hooks/useReservation';
import { useCalendar } from '../hooks/useCalendar';
import { 
    createTimelineData, 
    determineViewMode, 
    getViewModeText, 
    getEmptyStateMessage,
    VIEW_MODES 
} from '../utils/timelineUtils';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    
    // View mode state for better UX clarity
    const [currentViewMode, setCurrentViewMode] = useState(VIEW_MODES.ALL_UPCOMING);
    
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
        generateMonthDays,
        selectDate,
        selectMonth,
        navigateYear,
        goToToday
    } = useCalendar(cleaningTasks);

    // Clean timeline data creation with proper view mode management
    const timelineViewMode = useMemo(() => {
        return determineViewMode(selectedDate);
    }, [selectedDate]);

    // Update current view mode when timeline view mode changes
    useEffect(() => {
        setCurrentViewMode(timelineViewMode);
    }, [timelineViewMode]);

    // Clean, optimized timeline data
    const timelineData = useMemo(() => {
        return createTimelineData(cleaningTasks, currentViewMode, selectedDate);
    }, [cleaningTasks, currentViewMode, selectedDate]);

    // Current view information for better UX
    const viewModeInfo = useMemo(() => ({
        title: getViewModeText(currentViewMode, selectedDate),
        emptyMessage: getEmptyStateMessage(currentViewMode, selectedDate),
        hasDateFilter: currentViewMode === VIEW_MODES.DATE_FILTER
    }), [currentViewMode, selectedDate]);


    const monthData = useMemo(() => {
        const data = generateMonthDays(selectedMonth);
        console.log('[HomeScreen] Generated monthData:', data, 'Type:', typeof data, 'Is Array:', Array.isArray(data));
        return data;
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

    // Handle booking info press - with better data extraction
    const handleBookingInfoPress = useCallback((task) => {
        // Debug: Log task structure to console
        console.log('Task data:', JSON.stringify(task, null, 2));
        
        const propertyName = task.propertyId?.name || task.property?.name || 'Property Information';
        const guestName = task.reservationDetails?.guest?.name || task.guest?.name || null;
        const checkInDate = task.checkInDate || task.reservationDetails?.checkIn;
        const checkOutDate = task.checkOutDate || task.reservationDetails?.checkOut;
        const checkIn = checkInDate ? new Date(checkInDate).toLocaleDateString() : 'N/A';
        const checkOut = checkOutDate ? new Date(checkOutDate).toLocaleDateString() : 'N/A';
        const guests = task.reservationDetails?.numberOfGuests || task.numberOfGuests || 'N/A';
        const reservationId = task.reservationId || task.id || 'N/A';
        
        // Build message dynamically - skip guest if no data
        let message = `Property: ${propertyName}`;
        if (guestName) {
            message += `\nGuest: ${guestName}`;
        }
        message += `\nCheck-in: ${checkIn}`;
        message += `\nCheck-out: ${checkOut}`;
        message += `\nGuests: ${guests}`;
        message += `\nReservation ID: ${reservationId}`;
        
        Alert.alert('Booking Information', message, [{ text: 'Close' }]);
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

    // Handle clear date selection - return to all upcoming tasks
    const handleClearDateSelection = useCallback(() => {
        selectDate(null);
        setCurrentViewMode(VIEW_MODES.ALL_UPCOMING);
    }, [selectDate]);

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
                onClearDateSelection={handleClearDateSelection}
                onMonthSelect={handleMonthSelect}
                isLoading={loading && !dataLoaded}
            />

            <View style={styles.weekCalendarContainer}>
                <WeekCalendar
                    calendarDays={monthData}
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

            <TimelineTaskList
                timelineData={timelineData}
                viewModeInfo={viewModeInfo}
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
        backgroundColor: '#FFFFFF',
    },
    calendarContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    weekCalendarContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    monthCalendarContainer: {
        padding: 16,
    },
});