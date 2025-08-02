import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    const today = new Date();
    const monthYear = today.toLocaleDateString('en-US', { 
        month: 'short',
        year: 'numeric'
    });

    return (
        <View style={styles.container}>
            <View style={styles.mainHeader}>
                <Text style={styles.monthYearText}>{monthYear}</Text>
                
                <View style={styles.rightActions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="add" size={20} color="#00BFA6" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="funnel" size={18} color="#00BFA6" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="refresh" size={18} color="#00BFA6" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.calendarToggle}
                onPress={() => {
                    hapticFeedback.light();
                    onToggleExpanded();
                }}
                activeOpacity={0.7}
            >
                <Text style={styles.calendarToggleText}>
                    {isExpanded ? "Hide Calendar" : "Show Calendar"}
                </Text>
                <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#666"
                />
            </TouchableOpacity>

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
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    mainHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 8,
    },
    monthYearText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 191, 166, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F7FA',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 8,
    },
    calendarToggleText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
        marginRight: 6,
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