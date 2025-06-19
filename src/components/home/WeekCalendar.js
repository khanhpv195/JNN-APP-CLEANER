import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const WeekCalendar = ({ calendarDays, selectedDate, onDateSelect }) => {
    return (
        <View style={styles.weekCalendar}>
            {calendarDays.map((day, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.dayItem,
                        day.isToday && styles.dayItemToday,
                        day.fullDate.toDateString() === selectedDate.toDateString() && styles.dayItemSelected
                    ]}
                    onPress={() => onDateSelect(day.fullDate)}
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
};

const styles = StyleSheet.create({
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
    dayTextSelected: {
        color: '#ffffff',
    },
    weekdayText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    weekdayTextSelected: {
        color: '#ffffff',
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
});

export default WeekCalendar; 