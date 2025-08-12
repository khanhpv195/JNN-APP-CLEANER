import { Ionicons } from '@expo/vector-icons';
import { isSameDay } from 'date-fns';
import React, { useEffect, useRef, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DOT_CONFIG, getDotConfiguration } from '../../utils/calendarUtils';

// Enhanced Task Indicator Dot Component
const TaskIndicatorDot = ({ hasTask, tasksCount, isToday, isSelected }) => {
    if (!hasTask) return null;
    
    const dotConfig = getDotConfiguration(tasksCount, isToday);
    
    if (dotConfig.showCount) {
        // Show count bubble for multiple tasks
        return (
            <View style={[
                styles.taskCountBubble,
                { 
                    backgroundColor: isSelected 
                        ? DOT_CONFIG.COLORS.SELECTED 
                        : dotConfig.dotColor 
                }
            ]}>
                <Text style={styles.taskCountText}>
                    {dotConfig.displayCount}
                </Text>
            </View>
        );
    } else {
        // Show simple dot for single task
        return (
            <View style={[
                styles.taskDot,
                {
                    backgroundColor: isSelected 
                        ? DOT_CONFIG.COLORS.SELECTED 
                        : dotConfig.dotColor,
                    width: dotConfig.dotSize,
                    height: dotConfig.dotSize,
                    borderRadius: dotConfig.dotSize / 2
                }
            ]} />
        );
    }
};

const WeekCalendar = ({ calendarDays = [], selectedDate, onDateSelect }) => {
    const scrollViewRef = useRef(null);

    // Generate safe calendar data if the prop is not valid
    const safeCalendarDays = useMemo(() => {
        console.log('[WeekCalendar] Received calendarDays:', calendarDays, 'Type:', typeof calendarDays, 'Is Array:', Array.isArray(calendarDays));
        
        if (!Array.isArray(calendarDays) || calendarDays.length === 0) {
            // Generate a basic week of days around today
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay()); // Start on Sunday
            
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                weekDays.push({
                    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
                    date: date.getDate(),
                    fullDate: date,
                    isToday: date.toDateString() === today.toDateString(),
                    hasTask: false,
                    tasksCount: 0
                });
            }
            return weekDays;
        }
        
        return calendarDays;
    }, [calendarDays]);

    // Debug logging for calendar days
    useEffect(() => {
        if (safeCalendarDays && Array.isArray(safeCalendarDays) && safeCalendarDays.length > 0) {
            const daysWithTasks = safeCalendarDays.filter(day => day.hasTask);
            console.log('[WeekCalendar] Days with tasks:', daysWithTasks.length);
            
            if (daysWithTasks.length > 0) {
                console.log('[WeekCalendar] Days with tasks:', 
                    daysWithTasks.map(day => day.fullDate.toDateString() + ': ' + day.tasksCount + ' tasks').join(', '));
            }
        }
    }, [safeCalendarDays]);

    // Scroll to center on mount and when selectedDate changes
    useEffect(() => {
        if (scrollViewRef.current) {
            // Use setTimeout to ensure the scroll happens after render
            setTimeout(() => {
                scrollViewRef.current.scrollTo({ x: 50 * 3, animated: true });
            }, 100);
        }
    }, [selectedDate]);

    // Navigation functions removed - handled by parent CalendarHeader

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.daysContainer}
            >
                {safeCalendarDays.map((day, index) => {
                    const isSelected = selectedDate && isSameDay(day.fullDate, selectedDate);
                    
                    // Debug log for days with tasks
                    if (day.hasTask) {
                        console.log('[WeekCalendar] Rendering day', day.day, day.fullDate.toDateString(), 'with', day.tasksCount, 'tasks, hasTask=', day.hasTask);
                    }
                    
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayItem,
                                isSelected && styles.selectedDayItem
                            ]}
                            onPress={() => onDateSelect(day.fullDate)}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    isSelected && styles.selectedDayText,
                                    day.isToday && styles.todayText
                                ]}
                            >
                                {day.day}
                            </Text>
                            <View
                                style={[
                                    styles.dateCircle,
                                    isSelected && styles.selectedDateCircle,
                                    day.isToday && styles.todayCircle
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dateText,
                                        isSelected && styles.selectedDateText,
                                        day.isToday && styles.todayDateText
                                    ]}
                                >
                                    {day.date}
                                </Text>
                            </View>
                            <TaskIndicatorDot 
                                hasTask={day.hasTask}
                                tasksCount={day.tasksCount}
                                isToday={day.isToday}
                                isSelected={isSelected}
                            />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingBottom: 8,
    },
    daysContainer: {
        paddingHorizontal: 10,
        paddingBottom: 5,
    },
    dayItem: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
        width: 50,
        position: 'relative',
    },
    selectedDayItem: {
        backgroundColor: 'rgba(0, 191, 166, 0.1)',
        borderRadius: 8,
        paddingVertical: 4,
    },
    dayText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    selectedDayText: {
        color: '#00BFA6',
        fontWeight: '700',
    },
    todayText: {
        fontWeight: '600',
        color: '#00BFA6',
    },
    dateCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        marginBottom: 6, // Space for the dot
    },
    selectedDateCircle: {
        backgroundColor: '#00BFA6',
        shadowColor: '#00BFA6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    todayCircle: {
        borderWidth: 1,
        borderColor: '#00BFA6',
        backgroundColor: 'white',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    selectedDateText: {
        color: 'white',
        fontWeight: '600',
    },
    todayDateText: {
        color: '#00BFA6',
        fontWeight: '600',
    },
    // Enhanced task indicators
    taskDot: {
        position: 'absolute',
        bottom: 2,
    },
    taskCountBubble: {
        position: 'absolute',
        bottom: -2,
        width: DOT_CONFIG.SIZES.TASK_COUNT,
        height: DOT_CONFIG.SIZES.TASK_COUNT,
        borderRadius: DOT_CONFIG.SIZES.TASK_COUNT / 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    taskCountText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    
    // Legacy styles (keeping for backwards compatibility)
    taskIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 8,
        height: 8,
        backgroundColor: '#FF5252',
        borderRadius: 4,
    },
    selectedTaskIndicator: {
        backgroundColor: '#ffffff',
    }
});

export default WeekCalendar; 