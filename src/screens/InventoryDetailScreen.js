import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    FlatList
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/components';
import { useGetInventory, useUpdateInventory } from '@/hooks/useInventory';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const InventoryDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { id } = route.params || {};

    const { inventory, isLoading, setFetching } = useGetInventory(id);
    const { updateInventory, isUpdating } = useUpdateInventory();
    const [expandedItems, setExpandedItems] = useState({});

    const toggleItemExpanded = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const handleUpdateStatus = async (status) => {
        try {
            await updateInventory({
                inventoryId: inventory._id,
                status: status
            });

            Alert.alert(
                'Success',
                `Inventory status updated to ${status}`,
                [{ text: 'OK' }]
            );

            // Refresh inventory data
            setFetching(prev => !prev);
        } catch (error) {
            Alert.alert(
                'Error',
                `Failed to update inventory: ${error.message}`,
                [{ text: 'OK' }]
            );
        }
    };

    // Create dynamic styles that use the theme
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
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginLeft: 16,
        },
        backButton: {
            padding: 8,
        },
        contentContainer: {
            padding: 16,
        },
        section: {
            backgroundColor: theme.card,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            shadowColor: theme.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: 12,
        },
        sectionSubtitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.text,
            marginTop: 16,
            marginBottom: 8,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.border || '#eee',
            paddingBottom: 8,
        },
        label: {
            fontSize: 15,
            color: theme.textSecondary || '#666',
            flex: 1,
        },
        value: {
            fontSize: 15,
            color: theme.text,
            flex: 2,
            fontWeight: '500',
        },
        image: {
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginBottom: 16,
        },
        statusBadge: {
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 16,
            alignSelf: 'flex-start',
        },
        statusText: {
            fontSize: 14,
            fontWeight: '500',
        },
        buttonsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 16,
        },
        button: {
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            marginHorizontal: 8,
        },
        buttonText: {
            color: '#FFFFFF',
            fontWeight: '600',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        itemCard: {
            backgroundColor: theme.cardAlt || theme.card,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.border || '#E5E7EB',
        },
        itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        itemTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        itemMeta: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        chipContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 8,
        },
        chip: {
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 16,
            marginRight: 8,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
        },
        chipText: {
            fontSize: 12,
            fontWeight: '500',
        },
        chipIcon: {
            marginRight: 4,
        },
        emptyItem: {
            padding: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyItemText: {
            fontSize: 14,
            color: theme.textSecondary || '#666',
            textAlign: 'center',
            marginTop: 8,
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
        cardDescription: {
            fontSize: 14,
            color: theme.text,
            marginVertical: 8,
        },
    });

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

    // Format date to display in a readable format
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return format(date, 'MMMM dd, yyyy');
        } catch (error) {
            return 'Invalid date';
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={dynamicStyles.container}>
                <View style={dynamicStyles.header}>
                    <TouchableOpacity
                        style={dynamicStyles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={dynamicStyles.headerTitle}>Inventory Details</Text>
                </View>
                <View style={dynamicStyles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <ThemedText style={{ marginTop: 16 }}>Loading inventory details...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    if (!inventory || typeof inventory !== 'object') {
        return (
            <SafeAreaView style={dynamicStyles.container}>
                <View style={dynamicStyles.header}>
                    <TouchableOpacity
                        style={dynamicStyles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={dynamicStyles.headerTitle}>Inventory Details</Text>
                </View>
                <View style={dynamicStyles.loadingContainer}>
                    <Ionicons name="alert-circle" size={48} color={theme.error || '#DC2626'} />
                    <ThemedText style={{ marginTop: 16, textAlign: 'center' }}>
                        Invalid inventory data. Please try again.
                    </ThemedText>
                    <TouchableOpacity
                        style={[dynamicStyles.button, { backgroundColor: theme.primary, marginTop: 16 }]}
                        onPress={() => setFetching(prev => !prev)}
                    >
                        <Text style={dynamicStyles.buttonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Handle multiple items or single item
    const inventoryItems = Array.isArray(inventory?.items) && inventory.items.length > 0
        ? inventory.items
        : [inventory];

    const statusColors = getStatusColor(inventory?.status || 'NEW');
    const priorityColors = inventory?.priorityLevel
        ? getPriorityColor(inventory.priorityLevel)
        : { bg: '#F3F4F6', text: '#6B7280' };

    const renderItem = ({ item, index }) => {
        if (!item) return null;

        const itemStatusColors = getStatusColor(item?.status || inventory?.status || 'NEW');
        const itemPriorityColors = getPriorityColor(item?.priorityLevel || inventory?.priorityLevel || 'Normal');
        const isExpanded = expandedItems[item?._id || `item-${index}`];

        return (
            <View style={dynamicStyles.itemCard}>
                <TouchableOpacity
                    style={dynamicStyles.itemHeader}
                    onPress={() => toggleItemExpanded(item?._id || `item-${index}`)}
                >
                    <Text style={dynamicStyles.itemTitle}>
                        {item?.name || (index === 0 ? inventory?.name : `Item ${index + 1}`)}
                    </Text>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={theme.text}
                    />
                </TouchableOpacity>

                <View style={dynamicStyles.itemMeta}>
                    <View style={dynamicStyles.quantityContainer}>
                        <Ionicons name="cube-outline" size={16} color={theme.textSecondary || '#666'} />
                        <Text style={dynamicStyles.quantityText}>
                            Qty: {item?.quantity || inventory?.quantity || '0'}
                        </Text>
                    </View>

                    <View
                        style={[
                            dynamicStyles.statusBadge,
                            { backgroundColor: itemStatusColors.bg }
                        ]}
                    >
                        <Text style={[dynamicStyles.statusText, { color: itemStatusColors.text }]}>
                            {item?.status || inventory?.status || 'NEW'}
                        </Text>
                    </View>
                </View>

                {isExpanded && (
                    <>
                        <Text style={dynamicStyles.cardDescription} numberOfLines={0}>
                            {item?.description || inventory?.description || 'No description available'}
                        </Text>

                        <View style={dynamicStyles.chipContainer}>
                            <View
                                style={[
                                    dynamicStyles.chip,
                                    { backgroundColor: itemPriorityColors.bg }
                                ]}
                            >
                                <MaterialIcons
                                    name="priority-high"
                                    size={12}
                                    color={itemPriorityColors.text}
                                    style={dynamicStyles.chipIcon}
                                />
                                <Text style={[dynamicStyles.chipText, { color: itemPriorityColors.text }]}>
                                    {item?.priorityLevel || inventory?.priorityLevel || 'Normal'}
                                </Text>
                            </View>

                            {(item?.requestedDate || inventory?.requestedDate) && (
                                <View
                                    style={[
                                        dynamicStyles.chip,
                                        { backgroundColor: theme.cardAlt || '#F3F4F6' }
                                    ]}
                                >
                                    <Ionicons
                                        name="calendar-outline"
                                        size={12}
                                        color={theme.text}
                                        style={dynamicStyles.chipIcon}
                                    />
                                    <Text style={[dynamicStyles.chipText, { color: theme.text }]}>
                                        {formatDate(item?.requestedDate || inventory?.requestedDate)}
                                    </Text>
                                </View>
                            )}

                            {(item?.propertyId || inventory?.propertyId) && (
                                <View
                                    style={[
                                        dynamicStyles.chip,
                                        { backgroundColor: theme.cardAlt || '#F3F4F6' }
                                    ]}
                                >
                                    <Ionicons
                                        name="business-outline"
                                        size={12}
                                        color={theme.text}
                                        style={dynamicStyles.chipIcon}
                                    />
                                    <Text style={[dynamicStyles.chipText, { color: theme.text }]}>
                                        {typeof item?.propertyId === 'object' ? item.propertyId.name :
                                            typeof inventory?.propertyId === 'object' ? inventory.propertyId.name :
                                                'Property'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <View style={dynamicStyles.header}>
                <TouchableOpacity
                    style={dynamicStyles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={dynamicStyles.headerTitle}>Inventory Details</Text>
            </View>

            <ScrollView>
                <View style={dynamicStyles.contentContainer}>
                    {inventory?.image && (
                        <Image
                            source={{ uri: inventory.image }}
                            style={dynamicStyles.image}
                            resizeMode="cover"
                        />
                    )}

                    <View style={dynamicStyles.section}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <ThemedText style={dynamicStyles.sectionTitle}>Inventory Request</ThemedText>
                            <View
                                style={[
                                    dynamicStyles.statusBadge,
                                    { backgroundColor: statusColors.bg }
                                ]}
                            >
                                <Text style={[dynamicStyles.statusText, { color: statusColors.text }]}>
                                    {inventory?.status || 'NEW'}
                                </Text>
                            </View>
                        </View>

                        <View style={dynamicStyles.row}>
                            <ThemedText style={dynamicStyles.label}>Property:</ThemedText>
                            <ThemedText style={dynamicStyles.value}>
                                {typeof inventory?.propertyId === 'object'
                                    ? inventory.propertyId.name
                                    : inventory?.propertyId || 'N/A'}
                            </ThemedText>
                        </View>

                        {inventory?.requestedDate && (
                            <View style={dynamicStyles.row}>
                                <ThemedText style={dynamicStyles.label}>Requested Date:</ThemedText>
                                <ThemedText style={dynamicStyles.value}>
                                    {formatDate(inventory.requestedDate)}
                                </ThemedText>
                            </View>
                        )}

                        <View style={dynamicStyles.row}>
                            <ThemedText style={dynamicStyles.label}>Priority:</ThemedText>
                            <View
                                style={[
                                    dynamicStyles.statusBadge,
                                    { backgroundColor: priorityColors.bg }
                                ]}
                            >
                                <Text style={[dynamicStyles.statusText, { color: priorityColors.text }]}>
                                    {inventory?.priorityLevel || 'Normal'}
                                </Text>
                            </View>
                        </View>

                        <View style={[dynamicStyles.row, { borderBottomWidth: 0 }]}>
                            <ThemedText style={dynamicStyles.label}>Created:</ThemedText>
                            <ThemedText style={dynamicStyles.value}>
                                {formatDate(inventory?.createdAt)}
                            </ThemedText>
                        </View>
                    </View>

                    <View style={dynamicStyles.section}>
                        <ThemedText style={dynamicStyles.sectionTitle}>Items</ThemedText>

                        {inventoryItems?.length > 0 ? (
                            inventoryItems.map((item, index) => (
                                <React.Fragment key={item?._id || `item-${index}`}>
                                    {renderItem({ item, index })}
                                </React.Fragment>
                            ))
                        ) : (
                            <View style={dynamicStyles.emptyItem}>
                                <Ionicons name="cube-outline" size={32} color={theme.textSecondary} />
                                <Text style={dynamicStyles.emptyItemText}>No items available</Text>
                            </View>
                        )}
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default InventoryDetailScreen;