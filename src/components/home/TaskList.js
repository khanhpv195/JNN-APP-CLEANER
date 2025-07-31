import React, { memo, useCallback, useRef } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator,
    RefreshControl,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeLinearGradient from '../common/SafeLinearGradient';
import TaskCard from './TaskCard';
import { hapticFeedback } from '../../utils/haptics';

const { width } = Dimensions.get('window');

const LoadingSkeleton = memo(() => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((index) => (
                <Animated.View 
                    key={index} 
                    style={[styles.skeletonCard, { opacity }]}
                >
                    <View style={styles.skeletonHeader} />
                    <View style={styles.skeletonText} />
                    <View style={styles.skeletonTextSmall} />
                    <View style={styles.skeletonFooter}>
                        <View style={styles.skeletonButton} />
                        <View style={styles.skeletonButton} />
                    </View>
                </Animated.View>
            ))}
        </View>
    );
});

const EmptyState = memo(({ 
    selectedDate, 
    allTasksCount, 
    onGoToToday,
    icon = "calendar-outline",
    title,
    subtitle 
}) => {
    const formatDate = useCallback(() => {
        return selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
        });
    }, [selectedDate]);

    return (
        <View style={styles.emptyContainer}>
            <SafeLinearGradient
                colors={['#F8F9FA', '#FFFFFF']}
                style={styles.emptyGradient}
            >
                <View style={styles.emptyIconContainer}>
                    <Ionicons name={icon} size={64} color="#E0E0E0" />
                </View>
                
                <Text style={styles.emptyTitle}>
                    {title || 'No tasks scheduled'}
                </Text>
                
                <Text style={styles.emptySubtitle}>
                    {subtitle || `No cleaning tasks for ${formatDate()}`}
                </Text>
                
                {allTasksCount > 0 && (
                    <Text style={styles.helperText}>
                        {allTasksCount} task groups available on other dates
                    </Text>
                )}

                <TouchableOpacity
                    style={styles.goToTodayButton}
                    onPress={() => {
                        hapticFeedback.medium();
                        onGoToToday();
                    }}
                    activeOpacity={0.7}
                >
                    <SafeLinearGradient
                        colors={['#00BFA6', '#00ACC1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                    >
                        <Ionicons name="today-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.goToTodayText}>Go to Today</Text>
                    </SafeLinearGradient>
                </TouchableOpacity>
            </SafeLinearGradient>
        </View>
    );
});

const ErrorState = memo(({ error, onRetry }) => (
    <View style={styles.errorContainer}>
        <SafeLinearGradient
            colors={['#FFEBEE', '#FFFFFF']}
            style={styles.errorGradient}
        >
            <View style={styles.errorIconContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
            </View>
            
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
            
            <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                    hapticFeedback.warning();
                    onRetry();
                }}
                activeOpacity={0.7}
            >
                <SafeLinearGradient
                    colors={['#F44336', '#D32F2F']}
                    style={styles.buttonGradient}
                >
                    <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.retryText}>Try Again</Text>
                </SafeLinearGradient>
            </TouchableOpacity>
        </SafeLinearGradient>
    </View>
));

