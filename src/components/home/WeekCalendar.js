import { Ionicons } from '@expo/vector-icons';
import { addDays, isSameDay, subDays } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const WeekCalendar = ({ calendarDays, selectedDate, onDateSelect }) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
    const scrollViewRef = useRef(null);

    // Debug logging for calendar days
    useEffect(() => {
        if (calendarDays && calendarDays.length > 0) {
            const daysWithTasks = calendarDays.filter(day => day.hasTask);
            console.log(`[WeekCalendar] Days with tasks: ${daysWithTasks.length}`);
            
            if (daysWithTasks.length > 0) {
                console.log(`[WeekCalendar] Days with tasks:`, 
                    daysWithTasks.map(day => `${day.fullDate.toDateString()}: ${day.tasksCount} tasks`).join(', '));
            }
        }
    }, [calendarDays]);

    // Scroll to center on mount and when selectedDate changes
    useEffect(() => {
        if (scrollViewRef.current) {
            // Use setTimeout to ensure the scroll happens after render
            setTimeout(() => {
                scrollViewRef.current.scrollTo({ x: 50 * 3, animated: true });
            }, 100);
        }
    }, [selectedDate]);

    // Handle navigation between weeks
    const navigateToPreviousWeek = () => {
        const newDate = subDays(selectedDate, 7);
        onDateSelect(newDate);
    };

    const navigateToNextWeek = () => {
        const newDate = addDays(selectedDate, 7);
        onDateSelect(newDate);
    };

    // Handle today button press
    const goToToday = () => {
        onDateSelect(new Date());
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={navigateToPreviousWeek}
                >
                    <Ionicons name="chevron-back" size={24} color="#00BFA6" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.todayButton}
                    onPress={goToToday}
                >
                    <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={navigateToNextWeek}
                >
                    <Ionicons name="chevron-forward" size={24} color="#00BFA6" />
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.daysContainer}
            >
                {calendarDays.map((day, index) => {
                    const isSelected = selectedDate && isSameDay(day.fullDate, selectedDate);
                    
                    // Debug log for days with tasks
                    if (day.hasTask) {
                        console.log(`[WeekCalendar] Rendering day ${day.day} (${day.fullDate.toDateString()}) with ${day.tasksCount} tasks, hasTask=${day.hasTask}`);
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
                            {day.hasTask && (
                                <View 
                                    style={[
                                        styles.taskIndicator,
                                        isSelected && styles.selectedTaskIndicator
                                    ]} 
                                />
                            )}
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
        paddingVertical: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    navigationButton: {
        padding: 5,
    },
    todayButton: {
        backgroundColor: '#F0F8FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    todayButtonText: {
        color: '#00BFA6',
        fontWeight: '600',
        fontSize: 14,
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
        // No background color here, we'll use the circle for selection
    },
    dayText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    selectedDayText: {
        color: '#00BFA6',
        fontWeight: '600',
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
    taskIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 8,
        height: 8,
        backgroundColor: '#FF5252',
        borderRadius: 4,
    },
    selectedTaskIndicator: {
        backgroundColor: '#ffffff', // Chấm trắng khi ngày được chọn
    }
});

export default WeekCalendar; 