import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    FlatList
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/components';
import { useCreateInventory } from '@/hooks/useInventory';
import { useGetProperty } from '@/hooks/useProperty';
import { useUploadImages } from './../hooks/useUploadImages';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import {
    handleImagePicker,
    handleImageUpload
} from '@/utils/imageUtils';

const initialFormState = {
    name: '',
    description: '',
    price: '',
    quantity: '1',
    status: 'AVAILABLE',
    propertyId: '',
    propertyName: '',
    image: null,
    imageAsset: null
};

const InventoryCreateScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { createInventory, isCreating } = useCreateInventory();
    const { properties, isLoading: isLoadingProperties } = useGetProperty();
    const { mutateAsync: uploadImages, isLoading: isUploading } = useUploadImages();

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [imageLoading, setImageLoading] = useState(false);
    const [isPropertyModalVisible, setIsPropertyModalVisible] = useState(false);

    // Reset form data when screen gains focus
    useFocusEffect(
        React.useCallback(() => {
            // Reset khi mount
            setFormData({ ...initialFormState });
            setErrors({});
            setImageLoading(false);
            setIsPropertyModalVisible(false);

            return () => {
                // Reset khi unmount
                setFormData({ ...initialFormState });
                setErrors({});
                setImageLoading(false);
                setIsPropertyModalVisible(false);
            };
        }, [])
    );

    // Format price to display in USD
    const formatPrice = (value) => {
        if (!value) return '';

        // Simply add dollar sign, don't format or parse the number
        return `$${value}`;
    };

    // Handle price input change - simple approach without formatters
    const handlePriceInput = (value) => {
        // Remove $ symbol if present
        if (value.startsWith('$')) {
            value = value.substring(1);
        }

        // Allow any digits and one decimal point
        const regex = /^[0-9]*\.?[0-9]*$/;
        if (regex.test(value) || value === '') {
            setFormData(prev => ({ ...prev, price: value }));
        }
    };

    const handleImageSelection = () => {
        handleImagePicker({
            setImageLoading,
            setFormData,
        });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.price) {
            newErrors.price = 'Price is required';
        } else if (isNaN(parseFloat(formData.price))) {
            newErrors.price = 'Price must be a valid number';
        } else if (parseFloat(formData.price) < 0) {
            newErrors.price = 'Price cannot be negative';
        }

        if (!formData.quantity) {
            newErrors.quantity = 'Quantity is required';
        } else if (isNaN(parseInt(formData.quantity))) {
            newErrors.quantity = 'Quantity must be a valid number';
        } else if (parseInt(formData.quantity) <= 0) {
            newErrors.quantity = 'Quantity must be greater than zero';
        }

        if (!formData.propertyId) {
            newErrors.propertyId = 'Property is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            let imageUrl = null;

            if (formData.image) {
                try {
                    imageUrl = await handleImageUpload({
                        imageUri: formData.image,
                        setImageLoading,
                        uploadImages
                    });

                    if (!imageUrl) {
                        Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: 'Failed to get image URL'
                        });
                        return;
                    }
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to upload image'
                    });
                    return;
                }
            }

            const apiData = {
                name: formData.name || '',
                description: formData.description || '',
                price: parseFloat(formData.price || '0'),
                quantity: parseInt(formData.quantity || '1'),
                status: formData.status || 'AVAILABLE',
                propertyId: formData.propertyId || ''
            };

            if (imageUrl) {
                apiData.image = imageUrl;
            }

            const response = await createInventory(apiData);

            if (response && response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Inventory item created successfully'
                });

                // Reset form và navigate
                setFormData({ ...initialFormState });
                setErrors({});
                setImageLoading(false);
                setIsPropertyModalVisible(false);
                navigation.goBack();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to create inventory item'
                });
            }
        } catch (error) {
            console.error('Inventory creation error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'An unexpected error occurred'
            });
        }
    };

    const handleSelectProperty = (property) => {
        setFormData(prev => ({
            ...prev,
            propertyId: property._id,
            propertyName: property.name
        }));
        setIsPropertyModalVisible(false);
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
        imageSelector: {
            backgroundColor: theme.card,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border || '#E5E7EB',
            height: 200,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
            overflow: 'hidden',
        },
        image: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        submitButton: {
            backgroundColor: theme.primary,
            borderRadius: 8,
            padding: 16,
            alignItems: 'center',
            marginTop: 16,
        },
        submitButtonText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 16,
        },
        imageOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        removeImageButton: {
            position: 'absolute',
            right: 8,
            top: 8,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 16,
            padding: 4,
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
                <ThemedText style={dynamicStyles.headerTitle}>Create Inventory Item</ThemedText>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={dynamicStyles.content}>
                    <TouchableOpacity
                        style={dynamicStyles.imageSelector}
                        onPress={handleImageSelection}
                        disabled={imageLoading}
                    >
                        {formData.image ? (
                            <>
                                <Image
                                    source={{ uri: formData.image }}
                                    style={dynamicStyles.image}
                                />
                                <TouchableOpacity
                                    style={dynamicStyles.removeImageButton}
                                    onPress={() => setFormData(prev => ({ ...prev, image: null, imageAsset: null }))}
                                >
                                    <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                                <View style={dynamicStyles.imageOverlay}>
                                    <Ionicons name="camera" size={32} color="#FFFFFF" />
                                </View>
                            </>
                        ) : imageLoading ? (
                            <ActivityIndicator size="large" color={theme.primary} />
                        ) : (
                            <>
                                <Ionicons name="camera-outline" size={48} color={theme.textSecondary || '#666'} />
                                <ThemedText style={{ marginTop: 8 }}>Add Image</ThemedText>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={dynamicStyles.formGroup}>
                        <ThemedText style={dynamicStyles.label}>Name</ThemedText>
                        <TextInput
                            style={[
                                dynamicStyles.input,
                                errors.name && dynamicStyles.inputError
                            ]}
                            placeholder="Enter inventory name"
                            placeholderTextColor={theme.textSecondary || '#666'}
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                        />
                        {errors.name && <Text style={dynamicStyles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={dynamicStyles.formGroup}>
                        <ThemedText style={dynamicStyles.label}>Description</ThemedText>
                        <TextInput
                            style={[
                                dynamicStyles.input,
                                errors.description && dynamicStyles.inputError,
                                { height: 100, textAlignVertical: 'top' }
                            ]}
                            placeholder="Enter description"
                            placeholderTextColor={theme.textSecondary || '#666'}
                            value={formData.description}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                            multiline
                            numberOfLines={4}
                        />
                        {errors.description && <Text style={dynamicStyles.errorText}>{errors.description}</Text>}
                    </View>

                    <View style={dynamicStyles.formGroup}>
                        <ThemedText style={dynamicStyles.label}>Price (USD)</ThemedText>
                        <TextInput
                            style={[
                                dynamicStyles.input,
                                errors.price && dynamicStyles.inputError
                            ]}
                            placeholder="$0.00"
                            placeholderTextColor={theme.textSecondary || '#666'}
                            value={formatPrice(formData.price)}
                            onChangeText={handlePriceInput}
                            keyboardType="decimal-pad"
                        />
                        {errors.price && <Text style={dynamicStyles.errorText}>{errors.price}</Text>}
                    </View>

                    <View style={dynamicStyles.formGroup}>
                        <ThemedText style={dynamicStyles.label}>Quantity</ThemedText>
                        <TextInput
                            style={[
                                dynamicStyles.input,
                                errors.quantity && dynamicStyles.inputError
                            ]}
                            placeholder="Enter quantity"
                            placeholderTextColor={theme.textSecondary || '#666'}
                            value={formData.quantity.toString()}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
                            keyboardType="number-pad"
                        />
                        {errors.quantity && <Text style={dynamicStyles.errorText}>{errors.quantity}</Text>}
                    </View>

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
                                style={formData.propertyName ? dynamicStyles.selectedPropertyText : dynamicStyles.placeholderText}
                                numberOfLines={1}
                            >
                                {formData.propertyName || 'Select property'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={theme.textSecondary || '#666'} />
                        </TouchableOpacity>
                        {errors.propertyId && <Text style={dynamicStyles.errorText}>{errors.propertyId}</Text>}
                    </View>

                    <TouchableOpacity
                        style={dynamicStyles.submitButton}
                        onPress={handleSubmit}
                        disabled={isCreating || imageLoading || isUploading}
                    >
                        {isCreating || imageLoading || isUploading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={dynamicStyles.submitButtonText}>Create Inventory Item</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            <PropertyModal />
        </SafeAreaView>
    );
};

export default InventoryCreateScreen; 