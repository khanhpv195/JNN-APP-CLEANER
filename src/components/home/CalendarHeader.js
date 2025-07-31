import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeLinearGradient from '../common/SafeLinearGradient';
import { hapticFeedback } from '../../utils/haptics';

const CalendarHeader = memo(({ 
    selectedDate, 
    selectedMonth, 
    isExpanded, 
    onToggleExpanded,
    onPrevYear,
    onNextYear,
    isLoading = false
}) => {
    // Always show today's date in header for timeline view
    const today = new Date();
    const displayDate = today; // Use today instead of selectedDate
    
    const formatSelectedDate = () => {
        return "Today"; // Always show "Today" in timeline view
    };

    return (
        <View style={styles.container}>
            <SafeLinearGradient
                colors={['#00BFA6', '#00ACC1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.dateSection}>
                        <Text style={styles.selectedDateLabel}>Timeline View</Text>
                        <Text style={styles.selectedDate}>{formatSelectedDate()}</Text>
                        <Text style={styles.fullDate}>
                            {displayDate.toLocaleDateString('en-US', { 
                                weekday: 'long',
                                month: 'long', 
                                day: 'numeric',
                                year: 'numeric' 
                            })}
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={styles.toggleButton}
                        onPress={() => {
                            hapticFeedback.light();
                            onToggleExpanded();
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.toggleText}>
                            {isExpanded ? "Hide Calendar" : "Show Calendar"}
                        </Text>
                        <Animated.View style={styles.chevronContainer}>
                            <Ionicons
                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="#FFFFFF"
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </SafeLinearGradient>

            {isExpanded && (
                <View style={styles.yearNavigator}>
                    <TouchableOpacity 
                        onPress={() => {
                            hapticFeedback.light();
                            onPrevYear();
                        }} 
                        style={styles.yearButton}
                        activeOpacity={0.6}
                    >
                        <Ionicons name="chevron-back" size={24} color="#00BFA6" />
                    </TouchableOpacity>
                    
                    <View style={styles.yearContainer}>
                        <Text style={styles.yearText}>
                            {selectedMonth.getFullYear()}
                        </Text>
                        {isLoading && (
                            <View style={styles.loadingIndicator}>
                                <Ionicons name="refresh" size={16} color="#666" />
                            </View>
                        )}
                    </View>
                    
                    <TouchableOpacity 
                        onPress={() => {
                            hapticFeedback.light();
                            onNextYear();
                        }} 
                        style={styles.yearButton}
                        activeOpacity={0.6}
                    >
                        <Ionicons name="chevron-forward" size={24} color="#00BFA6" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    gradient: {
        paddingVertical: 20,
        paddingHorizontal: 24,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateSection: {
        flex: 1,
    },
    selectedDateLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    selectedDate: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 4,
        marginBottom: 2,
    },
    fullDate: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '400',
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    toggleText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
    },
    chevronContainer: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    yearNavigator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 191, 166, 0.1)',
    },
    yearButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 191, 166, 0.1)',
    },
    yearContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    yearText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    loadingIndicator: {
        marginLeft: 8,
    },
});

export default CalendarHeader;