import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    FlatList,
    Alert
} from 'react-native';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/components';
import { useCreateInventory } from '@/hooks/useInventory';
import { useGetProperty } from '@/hooks/useProperty';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

const initialItemState = {
    productName: '',
    description: '',
    quantity: '1',
    priorityLevel: 'Normal',
    status: 'AVAILABLE'
};

const InventoryCreateScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { createInventory, isCreating } = useCreateInventory();
    const { properties, isLoading: isLoadingProperties } = useGetProperty();

    const [propertyId, setPropertyId] = useState('');
    const [propertyName, setPropertyName] = useState('');
    const [items, setItems] = useState([{ ...initialItemState, id: Date.now().toString() }]);
    const [errors, setErrors] = useState({});
    const [isPropertyModalVisible, setIsPropertyModalVisible] = useState(false);
    const [isPriorityModalVisible, setIsPriorityModalVisible] = useState(false);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [requestedDate, setRequestedDate] = useState(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const priorityOptions = [
        { label: 'Urgent', value: 'Urgent' },
        { label: 'Normal', value: 'Normal' },
        { label: 'Periodic', value: 'Periodic' }
    ];

    // Reset form data when screen gains focus
    useFocusEffect(
        React.useCallback(() => {
            // Reset khi mount
            setPropertyId('');
            setPropertyName('');
            setItems([{ ...initialItemState, id: Date.now().toString() }]);
            setErrors({});
            setIsPropertyModalVisible(false);
            setIsPriorityModalVisible(false);
            setRequestedDate(new Date());

            return () => {
                // Reset khi unmount
                setPropertyId('');
                setPropertyName('');
                setItems([{ ...initialItemState, id: Date.now().toString() }]);
                setErrors({});
                setIsPropertyModalVisible(false);
                setIsPriorityModalVisible(false);
                setRequestedDate(new Date());
            };
        }, [])
    );

    const addItem = () => {
        setItems([...items, { ...initialItemState, id: Date.now().toString() }]);
    };

    const removeItem = (id) => {
        if (items.length <= 1) {
            Alert.alert("Cannot delete", "At least one item is required");
            return;
        }
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id, field, value) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const validate = () => {
        const newErrors = {};

        if (!propertyId) {
            newErrors.propertyId = 'Property is required';
        }

        let hasItemErrors = false;
        items.forEach((item, index) => {
            if (!item.productName.trim()) {
                newErrors[`item_${index}_productName`] = 'Product name is required';
                hasItemErrors = true;
            }

            if (!item.description.trim()) {
                newErrors[`item_${index}_description`] = 'Description is required';
                hasItemErrors = true;
            }

            if (!item.quantity) {
                newErrors[`item_${index}_quantity`] = 'Quantity is required';
                hasItemErrors = true;
            } else if (isNaN(parseInt(item.quantity))) {
                newErrors[`item_${index}_quantity`] = 'Quantity must be a valid number';
                hasItemErrors = true;
            } else if (parseInt(item.quantity) <= 0) {
                newErrors[`item_${index}_quantity`] = 'Quantity must be greater than zero';
                hasItemErrors = true;
            }
        });

        if (hasItemErrors) {
            newErrors.items = 'Please fix the errors in your items';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setRequestedDate(selectedDate);
        }
    };

    const handleShowDatePicker = () => {
        setShowDatePicker(true);
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        // Set local submitting state to true to show loading indicators
        setIsSubmitting(true);

        try {
            // Prepare inventory items data
            const inventoryItems = items.map(item => ({
                name: item.productName || '',
                description: item.description || '',
                quantity: parseInt(item.quantity || '1'),
                status: item.status || 'AVAILABLE',
                propertyId: propertyId || '',
                priorityLevel: item.priorityLevel || 'Normal',
                requestedDate: formatDate(requestedDate)
            }));

            // Send all items in one API request
            console.log('Sending inventory items:', JSON.stringify({ inventoryItems }));

            try {
                // Create a single payload with all items
                const payload = {
                    inventoryItems: inventoryItems
                };

                // Make a single API call with all items
                const response = await createInventory(payload);
                console.log('API response:', JSON.stringify(response));

                // Set submitting state to false once we have response
                setIsSubmitting(false);

                // Check if response exists
                if (!response) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'No response received from the server'
                    });
                    return;
                }

                // Check for success
                if (response.success) {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'All inventory items created successfully'
                    });

                    // Reset form and navigate
                    setPropertyId('');
                    setPropertyName('');
                    setItems([{ ...initialItemState, id: Date.now().toString() }]);
                    setErrors({});
                    setRequestedDate(new Date());
                    navigation.goBack();
                } else {
                    // Display error message
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: response.message || 'Failed to create inventory items'
                    });
                }
            } catch (apiError) {
                setIsSubmitting(false);
                console.error('API error:', apiError);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: apiError.message || 'Failed to process the request'
                });
            }
        } catch (error) {
            setIsSubmitting(false);
            console.error('Inventory creation error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'An unexpected error occurred'
            });
        }
    };

    const handleSelectProperty = (property) => {
        setPropertyId(property._id);
        setPropertyName(property.name);
        setIsPropertyModalVisible(false);
    };

    const handleSelectPriority = (priority) => {
        updateItem(items[currentItemIndex].id, 'priorityLevel', priority.value);
        setIsPriorityModalVisible(false);
    };

    const renderPropertyItem = ({ item }) => (
        <TouchableOpacity
            style={dynamicStyles.propertyItem}
            onPress={() => handleSelectProperty(item)}
        >
            <ThemedText style={dynamicStyles.propertyName}>{item.name}</ThemedText>
            <ThemedText style={dynamicStyles.propertyAddress} numberOfLines={1}>
                {item.address}
            </ThemedText>
        </TouchableOpacity>
    );

    const renderPriorityItem = ({ item }) => (
        <TouchableOpacity
            style={dynamicStyles.propertyItem}
            onPress={() => handleSelectPriority(item)}
        >
            <ThemedText style={dynamicStyles.propertyName}>{item.label}</ThemedText>
        </TouchableOpacity>
    );

    const PropertyModal = () => (
        <Modal
            visible={isPropertyModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsPropertyModalVisible(false)}
        >
            <View style={dynamicStyles.modalContainer}>
                <View style={dynamicStyles.modalContent}>
                    <View style={dynamicStyles.modalHeader}>
                        <ThemedText style={dynamicStyles.modalTitle}>Select Property</ThemedText>
                        <TouchableOpacity onPress={() => setIsPropertyModalVisible(false)}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {isLoadingProperties ? (
                        <ActivityIndicator size="large" color={theme.primary} style={dynamicStyles.modalLoading} />
                    ) : (
                        <FlatList
                            data={properties}
                            renderItem={renderPropertyItem}
                            keyExtractor={item => item._id}
                            ListEmptyComponent={
                                <View style={dynamicStyles.emptyListContainer}>
                                    <ThemedText style={dynamicStyles.emptyListText}>No properties available</ThemedText>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    );

    const PriorityModal = () => (
        <Modal
            visible={isPriorityModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsPriorityModalVisible(false)}
        >
            <View style={dynamicStyles.modalContainer}>
                <View style={dynamicStyles.modalContent}>
                    <View style={dynamicStyles.modalHeader}>
                        <ThemedText style={dynamicStyles.modalTitle}>Select Priority Level</ThemedText>
                        <TouchableOpacity onPress={() => setIsPriorityModalVisible(false)}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={priorityOptions}
                        renderItem={renderPriorityItem}
                        keyExtractor={item => item.value}
                    />
                </View>
            </View>
        </Modal>
    );

    const getItemErrorText = (index, field) => {
        const errorKey = `item_${index}_${field}`;
        return errors[errorKey] ? <Text style={dynamicStyles.errorText}>{errors[errorKey]}</Text> : null;
    };

    const getPriorityLabelByValue = (value) => {
        const priority = priorityOptions.find(option => option.value === value);
        return priority ? priority.label : 'Normal';
    };

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
        backButton: {
            marginRight: 16,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#FFFFFF',
        },
        content: {
            padding: 16,
        },
        formGroup: {
            marginBottom: 16,
        },
        label: {
            fontSize: 16,
            fontWeight: '500',
            marginBottom: 8,
            color: theme.text,
        },
        input: {
            backgroundColor: theme.card,
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.border || '#E5E7EB',
            color: theme.text,
        },
        inputError: {
            borderColor: '#DC2626',
        },
        errorText: {
            color: '#DC2626',
            fontSize: 12,
            marginTop: 4,
        },
        submitButton: {
            backgroundColor: theme.primary,
            borderRadius: 8,
            padding: 16,
            alignItems: 'center',
            marginTop: 16,
            marginBottom: 16,
        },
        submitButtonText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 16,
        },
        propertySelector: {
            backgroundColor: theme.card,
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.border || '#E5E7EB',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        dateSelector: {
            backgroundColor: theme.card,
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.border || '#E5E7EB',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContent: {
            backgroundColor: theme.background,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: 20,
            maxHeight: '80%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.border || '#E5E7EB',
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.text,
        },
        modalLoading: {
            padding: 20,
        },
        propertyItem: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.border || '#E5E7EB',
        },
        propertyName: {
            fontSize: 16,
            fontWeight: '500',
            marginBottom: 4,
        },
        propertyAddress: {
            fontSize: 14,
            color: theme.textSecondary || '#666',
        },
        emptyListContainer: {
            padding: 16,
            alignItems: 'center',
        },
        emptyListText: {
            fontSize: 16,
            color: theme.textSecondary || '#666',
        },
        selectedPropertyText: {
            flex: 1,
            color: theme.text,
        },
        placeholderText: {
            color: theme.textSecondary || '#666',
        },
        itemContainer: {
            backgroundColor: theme.card,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.border || '#E5E7EB',
        },
        itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        itemTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        removeButton: {
            padding: 6,
        },
        addItemButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.border || '#E5E7EB',
            justifyContent: 'center',
        },
        addItemButtonText: {
            marginLeft: 8,
            color: theme.primary,
            fontWeight: '500',
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.text,
            marginTop: 8,
            marginBottom: 16,
        }
    });

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <View style={dynamicStyles.header}>
                <TouchableOpacity
                    style={dynamicStyles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <ThemedText style={dynamicStyles.headerTitle}>Inventory Request</ThemedText>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={dynamicStyles.content}>
                    <ThemedText style={dynamicStyles.sectionTitle}>General Information</ThemedText>

                    <View style={dynamicStyles.formGroup}>
                        <ThemedText style={dynamicStyles.label}>Property</ThemedText>
                        <TouchableOpacity
                            style={[
                                dynamicStyles.propertySelector,
                                errors.propertyId && dynamicStyles.inputError
                            ]}
                            onPress={() => setIsPropertyModalVisible(true)}
                        >
                            <Text
                                style={propertyName ? dynamicStyles.selectedPropertyText : dynamicStyles.placeholderText}
                                numberOfLines={1}
                            >
                                {propertyName || 'Select property'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={theme.textSecondary || '#666'} />
                        </TouchableOpacity>
                        {errors.propertyId && <Text style={dynamicStyles.errorText}>{errors.propertyId}</Text>}
                    </View>

                    <View style={dynamicStyles.formGroup}>
                        <ThemedText style={dynamicStyles.label}>Requested Date</ThemedText>
                        <TouchableOpacity
                            style={dynamicStyles.dateSelector}
                            onPress={handleShowDatePicker}
                        >
                            <Text style={dynamicStyles.selectedPropertyText}>
                                {formatDate(requestedDate)}
                            </Text>
                            <MaterialIcons name="date-range" size={24} color={theme.textSecondary || '#666'} />
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={requestedDate}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                    </View>

                    <ThemedText style={dynamicStyles.sectionTitle}>Item List</ThemedText>

                    {errors.items && <Text style={dynamicStyles.errorText}>{errors.items}</Text>}

                    {items.map((item, index) => (
                        <View key={item.id} style={dynamicStyles.itemContainer}>
                            <View style={dynamicStyles.itemHeader}>
                                <Text style={dynamicStyles.itemTitle}>Item #{index + 1}</Text>
                                <TouchableOpacity
                                    style={dynamicStyles.removeButton}
                                    onPress={() => removeItem(item.id)}
                                >
                                    <AntDesign name="closecircle" size={22} color="#DC2626" />
                                </TouchableOpacity>
                            </View>

                            <View style={dynamicStyles.formGroup}>
                                <ThemedText style={dynamicStyles.label}>Product Name</ThemedText>
                                <TextInput
                                    style={[
                                        dynamicStyles.input,
                                        getItemErrorText(index, 'productName') && dynamicStyles.inputError
                                    ]}
                                    placeholder="Enter product name"
                                    placeholderTextColor={theme.textSecondary || '#666'}
                                    value={item.productName}
                                    onChangeText={(text) => updateItem(item.id, 'productName', text)}
                                />
                                {getItemErrorText(index, 'productName')}
                            </View>

                            <View style={dynamicStyles.formGroup}>
                                <ThemedText style={dynamicStyles.label}>Description</ThemedText>
                                <TextInput
                                    style={[
                                        dynamicStyles.input,
                                        getItemErrorText(index, 'description') && dynamicStyles.inputError,
                                        { height: 80, textAlignVertical: 'top' }
                                    ]}
                                    placeholder="Enter description"
                                    placeholderTextColor={theme.textSecondary || '#666'}
                                    value={item.description}
                                    onChangeText={(text) => updateItem(item.id, 'description', text)}
                                    multiline
                                    numberOfLines={3}
                                />
                                {getItemErrorText(index, 'description')}
                            </View>

                            <View style={dynamicStyles.formGroup}>
                                <ThemedText style={dynamicStyles.label}>Quantity</ThemedText>
                                <TextInput
                                    style={[
                                        dynamicStyles.input,
                                        getItemErrorText(index, 'quantity') && dynamicStyles.inputError
                                    ]}
                                    placeholder="Enter quantity"
                                    placeholderTextColor={theme.textSecondary || '#666'}
                                    value={item.quantity.toString()}
                                    onChangeText={(text) => updateItem(item.id, 'quantity', text)}
                                    keyboardType="number-pad"
                                />
                                {getItemErrorText(index, 'quantity')}
                            </View>

                            <View style={dynamicStyles.formGroup}>
                                <ThemedText style={dynamicStyles.label}>Priority Level</ThemedText>
                                <TouchableOpacity
                                    style={dynamicStyles.propertySelector}
                                    onPress={() => {
                                        setCurrentItemIndex(index);
                                        setIsPriorityModalVisible(true);
                                    }}
                                >
                                    <Text style={dynamicStyles.selectedPropertyText}>
                                        {getPriorityLabelByValue(item.priorityLevel)}
                                    </Text>
                                    <MaterialIcons name="arrow-drop-down" size={24} color={theme.textSecondary || '#666'} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity
                        style={dynamicStyles.addItemButton}
                        onPress={addItem}
                    >
                        <AntDesign name="plus" size={16} color={theme.primary} />
                        <Text style={dynamicStyles.addItemButtonText}>Add Item</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={dynamicStyles.submitButton}
                        onPress={handleSubmit}
                        disabled={isCreating || isSubmitting}
                    >
                        {isCreating || isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={dynamicStyles.submitButtonText}>Create Request</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            <PropertyModal />
            <PriorityModal />
        </SafeAreaView>
    );
};

export default InventoryCreateScreen; 