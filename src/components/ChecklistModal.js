import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Platform,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DebugLogger from './DebugLogger';
import ImageCompressor from 'browser-image-compression';

import cleanerApis from '../shared/api/cleanerApis';

const MAX_IMAGE_SIZE = 1; // Maximum size in MB
const COMPRESSION_OPTIONS = {
    maxSizeMB: MAX_IMAGE_SIZE,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.7,
};

const compressImage = async (file) => {
    try {
        console.log('Original file size:', file.size / 1024 / 1024, 'MB');
        const compressedFile = await ImageCompressor(file, COMPRESSION_OPTIONS);
        console.log('Compressed file size:', compressedFile.size / 1024 / 1024, 'MB');
        return compressedFile;
    } catch (error) {
        console.error('Compression error:', error);
        throw error;
    }
};

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

    const handleImagePick = async (item) => {
        try {
            if (Platform.OS === 'web') {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.style.display = 'none';

                input.onchange = async (e) => {
                    try {
                        setIsUploading(true);
                        const file = e.target.files[0];
                        if (file) {
                            console.log('Selected file size:', file.size / 1024 / 1024, 'MB');

                            // Nén ảnh nếu kích thước lớn hơn MAX_IMAGE_SIZE MB
                            let fileToUpload = file;
                            if (file.size > MAX_IMAGE_SIZE * 1024 * 1024) {
                                fileToUpload = await compressImage(file);
                            }

                            const formData = new FormData();
                            formData.append('files', fileToUpload);
                            console.log('Debug: Uploading file from web:', fileToUpload.name);

                            const response = await cleanerApis.uploadImage(formData);
                            handleUploadResponse(response, item);
                        }
                    } catch (error) {
                        console.error('Web upload error:', error);
                        Alert.alert('Error', 'Failed to upload image');
                    } finally {
                        setIsUploading(false);
                    }
                };

                document.body.appendChild(input);
                input.click();
                document.body.removeChild(input);
            } else {
                // Mobile version
                const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
                const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

                if (cameraStatus !== 'granted' && libraryStatus !== 'granted') {
                    Alert.alert('Permission needed', 'Camera and photo library permissions are required');
                    return;
                }

                Alert.alert(
                    'Select Image',
                    'Choose image source',
                    [
                        {
                            text: 'Take Photo',
                            onPress: async () => {
                                try {
                                    console.log('Debug: Opening camera...');
                                    const result = await ImagePicker.launchCameraAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                        allowsEditing: true,
                                        aspect: [4, 3],
                                        quality: 0.5, // Giảm quality xuống 0.5 để giảm kích thước
                                        maxWidth: 1920, // Giới hạn kích thước ảnh
                                        maxHeight: 1920,
                                    });

                                    if (!result.canceled && result.assets && result.assets[0]) {
                                        console.log('Debug: Photo taken successfully');
                                        await handleImageSelected(result.assets[0], item);
                                    }
                                } catch (err) {
                                    console.error('Camera error:', err);
                                    Alert.alert('Error', 'Failed to take photo');
                                }
                            },
                        },
                        {
                            text: 'Choose from Library',
                            onPress: async () => {
                                try {
                                    console.log('Debug: Opening library...');
                                    const result = await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                        allowsEditing: true,
                                        aspect: [4, 3],
                                        quality: 0.5, // Giảm quality xuống 0.5
                                        maxWidth: 1920, // Giới hạn kích thước ảnh
                                        maxHeight: 1920,
                                    });

                                    if (!result.canceled && result.assets && result.assets[0]) {
                                        console.log('Debug: Photo selected successfully');
                                        await handleImageSelected(result.assets[0], item);
                                    }
                                } catch (err) {
                                    console.error('Library error:', err);
                                    Alert.alert('Error', 'Failed to pick image from library');
                                }
                            },
                        },
                        { text: 'Cancel', style: 'cancel' },
                    ],
                    { cancelable: true }
                );
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to open image picker');
        }
    };

    // Hàm xử lý response từ server
    const handleUploadResponse = (response, item) => {
        if (response?.success && response?.data?.[0]) {
            const imageUrl = response.data[0].startsWith('http')
                ? response.data[0]
                : `${process.env.APP_URL_PROD}${response.data[0]}`;

            const updatedChecklist = [...checklist];
            const sectionIndex = checklist.findIndex(section =>
                section.items.includes(item)
            );
            const itemIndex = checklist[sectionIndex].items.indexOf(item);
            updatedChecklist[sectionIndex].items[itemIndex].image = imageUrl;
            setChecklist(updatedChecklist);

            console.log('Debug: Image URL updated:', imageUrl);
        } else {
            throw new Error(response?.message || 'Failed to upload image');
        }
    };

    // Hàm xử lý ảnh đã chọn (cho mobile)
    const handleImageSelected = async (imageAsset, item) => {
        try {
            setIsUploading(true);
            const formData = new FormData();

            const fileToUpload = {
                uri: imageAsset.uri,
                type: 'image/jpeg',
                name: 'photo.jpg'
            };

            formData.append('files', fileToUpload);
            console.log('Debug: Uploading file from mobile:', fileToUpload.uri);

            const response = await cleanerApis.uploadImage(formData);
            handleUploadResponse(response, item);
        } catch (error) {
            console.error('Error handling selected image:', error);
            Alert.alert('Error', 'Failed to process selected image');
        } finally {
            setIsUploading(false);
        }
    };

    const toggleCheck = (sectionIndex, itemIndex) => {
        setChecklist(prevList => {
            const newList = [...prevList];
            newList[sectionIndex].items[itemIndex].checked =
                !newList[sectionIndex].items[itemIndex].checked;
            return newList;
        });
    };

    const handleComplete = async () => {
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
                        formattedItem.imageUrl = item.image; // Sử dụng URL đã upload trước đó
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

            // Gọi onComplete với checklist đã format
            onComplete(formattedChecklist);

        } catch (error) {
            console.error('Error completing checklist:', error);
            Alert.alert('Error', 'Failed to complete checklist');
        }
    };

    const logFormData = (formData) => {
        for (let pair of formData.entries()) {
            console.log('FormData entry:', pair[0], pair[1]);
        }
    };

    const validateFile = (file) => {
        console.log('File validation:', {
            uri: file.uri,
            type: file.type,
            name: file.name,
            size: file.size,
            exists: typeof file.uri === 'string' && file.uri.length > 0
        });
    };

    const renderChecklistItem = (item, sectionIndex, itemIndex) => (
        <View style={styles.checklistItem} key={`${sectionIndex}-${itemIndex}`}>
            <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleCheck(sectionIndex, itemIndex)}
            >
                {item.checked && <Ionicons name="checkmark" size={24} color="green" />}
            </TouchableOpacity>

            <Text style={styles.itemText}>{item.text}</Text>

            <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => handleImagePick(item)}
            >
                {item.image ? (
                    <Image
                        source={{ uri: item.image }}
                        style={styles.thumbnail}
                    />
                ) : (
                    <Ionicons name="camera" size={24} color="black" />
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <ScrollView>
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
                            style={[styles.completeButton, isUploading && styles.disabledButton]}
                            onPress={handleComplete}
                            disabled={isUploading}
                        >
                            <Text style={styles.completeButtonText}>
                                {isUploading ? 'Processing...' : 'Complete All'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onClose}
                        disabled={isUploading}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    {isUploading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#0000ff" />
                            <Text>Uploading image...</Text>
                        </View>
                    )}
                </View>
            </View>
            {/* {__DEV__ && <DebugLogger />} */}
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
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    checkbox: {
        flex: 1,
        flexDirection: 'row',
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
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 5,
    },
    completeButton: {
        backgroundColor: '#00BFA5',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
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
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.7,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    disabledButton: {
        opacity: 0.5,
    },
}); 