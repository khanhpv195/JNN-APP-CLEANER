import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/components';
import { useGetInventories } from '@/hooks/useInventory';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/shared/constants/colors';
import { format } from 'date-fns';

const InventoryListScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { t } = useTranslation();

    const { inventories, isLoading, setFetching } = useGetInventories();


    const refreshData = () => {
        setFetching(prev => !prev);
    };

    // Create dynamic styles that use the theme
    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            backgroundColor: Colors.primary,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#FFFFFF',
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        headerButton: {
            marginLeft: 16,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
        },
        emptyText: {
            fontSize: 16,
            color: theme.textSecondary || '#666',
            textAlign: 'center',
            marginTop: 16,
        },
        listContainer: {
            padding: 16,
        },
        card: {
            backgroundColor: theme.card,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            shadowColor: theme.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            flexDirection: 'row',
        },
        cardImage: {
            width: 80,
            height: 80,
            borderRadius: 8,
            marginRight: 16,
        },
        cardContent: {
            flex: 1,
        },
        cardTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: 8,
        },
        cardDescription: {
            fontSize: 14,
            color: theme.textSecondary || '#666',
            marginBottom: 8,
        },
        cardFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        cardInfoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        priceContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        priceText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.text,
            marginLeft: 4,
        },
        statusBadge: {
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 16,
        },
        statusText: {
            fontSize: 12,
            fontWeight: '500',
        },
        refreshButton: {
            backgroundColor: theme.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 16,
            flexDirection: 'row',
            justifyContent: 'center',
        },
        refreshButtonText: {
            color: '#FFFFFF',
            fontWeight: '600',
            marginLeft: 8,
        },
        quantityContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        quantityText: {
            fontSize: 14,
            color: theme.text,
            marginLeft: 4,
        },
        fabContainer: {
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: theme.primary,
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        propertyName: {
            fontSize: 12,
            color: theme.textSecondary || '#666',
            marginBottom: 4,
        },
        priorityContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        priorityBadge: {
            paddingVertical: 2,
            paddingHorizontal: 6,
            borderRadius: 12,
            marginLeft: 4,
        },
        priorityText: {
            fontSize: 11,
            fontWeight: '500',
        },
        dateText: {
            fontSize: 12,
            color: theme.textSecondary || '#666',
        },
    });

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent':
                return { bg: '#FEE2E2', text: '#DC2626' }; // Red
            case 'Normal':
                return { bg: '#DBEAFE', text: '#2563EB' }; // Blue
            case 'Periodic':
                return { bg: '#D1FAE5', text: '#059669' }; // Green
            default:
                return { bg: '#F3F4F6', text: '#6B7280' }; // Gray
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'NEW':
                return { bg: '#E0F2FE', text: '#0369A1' }; // Light Blue
            case 'PENDING':
                return { bg: '#FEF3C7', text: '#D97706' }; // Amber
            case 'IN_PROGRESS':
                return { bg: '#DBEAFE', text: '#2563EB' }; // Blue
            case 'COMPLETED':
                return { bg: '#D1FAE5', text: '#059669' }; // Green
            case 'CANCELLED':
                return { bg: '#FEE2E2', text: '#DC2626' }; // Red
            default:
                return { bg: '#F3F4F6', text: '#6B7280' }; // Gray
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return format(date, 'MMM dd, yyyy');
        } catch (error) {
            return dateStr;
        }
    };

    const renderInventoryItem = ({ item }) => {
        const priorityColors = getPriorityColor(item.priorityLevel);
        const statusColors = getStatusColor(item.status);

        return (
            <TouchableOpacity
                style={dynamicStyles.card}
                onPress={() => navigation.navigate('detail_inventory', { id: item._id })}
            >
                <View style={dynamicStyles.cardContent}>
                    <Text style={dynamicStyles.cardTitle}>{item.name}</Text>

                    <Text style={dynamicStyles.propertyName}>
                        {item.propertyId?.name || 'No property'}
                    </Text>

                    <Text style={dynamicStyles.cardDescription} numberOfLines={2}>
                        {item.description || 'No description'}
                    </Text>

                    <View style={dynamicStyles.cardInfoRow}>
                        <View style={dynamicStyles.quantityContainer}>
                            <Ionicons name="cube-outline" size={16} color={theme.textSecondary} />
                            <Text style={dynamicStyles.quantityText}>Qty: {item.quantity || '0'}</Text>
                        </View>

                        <View
                            style={[
                                dynamicStyles.statusBadge,
                                { backgroundColor: statusColors.bg }
                            ]}
                        >
                            <Text style={[dynamicStyles.statusText, { color: statusColors.text }]}>
                                {item.status}
                            </Text>
                        </View>
                    </View>

                    <View style={dynamicStyles.cardInfoRow}>
                        <Text style={dynamicStyles.dateText}>
                            Requested: {formatDate(item.requestedDate)}
                        </Text>

                        <View style={dynamicStyles.priorityContainer}>
                            <View
                                style={[
                                    dynamicStyles.priorityBadge,
                                    { backgroundColor: priorityColors.bg }
                                ]}
                            >
                                <Text style={[dynamicStyles.priorityText, { color: priorityColors.text }]}>
                                    {item.priorityLevel || 'Normal'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyList = () => (
        <View style={dynamicStyles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={theme.textSecondary || '#666'} />
            <ThemedText style={dynamicStyles.emptyText}>
                No inventory items found. Try refreshing or check back later.
            </ThemedText>
            <TouchableOpacity
                style={dynamicStyles.refreshButton}
                onPress={refreshData}
            >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={dynamicStyles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
        </View>
    );

    useFocusEffect(
        React.useCallback(() => {
            refreshData();
        }, [])
    );

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <View style={dynamicStyles.header}>
                <ThemedText style={dynamicStyles.headerTitle}>Inventory</ThemedText>
                <View style={dynamicStyles.headerActions}>
                    <TouchableOpacity onPress={refreshData}>
                        <Ionicons name="refresh" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={dynamicStyles.headerButton}
                        onPress={() => navigation.navigate('create_inventory')}
                    >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View style={dynamicStyles.emptyContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <ThemedText style={dynamicStyles.emptyText}>
                        Loading inventory items...
                    </ThemedText>
                </View>
            ) : (
                <>
                    <FlatList
                        data={inventories}
                        renderItem={renderInventoryItem}
                        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
                        contentContainerStyle={dynamicStyles.listContainer}
                        ListEmptyComponent={renderEmptyList}
                        refreshing={isLoading}
                        onRefresh={refreshData}
                    />
                    <TouchableOpacity
                        style={dynamicStyles.fabContainer}
                        onPress={() => navigation.navigate('create_inventory')}
                    >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </>
            )}
        </SafeAreaView>
    );
};

export default InventoryListScreen;