const TaskList = memo(({
    tasks = [],
    selectedDate,
    allTasksCount = 0,
    loading = false,
    error = null,
    refreshing = false,
    nextDateWithTasks = null,
    onTaskPress,
    onBookingInfoPress,
    onRefresh,
    onGoToToday,
    onScrollEndReached,
    isAutoAdvancing = false
}) => {
    const scrollViewRef = useRef(null);
    
    const handleScroll = useCallback((event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
        
        if (isCloseToBottom && !isAutoAdvancing && tasks.length > 0) {
            onScrollEndReached?.();
        }
    }, [isAutoAdvancing, tasks.length, onScrollEndReached]);

    const renderDateHeader = useCallback(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const dateObj = new Date(selectedDate);
        const isToday = dateObj.toDateString() === today.toDateString();
        
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
        
        let dateLabel = '';
        if (isToday) dateLabel = 'Today';
        else if (isTomorrow) dateLabel = 'Tomorrow';
        
        return (
            <View style={styles.dateHeader}>
                <SafeLinearGradient
                    colors={['#00BFA6', '#00ACC1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.dateHeaderGradient}
                >
                    <Text style={styles.dateHeaderText}>
                        {dateLabel && `${dateLabel} • `}
                        {selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric' 
                        })}
                    </Text>
                    <View style={styles.taskCount}>
                        <Text style={styles.taskCountText}>{tasks.length}</Text>
                    </View>
                </SafeLinearGradient>
            </View>
        );
    }, [selectedDate, tasks.length]);

    const renderNextDateHint = useCallback(() => {
        if (!nextDateWithTasks || isAutoAdvancing) return null;

        return (
            <View style={styles.nextDateHint}>
                <View style={styles.hintContent}>
                    <Ionicons name="arrow-down" size={16} color="#00BFA6" />
                    <Text style={styles.nextDateHintText}>
                        Scroll down to see tasks for{' '}
                        {nextDateWithTasks.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                        })}
                    </Text>
                </View>
            </View>
        );
    }, [nextDateWithTasks, isAutoAdvancing]);

    if (loading && tasks.length === 0) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={onRefresh} />;
    }

    if (tasks.length === 0) {
        return (
            <EmptyState
                selectedDate={selectedDate}
                allTasksCount={allTasksCount}
                onGoToToday={onGoToToday}
            />
        );
    }

    return (
        <View style={styles.container}>
            {isAutoAdvancing && (
                <View style={styles.autoAdvanceIndicator}>
                    <ActivityIndicator size="small" color="#00BFA6" />
                    <Text style={styles.autoAdvanceText}>Moving to next date...</Text>
                </View>
            )}

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#00BFA6']}
                        tintColor="#00BFA6"
                        title="Pull to refresh"
                        titleColor="#666"
                    />
                }
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
            >
                {renderDateHeader()}
                
                {tasks.map((task, index) => (
                    <TaskCard
                        key={task._id || index}
                        task={task}
                        onPress={onTaskPress}
                        onBookingInfoPress={onBookingInfoPress}
                        style={[
                            index === 0 && styles.firstCard,
                            index === tasks.length - 1 && styles.lastCard
                        ]}
                    />
                ))}

                {renderNextDateHint()}
            </ScrollView>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    
    // Loading Skeleton
    skeletonContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    skeletonCard: {
        backgroundColor: '#F0F0F0',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    skeletonHeader: {
        height: 20,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginBottom: 12,
        width: '70%',
    },
    skeletonText: {
        height: 16,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginBottom: 8,
        width: '90%',
    },
    skeletonTextSmall: {
        height: 14,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginBottom: 16,
        width: '60%',
    },
    skeletonFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    skeletonButton: {
        height: 32,
        backgroundColor: '#E0E0E0',
        borderRadius: 16,
        width: '45%',
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        margin: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    emptyGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(224, 224, 224, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 16,
    },
    helperText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 24,
    },

    // Error State
    errorContainer: {
        flex: 1,
        margin: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    errorGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },

    // Buttons
    goToTodayButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#00BFA6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    retryButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#F44336',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    goToTodayText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },

    // Date Header
    dateHeader: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#00BFA6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    dateHeaderGradient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    dateHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
    },
    taskCount: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 24,
        alignItems: 'center',
    },
    taskCountText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Auto Advance
    autoAdvanceIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E8',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    autoAdvanceText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },

    // Next Date Hint
    nextDateHint: {
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        borderStyle: 'dashed',
    },
    hintContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextDateHintText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
        marginLeft: 8,
    },

    // Card spacing
    firstCard: {
        marginTop: 0,
    },
    lastCard: {
        marginBottom: 8,
    },
});

export default TaskList; 