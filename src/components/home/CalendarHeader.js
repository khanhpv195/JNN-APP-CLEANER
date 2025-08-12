import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticFeedback } from '../../utils/haptics';

const CalendarHeader = memo(({ 
    selectedDate, 
    selectedMonth, 
    isExpanded, 
    onToggleExpanded,
    onPrevYear,
    onNextYear,
    onClearDateSelection,
    onMonthSelect,
    isLoading = false
}) => {
    const insets = useSafeAreaInsets();
    const today = new Date();
    const monthYear = today.toLocaleDateString('en-US', { 
        month: 'short',
        year: 'numeric'
    });

    const getPendingText = () => {
        if (selectedDate) {
            const selectedDateStr = new Date(selectedDate).toLocaleDateString('en-US', { 
                month: 'short',
                day: 'numeric'
            });
            return selectedDateStr;
        }
        return 'All Tasks';
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <View style={styles.mainHeader}>
                <View style={styles.leftSection}>
                    <Text style={styles.monthYearText}>{monthYear}</Text>
                    <TouchableOpacity 
                        style={[
                            styles.pendingContainer,
                            selectedDate && styles.selectedDateContainer
                        ]}
                        onPress={selectedDate ? onClearDateSelection : undefined}
                        activeOpacity={selectedDate ? 0.7 : 1}
                    >
                        <Text style={[
                            styles.pendingText,
                            selectedDate && styles.selectedDateText
                        ]}>
                            {getPendingText()}
                        </Text>
                        {selectedDate && (
                            <Ionicons name="close" size={14} color="#00BFA6" style={styles.clearIcon} />
                        )}
                    </TouchableOpacity>
                </View>
                
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
                <View style={styles.calendarControls}>
                    <View style={styles.yearNavigator}>
                        <TouchableOpacity 
                            onPress={() => {
                                hapticFeedback.light();
                                onPrevYear();
                            }} 
                            style={[
                                styles.yearButton,
                                selectedMonth.getFullYear() <= 2025 && styles.disabledButton
                            ]}
                            activeOpacity={0.6}
                            disabled={selectedMonth.getFullYear() <= 2025}
                        >
                            <Ionicons 
                                name="chevron-back" 
                                size={24} 
                                color={selectedMonth.getFullYear() <= 2025 ? "#CCC" : "#00BFA6"} 
                            />
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
                            style={[
                                styles.yearButton,
                                selectedMonth.getFullYear() >= 2026 && styles.disabledButton
                            ]}
                            activeOpacity={0.6}
                            disabled={selectedMonth.getFullYear() >= 2026}
                        >
                            <Ionicons 
                                name="chevron-forward" 
                                size={24} 
                                color={selectedMonth.getFullYear() >= 2026 ? "#CCC" : "#00BFA6"} 
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.monthSelector}>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.monthScrollContainer}
                        >
                            {Array.from({ length: 12 }, (_, index) => {
                                const monthName = new Date(2025, index, 1).toLocaleDateString('en-US', { month: 'short' });
                                const isSelected = selectedMonth.getMonth() === index;
                                
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.monthButton,
                                            isSelected && styles.selectedMonthButton
                                        ]}
                                        onPress={() => {
                                            hapticFeedback.light();
                                            onMonthSelect && onMonthSelect(index);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.monthButtonText,
                                            isSelected && styles.selectedMonthButtonText
                                        ]}>
                                            {monthName}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
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
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    monthYearText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginRight: 12,
    },
    pendingContainer: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFB74D',
    },
    pendingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF9800',
    },
    selectedDateContainer: {
        backgroundColor: 'rgba(0, 191, 166, 0.1)',
        borderColor: '#00BFA6',
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedDateText: {
        color: '#00BFA6',
    },
    clearIcon: {
        marginLeft: 6,
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
    calendarControls: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 191, 166, 0.1)',
    },
    yearNavigator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    yearButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 191, 166, 0.1)',
    },
    disabledButton: {
        backgroundColor: 'rgba(204, 204, 204, 0.3)',
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
    monthSelector: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 191, 166, 0.05)',
    },
    monthScrollContainer: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    monthButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 16,
        backgroundColor: '#F5F7FA',
        minWidth: 50,
        alignItems: 'center',
    },
    selectedMonthButton: {
        backgroundColor: '#00BFA6',
    },
    monthButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    selectedMonthButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default CalendarHeader;