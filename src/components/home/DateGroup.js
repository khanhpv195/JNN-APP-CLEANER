import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TaskCard from './TaskCard';
import TaskCardCompact from './TaskCardCompact';
import { generateDateHeaderText } from '../../utils/calendarUtils';

const DateGroup = memo(({ 
    date,
    tasks = [],
    isToday = false,
    isTomorrow = false,
    onTaskPress,
    onBookingInfoPress,
    isExpanded = true,
    useCompactCard = true,  // New prop to switch card types
    showDateHeader = true   // New prop to control header display
}) => {

    if (!isExpanded || tasks.length === 0) {
        return null;
    }

    // Generate smart date header text
    const dateHeaderText = generateDateHeaderText(new Date(date), true);
    const TaskComponent = useCompactCard ? TaskCardCompact : TaskCard;

    return (
        <View style={styles.dateGroupContainer}>
            {/* Smart Date Header (like "Today - Sat, Aug 2 2025") */}
            {showDateHeader && (
                <View style={styles.dateHeaderContainer}>
                    <Text style={[
                        styles.dateHeaderText,
                        isToday && styles.todayHeaderText
                    ]}>
                        {dateHeaderText}
                    </Text>
                    
                    {/* Task count indicator */}
                    <View style={[
                        styles.taskCountBadge,
                        isToday && styles.todayTaskCountBadge
                    ]}>
                        <Text style={[
                            styles.taskCountText,
                            isToday && styles.todayTaskCountText
                        ]}>
                            {tasks.length}
                        </Text>
                    </View>
                </View>
            )}

            {/* Task Cards */}
            <View style={styles.tasksContainer}>
                {tasks.map((task, index) => (
                    <TaskComponent
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
                ))}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    dateGroupContainer: {
        marginBottom: 24,
    },
    
    // Smart Date Header (like reference UI)
    dateHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        marginBottom: 12,
    },
    dateHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        flex: 1,
    },
    todayHeaderText: {
        color: '#00BFA6',
        fontWeight: '700',
    },
    
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
        backgroundColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    todayTaskCountBadge: {
        backgroundColor: '#00BFA6',
    },
    taskCountText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666',
    },
    todayTaskCountText: {
        color: '#FFFFFF',
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