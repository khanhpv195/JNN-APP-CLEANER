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
            <View style={styles.header}>
                <Text style={styles.monthYearText}>{monthYear}</Text>
                
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="add" size={24} color="#00BFA6" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="funnel" size={20} color="#00BFA6" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="refresh" size={20} color="#00BFA6" />
                    </TouchableOpacity>
                </View>
            </View>

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
        paddingBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    monthYearText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 191, 166, 0.1)',
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