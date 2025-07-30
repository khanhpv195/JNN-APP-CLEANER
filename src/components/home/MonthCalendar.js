import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MonthCalendar = ({ 
    months, 
    selectedMonth, 
    selectedDate, 
    onDateSelect, 
    onMonthSelect 
}) => {
    // Add safety checks
    if (!months || !Array.isArray(months) || !selectedMonth) {
        console.warn('[MonthCalendar] Invalid props received');
        return null;
    }
    
    const currentMonth = months.find(m => m && typeof m.month === 'number' && m.month === selectedMonth.getMonth());

    // Debug logging
    useEffect(() => {
        if (currentMonth) {
            const daysWithTasks = currentMonth.days.filter(day => !day.empty && day.hasTask);
            console.log(`[MonthCalendar] Current month: ${currentMonth.monthName}, days with tasks: ${daysWithTasks.length}`);
            
            if (daysWithTasks.length > 0) {
                console.log(`[MonthCalendar] Days with tasks:`, 
                    daysWithTasks.map(day => `${day.fullDate.getDate()}: ${day.tasksCount} tasks`).join(', '));
            }
        }
    }, [currentMonth]);

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
                {currentMonth.days.map((day, index) => {
                    // Debug log for days with tasks
                    if (!day.empty && day.hasTask) {
                        console.log(`[MonthCalendar] Rendering day ${day.day} with ${day.tasksCount} tasks`);
                    }
                    
                    return (
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
                            onPress={() => day.fullDate && onDateSelect(day.fullDate)}
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
                            
                            {/* Display red dot for days with tasks */}
                            {!day.empty && day.hasTask && (
                                <View style={styles.taskDot}>
                                    {day.tasksCount > 1 ? (
                                        <Text style={styles.taskCount}>{day.tasksCount}</Text>
                                    ) : null}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
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
                            onPress={() => {
                                if (month && typeof month.month === 'number' && onMonthSelect) {
                                    onMonthSelect(month.month);
                                }
                            }}
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

const styles = StyleSheet.create({
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
    monthSelector: {
        marginTop: 16,
    },
    monthsScrollView: {
        paddingVertical: 8,
    },
    monthButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 16,
    },
    selectedMonthButton: {
        backgroundColor: '#e6f7f5',
    },
    monthButtonText: {
        fontSize: 14,
        color: '#333',
    },
    selectedMonthButtonText: {
        color: '#00BFA6',
        fontWeight: 'bold',
    },
});

export default MonthCalendar; 