import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    handleImagePicker,
    createImageFormData
} from '@/utils/imageUtils';

import TaskApis from '../shared/api/taskApis';

export default function ChecklistModal({ visible, onClose, onComplete, loading, checkList }) {
    const [checklist, setChecklist] = useState(
        checkList.map(section => ({
            ...section,
            items: section.items.map(item => ({
                text: item,
                checked: false,
                image: null
            }))
        }))
    );
    const [isUploading, setIsUploading] = useState(false);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [currentItemIndices, setCurrentItemIndices] = useState(null);
    const [isAllCompleted, setIsAllCompleted] = useState(false);

    useEffect(() => {
        if (!isUploading && uploadQueue.length > 0) {
            const { imageUri, item, sectionIndex, itemIndex } = uploadQueue[0];
            uploadImageForItem(imageUri, item, sectionIndex, itemIndex);
        }
    }, [isUploading, uploadQueue]);

    // Check if all items are completed
    useEffect(() => {
        let allCompleted = true;

        for (const section of checklist) {
            for (const item of section.items) {
                // Each item must be checked and have an image
                if (!item.checked || !item.image) {
                    allCompleted = false;
                    break;
                }
            }
            if (!allCompleted) break;
        }

        setIsAllCompleted(allCompleted);
    }, [checklist]);

    // Function to select and upload images using imageUtils
    const selectImage = (item, sectionIndex, itemIndex) => {
        setCurrentItemIndices({ sectionIndex, itemIndex });

        handleImagePicker({
            setImageLoading: setIsUploading,
            setFormData: async (callback) => {
                const updatedData = callback({});
                if (updatedData.image) {
                    setUploadQueue(prevQueue => [
                        ...prevQueue,
                        { imageUri: updatedData.image, item, sectionIndex, itemIndex }
                    ]);
                }
            }
        });
    };

    // Upload image for a specific item and auto-check the checkbox
    const uploadImageForItem = async (imageUri, item, sectionIndex, itemIndex) => {
        try {
            setIsUploading(true);
            const formData = createImageFormData(imageUri);

            console.log('Debug: Uploading image:', imageUri);

            const response = await TaskApis.uploadImage(formData);
            handleUploadResponse(response, item, sectionIndex, itemIndex);
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Unable to upload image');
        } finally {
            setIsUploading(false);
            setUploadQueue(prevQueue => prevQueue.slice(1));
            setCurrentItemIndices(null);
        }
    };

    // Handle the upload response and auto-check the checkbox
    const handleUploadResponse = (response, item, sectionIndex, itemIndex) => {
        try {
            if (response?.success && response?.data?.[0]) {
                const imageUrl = response.data[0];

                const updatedChecklist = [...checklist];

                // Ensure indexes are valid
                if (sectionIndex === undefined || itemIndex === undefined) {
                    const foundSectionIndex = checklist.findIndex(section =>
                        section.items.includes(item)
                    );

                    if (foundSectionIndex === -1) {
                        throw new Error('Item not found in checklist');
                    }

                    const foundItemIndex = checklist[foundSectionIndex].items.indexOf(item);
                    sectionIndex = foundSectionIndex;
                    itemIndex = foundItemIndex;
                }

                // Update image and auto-check the checkbox
                updatedChecklist[sectionIndex].items[itemIndex].image = imageUrl;
                updatedChecklist[sectionIndex].items[itemIndex].checked = true;

                setChecklist(updatedChecklist);
                console.log('Debug: Image URL updated and item checked:', imageUrl);
            } else {
                throw new Error(response?.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error processing upload response:', error);
            Alert.alert('Lỗi', 'Không thể xử lý ảnh đã tải lên');
        }
    };

    const toggleCheck = (sectionIndex, itemIndex) => {
        // Prevent toggling during upload
        if (isUploading) return;

        setChecklist(prevList => {
            const newList = [...prevList];
            newList[sectionIndex].items[itemIndex].checked =
                !newList[sectionIndex].items[itemIndex].checked;
            return newList;
        });
    };

    const handleComplete = async () => {
        if (isUploading) {
            Alert.alert('Uploading Image', 'Please wait until the image upload is complete');
            return;
        }

        // Check once more if all items are completed
        if (!isAllCompleted) {
            Alert.alert(
                'Not Completed',
                'You need to check all items and take a photo for each before completing.',
                [{ text: 'Understood', style: 'default' }]
            );
            return;
        }

        try {
            const formattedChecklist = [];
            console.log('Starting checklist completion...');

            for (const section of checklist) {
                console.log('Processing section:', section.title);
                const formattedItems = [];

                for (const item of section.items) {
                    const formattedItem = {
                        text: item.text,
                        checked: item.checked,
                    };

                    if (item.image) {
                        console.log('Item has image:', item.image);
                        formattedItem.imageUrl = item.image;
                    }

                    formattedItems.push(formattedItem);
                }

                if (formattedItems.length > 0) {
                    formattedChecklist.push({
                        title: section.title,
                        items: formattedItems
                    });
                }
            }

            console.log('Final formatted checklist:', JSON.stringify(formattedChecklist, null, 2));
            onComplete(formattedChecklist);
        } catch (error) {
            console.error('Error completing checklist:', error);
            Alert.alert('Error', 'Unable to complete checklist');
        }
    };

    // Check if an item is currently uploading
    const isItemUploading = (sectionIndex, itemIndex) => {
        return isUploading &&
            currentItemIndices &&
            currentItemIndices.sectionIndex === sectionIndex &&
            currentItemIndices.itemIndex === itemIndex;
    };

    // Check the completion status of each item
    const getItemStatus = (item) => {
        if (!item.checked) return 'unchecked';
        if (!item.image) return 'noImage';
        return 'completed';
    };

    const renderChecklistItem = (item, sectionIndex, itemIndex) => {
        const itemLoading = isItemUploading(sectionIndex, itemIndex);
        const itemStatus = getItemStatus(item);

        return (
            <View style={[
                styles.checklistItem,
                itemLoading && styles.uploadingItem,
                itemStatus === 'completed' && styles.completedItem
            ]} key={`${sectionIndex}-${itemIndex}`}>
                <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => toggleCheck(sectionIndex, itemIndex)}
                    disabled={isUploading}
                >
                    {item.checked && <Ionicons name="checkmark" size={24} color="green" />}
                </TouchableOpacity>

                <Text style={styles.itemText}>{item.text}</Text>

                <TouchableOpacity
                    style={[
                        styles.cameraButton,
                        !item.image && styles.requiredCamera
                    ]}
                    onPress={() => selectImage(item, sectionIndex, itemIndex)}
                    disabled={isUploading}
                >
                    {item.image ? (
                        <Image
                            source={{ uri: item.image }}
                            style={styles.thumbnail}
                        />
                    ) : itemLoading ? (
                        <View style={styles.loadingButton}>
                            <ActivityIndicator size="small" color="#0000ff" />
                        </View>
                    ) : (
                        <Ionicons name="camera" size={24} color={itemStatus === 'unchecked' ? "#666" : "#ff3b30"} />
                    )}
                </TouchableOpacity>

                {itemLoading && (
                    <View style={styles.itemLoadingOverlay}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.loadingText}>Đang tải...</Text>
                    </View>
                )}
            </View>
        );
    };

    // Count completed items / total items
    const countCompletedItems = () => {
        let total = 0;
        let completed = 0;

        for (const section of checklist) {
            for (const item of section.items) {
                total++;
                if (item.checked && item.image) {
                    completed++;
                }
            }
        }

        return { completed, total };
    };

    const { completed, total } = countCompletedItems();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => {
                if (!isUploading) onClose();
            }}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Checklist ({completed}/{total})</Text>
                    </View>

                    <ScrollView style={styles.scrollContent}>
                        {checklist.map((section, sectionIndex) => (
                            <View key={section.title} style={styles.section}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                {section.items.map((item, itemIndex) => (
                                    renderChecklistItem(item, sectionIndex, itemIndex)
                                ))}
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.completeButton,
                                (isUploading || !isAllCompleted) && styles.disabledButton
                            ]}
                            onPress={handleComplete}
                            disabled={isUploading || !isAllCompleted}
                        >
                            <Text style={styles.completeButtonText}>
                                {isUploading ? 'Processing...' : isAllCompleted ? 'Complete' : 'Need to complete all items'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.cancelButton, isUploading && styles.disabledButton]}
                            onPress={onClose}
                            disabled={isUploading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    {isUploading && !currentItemIndices && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#0000ff" />
                            <Text style={{ marginTop: 10 }}>Uploading image...</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        width: '90%',
        maxHeight: '90%',
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        maxHeight: '75%',
        padding: 15,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        position: 'relative',
    },
    uploadingItem: {
        opacity: 0.8,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    completedItem: {
        backgroundColor: 'rgba(0,200,0,0.05)',
    },
    checkbox: {
        width: 30,
        height: 30,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        marginLeft: 10,
        flex: 1,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 5,
    },
    cameraButton: {
        padding: 10,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    requiredCamera: {
        borderWidth: 1,
        borderColor: '#ff3b30',
        borderRadius: 25,
        borderStyle: 'dashed',
    },
    loadingButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 5,
    },
    footer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    completeButton: {
        backgroundColor: '#00BFA5',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    completeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.7,
        backgroundColor: '#999',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    itemLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 5,
    },
    loadingText: {
        color: '#fff',
        marginTop: 5,
        fontSize: 12,
    }
}); 