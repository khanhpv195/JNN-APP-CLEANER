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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeLinearGradient from '../common/SafeLinearGradient';
import DateGroup from './DateGroup';
import { hapticFeedback } from '../../utils/haptics';

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
                    style={[styles.skeletonDateGroup, { opacity }]}
                >
                    <View style={styles.skeletonHeader} />
                    <View style={styles.skeletonCard} />
                    <View style={styles.skeletonCard} />
                </Animated.View>
            ))}
        </View>
    );
});

const EmptyState = memo(({ onGoToToday }) => (
    <View style={styles.emptyContainer}>
        <SafeLinearGradient
            colors={['#F8F9FA', '#FFFFFF']}
            style={styles.emptyGradient}
        >
            <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={64} color="#E0E0E0" />
            </View>
            
            <Text style={styles.emptyTitle}>No tasks scheduled</Text>
            <Text style={styles.emptySubtitle}>
                You have no cleaning tasks in the upcoming days
            </Text>

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
                    style={styles.buttonGradient}
                >
                    <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.goToTodayText}>Refresh Tasks</Text>
                </SafeLinearGradient>
            </TouchableOpacity>
        </SafeLinearGradient>
    </View>
));

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

const TimelineTaskList = memo(({
    timelineData = [], // Array of { date, tasks, isToday, isTomorrow }
    loading = false,
    error = null,
    refreshing = false,
    onTaskPress,
    onBookingInfoPress,
    onRefresh,
    onGoToToday,
}) => {
    const scrollViewRef = useRef(null);

    // Removed timeline header to simplify UI

    if (loading && timelineData.length === 0) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={onRefresh} />;
    }

    if (timelineData.length === 0) {
        return <EmptyState onGoToToday={onGoToToday} />;
    }

    return (
        <View style={styles.container}>
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
                scrollEventThrottle={16}
            >
                {timelineData.map((dateGroup, index) => (
                    <DateGroup
                        key={dateGroup.date}
                        date={dateGroup.date}
                        tasks={dateGroup.tasks}
                        isToday={dateGroup.isToday}
                        isTomorrow={dateGroup.isTomorrow}
                        onTaskPress={onTaskPress}
                        onBookingInfoPress={onBookingInfoPress}
                        isExpanded={true}
                    />
                ))}

                <View style={styles.bottomPadding} />
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
        paddingHorizontal: 16,
        paddingBottom: 20,
    },


    // Loading Skeleton
    skeletonContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    skeletonDateGroup: {
        marginBottom: 24,
    },
    skeletonHeader: {
        height: 60,
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        marginBottom: 12,
    },
    skeletonCard: {
        height: 120,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        marginBottom: 12,
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

    bottomPadding: {
        height: 20,
    },
});

export default TimelineTaskList;