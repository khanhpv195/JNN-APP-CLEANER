import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeLinearGradient from '../common/SafeLinearGradient';
import TaskCard from './TaskCard';

const DateGroup = memo(({ 
    date,
    tasks = [],
    isToday = false,
    isTomorrow = false,
    onTaskPress,
    onBookingInfoPress,
    isExpanded = true
}) => {
    const formatDateHeader = () => {
        const dateObj = new Date(date);
        
        if (isToday) return "Today";
        if (isTomorrow) return "Tomorrow";
        
        return dateObj.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric',
            year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    const formatDateSubtitle = () => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric'
        });
    };

    const getHeaderColors = () => {
        if (isToday) return ['#00BFA6', '#00ACC1'];
        if (isTomorrow) return ['#FF9800', '#F57C00'];
        return ['#4CAF50', '#66BB6A']; // Green theme for future dates
    };

    const getHeaderTextColor = () => {
        return isToday || isTomorrow ? '#FFFFFF' : '#FFFFFF';
    };

    return (
        <View style={styles.container}>
            {/* Date Header */}
            <View style={[styles.dateHeader, isToday && styles.todayHeader]}>
                <SafeLinearGradient
                    colors={getHeaderColors()}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.dateInfo}>
                            <View style={styles.dateTitleRow}>
                                {isToday && (
                                    <View style={styles.iconContainer}>
                                        <Ionicons 
                                            name="today" 
                                            size={22} 
                                            color={getHeaderTextColor()} 
                                        />
                                    </View>
                                )}
                                {isTomorrow && (
                                    <View style={styles.iconContainer}>
                                        <Ionicons 
                                            name="arrow-forward" 
                                            size={18} 
                                            color={getHeaderTextColor()} 
                                        />
                                    </View>
                                )}
                                {!isToday && !isTomorrow && (
                                    <View style={styles.iconContainer}>
                                        <Ionicons 
                                            name="calendar-outline" 
                                            size={20} 
                                            color={getHeaderTextColor()} 
                                        />
                                    </View>
                                )}
                                <Text style={[styles.dateTitle, { color: getHeaderTextColor(), fontSize: isToday ? 24 : 20 }]}>
                                    {formatDateHeader()}
                                </Text>
                            </View>
                            
                            {(isToday || isTomorrow) && (
                                <Text style={[styles.dateSubtitle, { color: getHeaderTextColor() }]}>
                                    {formatDateSubtitle()}
                                </Text>
                            )}
                        </View>

                        <View style={styles.taskCountBadge}>
                            <Text style={[styles.taskCountText, { color: getHeaderTextColor() }]}>
                                {tasks.length}
                            </Text>
                        </View>
                    </View>
                </SafeLinearGradient>
            </View>

            {/* Tasks List */}
            {isExpanded && (
                <View style={styles.tasksContainer}>
                    {tasks.length === 0 ? (
                        <View style={styles.noTasksContainer}>
                            <Ionicons name="checkmark-circle-outline" size={32} color="#E0E0E0" />
                            <Text style={styles.noTasksText}>
                                {isToday ? "No tasks for today" : "No tasks scheduled"}
                            </Text>
                        </View>
                    ) : (
                        tasks.map((task, index) => (
                            <TaskCard
                                key={task._id || index}
                                task={task}
                                onPress={onTaskPress}
                                onBookingInfoPress={onBookingInfoPress}
                                style={[
                                    styles.taskCard,
                                    index === 0 && styles.firstTask,
                                    index === tasks.length - 1 && styles.lastTask
                                ]}
                            />
                        ))
                    )}
                </View>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    dateHeader: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 16,
    },
    todayHeader: {
        shadowColor: '#00BFA6',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        transform: [{ scale: 1.02 }],
        borderWidth: 2,
        borderColor: 'rgba(0, 191, 166, 0.3)',
    },
    headerGradient: {
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInfo: {
        flex: 1,
    },
    dateTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        padding: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    dateSubtitle: {
        fontSize: 14,
        opacity: 0.9,
        marginTop: 2,
    },
    taskCountBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        minWidth: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    taskCountText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    tasksContainer: {
        paddingHorizontal: 4,
    },
    taskCard: {
        marginBottom: 12,
    },
    firstTask: {
        marginTop: 0,
    },
    lastTask: {
        marginBottom: 0,
    },
    noTasksContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderStyle: 'dashed',
    },
    noTasksText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        fontStyle: 'italic',
    },
});

export default DateGroup;