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
import { 
    validateTaskData, 
    getDataIncompleteMessage,
    extractPropertyInfo,
    extractGuestInfo 
} from '../utils/dataUtils';

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

    // Production-ready booking info handler
    const handleBookingInfoPress = useCallback((task) => {
        const taskValidation = validateTaskData(task);
        const propertyInfo = extractPropertyInfo(task);
        const guestInfo = extractGuestInfo(task);
        
        // Build message dynamically based on available data
        let message = '';
        let missingItems = [];
        
        // Property information
        if (propertyInfo.hasPropertyData) {
            message += `Property: ${propertyInfo.name}`;
            if (propertyInfo.hasAddress) {
                message += `\nAddress: ${propertyInfo.address}`;
            }
        } else {
            message += `Property: Not specified`;
            missingItems.push('property details');
        }
        
        // Guest information
        if (guestInfo.hasGuestData) {
            message += `\nGuest: ${guestInfo.name}`;
        } else {
            missingItems.push('guest information');
        }
        
        // Reservation ID
        if (guestInfo.hasReservationId) {
            const formattedId = guestInfo.reservationId.length >= 8 
                ? guestInfo.reservationId.slice(-8).toUpperCase()
                : guestInfo.reservationId.toUpperCase();
            message += `\nReservation ID: ${formattedId}`;
        } else {
            missingItems.push('reservation ID');
        }
        
        // Date information
        const checkInDate = task.checkInDate;
        const checkOutDate = task.checkOutDate;
        
        if (checkInDate) {
            const checkIn = new Date(checkInDate).toLocaleDateString('en-US', { 
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
            });
            message += `\nCheck-in: ${checkIn}`;
        } else {
            message += `\nCheck-in: Not specified`;
            missingItems.push('check-in date');
        }
        
        if (checkOutDate) {
            const checkOut = new Date(checkOutDate).toLocaleDateString('en-US', { 
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
            });
            message += `\nCheck-out: ${checkOut}`;
        } else {
            message += `\nCheck-out: Not specified`;
            missingItems.push('check-out date');
        }
        
        // Number of guests
        const guests = task.reservationDetails?.numberOfGuests || task.numberOfGuests;
        if (guests) {
            message += `\nGuests: ${guests}`;
        } else {
            message += `\nGuests: Not specified`;
            missingItems.push('guest count');
        }
        
        // Add data completeness information if there are missing items
        if (missingItems.length > 0) {
            message += `\n\n⚠️ Incomplete Data`;
            message += `\nMissing: ${missingItems.join(', ')}`;
        }
        
        const alertTitle = taskValidation.isDataComplete ? 'Booking Information' : 'Task Details (Incomplete)';
        
        Alert.alert(alertTitle, message, [{ text: 'Close' }]);
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