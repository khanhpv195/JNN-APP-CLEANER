import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/components';
import { useGetInventories } from '@/hooks/useInventory';
import { useTranslation } from 'react-i18next';

const getStatusColor = (status) => {
    switch (status) {
        case 'PENDING':
            return { bg: '#FEF3C7', text: '#D97706' }; // Amber
        case 'IN_PROGRESS':
            return { bg: '#DBEAFE', text: '#2563EB' }; // Blue
        case 'COMPLETED':
            return { bg: '#D1FAE5', text: '#059669' }; // Green
        case 'CANCELLED':
            return { bg: '#FEE2E2', text: '#DC2626' }; // Red
        case 'NEW':
            return { bg: '#E0F2FE', text: '#0891B2' }; // Light Blue
        default:
            return { bg: '#F3F4F6', text: '#6B7280' }; // Gray
    }
};

// Format price to display in USD
const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' $';
};

const InventoryListScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { isLoading, setFetching, inventories } = useGetInventories();

    const refreshData = () => {
        setFetching(prev => !prev);
    };

    useFocusEffect(
        React.useCallback(() => {
            refreshData();
        }, [])
    );

    const renderHeader = () => (
        <View style={dynamicStyles.header}>
            <View style={dynamicStyles.headerLeft}>
                <TouchableOpacity
                    style={dynamicStyles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <ThemedText style={dynamicStyles.headerTitle}>Inventory Items</ThemedText>
            </View>
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
    );

    const renderInventoryItem = ({ item }) => {
        const statusColors = getStatusColor(item.status);

        return (
            <View
                style={dynamicStyles.card}
            >
                <View style={dynamicStyles.cardHeader}>
                    {item.propertyId && (
                        <ThemedText style={dynamicStyles.propertyName}>
                            {item.propertyId.name}
                        </ThemedText>
                    )}
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

                <View style={dynamicStyles.cardBody}>
                    {item.image ? (
                        <Image
                            source={{ uri: item.image }}
                            style={dynamicStyles.cardImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[dynamicStyles.cardImage, dynamicStyles.placeholderImage]}>
                            <Ionicons name="cube-outline" size={32} color={theme.textSecondary || '#666'} />
                        </View>
                    )}

                    <View style={dynamicStyles.cardContent}>
                        <ThemedText style={dynamicStyles.cardTitle} numberOfLines={1}>
                            {item.name}
                        </ThemedText>
                        <ThemedText style={dynamicStyles.cardDescription} numberOfLines={2}>
                            {item.description}
                        </ThemedText>

                        <View style={dynamicStyles.cardFooter}>
                            <View style={dynamicStyles.priceContainer}>
                                <ThemedText style={dynamicStyles.priceText}>
                                    {formatPrice(item.price)}
                                </ThemedText>
                            </View>

                            {item.quantity && (
                                <View style={dynamicStyles.quantityContainer}>
                                    <MaterialCommunityIcons
                                        name="package-variant"
                                        size={16}
                                        color={theme.textSecondary || '#666'}
                                    />
                                    <ThemedText style={dynamicStyles.quantityText}>
                                        {item.quantity}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderEmptyList = () => (
        <View style={dynamicStyles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={theme.textSecondary || '#666'} />
            <ThemedText style={dynamicStyles.emptyText}>
                No inventory items found
            </ThemedText>
        </View>
    );

    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            backgroundColor: theme.primary,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        backButton: {
            marginRight: 16,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#FFFFFF',
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
        },
        listContainer: {
            padding: 16,
        },
        card: {
            backgroundColor: theme.card,
            borderRadius: 12,
            marginBottom: 16,
            overflow: 'hidden',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.border || '#E5E7EB',
        },
        cardBody: {
            flexDirection: 'row',
            padding: 12,
        },
        cardImage: {
            width: 100,
            height: 100,
            borderRadius: 8,
            marginRight: 12,
        },
        placeholderImage: {
            backgroundColor: theme.border || '#eee',
            justifyContent: 'center',
            alignItems: 'center',
        },
        cardContent: {
            flex: 1,
            justifyContent: 'space-between',
        },
        cardTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: 4,
        },
        cardDescription: {
            fontSize: 14,
            color: theme.textSecondary || '#666',
            marginBottom: 8,
            flex: 1,
        },
        cardFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
        },
        propertyName: {
            fontSize: 13,
            color: theme.primary,
            fontWeight: '500',
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
        priceContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        priceText: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.text,
            marginLeft: 4,
        },
        quantityContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.border || '#E5E7EB',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        quantityText: {
            fontSize: 13,
            color: theme.text,
            marginLeft: 4,
            fontWeight: '500',
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
            marginBottom: 16,
        },
        refreshButton: {
            backgroundColor: theme.primary,
            padding: 12,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
        },
        refreshButtonText: {
            color: '#FFFFFF',
            fontWeight: '600',
            marginLeft: 8,
        },
    });

    return (
        <SafeAreaView style={dynamicStyles.container}>
            {renderHeader()}

            {isLoading ? (
                <View style={dynamicStyles.emptyContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <ThemedText style={dynamicStyles.emptyText}>
                        Loading inventory items...
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={inventories}
                    renderItem={renderInventoryItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={dynamicStyles.listContainer}
                    ListEmptyComponent={renderEmptyList}
                    refreshing={isLoading}
                    onRefresh={refreshData}
                />
            )}
        </SafeAreaView>
    );
};

export default InventoryListScreen;