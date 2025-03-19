import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useReservation } from '../hooks/useReservation';
const MAX_IMAGE_SIZE = 1; // Maximum size in MB
const COMPRESSION_OPTIONS = {
    maxSizeMB: MAX_IMAGE_SIZE,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.7,
};
export default function PropertyProblemScreen({ route, navigation }) {
    const [taskId, setTaskId] = useState(route?.params?.taskId);
    const [propertyId, setPropertyId] = useState(route?.params?.propertyId);
    const [problems, setProblems] = useState(route?.params?.problems || []);
    const [newProblem, setNewProblem] = useState({ description: '', imageUrl: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { updateProperty, uploadImage } = useReservation();

    useEffect(() => {
        if (route?.params?.taskId) {
            setTaskId(route.params.taskId);
        }
    }, [route]);

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    style={{ marginLeft: 16 }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            ),
            title: 'Property Problems',
            headerShown: true
        });
    }, []);

    const handleImagePick = async () => {
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

                            let fileToUpload = file;
                            if (file.size > MAX_IMAGE_SIZE * 1024 * 1024) {
                                fileToUpload = await compressImage(file);
                            }

                            const formData = new FormData();
                            formData.append('files', fileToUpload);
                            console.log('Debug: Uploading file from web:', fileToUpload.name);

                            const response = await uploadImage(formData);
                            handleUploadResponse(response);
                        }
                    } catch (error) {
                        console.error('Web upload error:', error);
                        window.alert('Failed to upload image');
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
                    window.alert('Camera and photo library permissions are required');
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
                                    const result = await ImagePicker.launchCameraAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                        allowsEditing: true,
                                        aspect: [4, 3],
                                        quality: 0.5,
                                        maxWidth: 1920,
                                        maxHeight: 1920,
                                    });

                                    if (!result.canceled && result.assets && result.assets[0]) {
                                        await handleImageSelected(result.assets[0]);
                                    }
                                } catch (err) {
                                    console.error('Camera error:', err);
                                    window.alert('Failed to take photo');
                                }
                            },
                        },
                        {
                            text: 'Choose from Library',
                            onPress: async () => {
                                try {
                                    const result = await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                        allowsEditing: true,
                                        aspect: [4, 3],
                                        quality: 0.5,
                                        maxWidth: 1920,
                                        maxHeight: 1920,
                                    });

                                    if (!result.canceled && result.assets && result.assets[0]) {
                                        await handleImageSelected(result.assets[0]);
                                    }
                                } catch (err) {
                                    console.error('Library error:', err);
                                    window.alert('Failed to pick image from library');
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
            window.alert('Failed to open image picker');
        }
    };

    const handleUploadResponse = (response) => {
        console.log('Handling upload response:', response);

        let imageUrl;

        if (Array.isArray(response)) {
            imageUrl = response[0];
        } else if (response?.success && Array.isArray(response.data)) {
            imageUrl = response.data[0];
        }

        if (imageUrl) {
            console.log('Got image URL:', imageUrl);
            setNewProblem(prev => ({
                ...prev,
                imageUrl: imageUrl
            }));
        } else {
            console.error('Invalid upload response:', response);
            window.alert('Failed to get image URL from server');
        }
    };

    const handleImageSelected = async (imageAsset) => {
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('files', {
                uri: imageAsset.uri,
                type: 'image/jpeg',
                name: 'image.jpg'
            });

            console.log('Uploading image...');
            const response = await uploadImage(formData);
            console.log('Upload API response:', response);

            handleUploadResponse(response);

        } catch (error) {
            console.error('Upload error:', error);
            window.alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const addProblem = () => {
        if (!newProblem.description.trim()) {
            window.alert('Please enter a description');
            return;
        }

        if (!newProblem.imageUrl) {
            window.alert('Please select an image');
            return;
        }

        setProblems(prev => [...prev, {
            id: Date.now().toString(),
            description: newProblem.description,
            imageUrl: newProblem.imageUrl,
            timestamp: new Date().toISOString()
        }]);

        setNewProblem({ description: '', imageUrl: '' });
    };

    const handleSave = async () => {
        if (!taskId || !propertyId) {
            window.alert('Missing required task or property information');
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                problemHistory: problems.map(problem => ({
                    date: new Date(),
                    taskId: taskId,
                    description: problem.description,
                    images: [problem.imageUrl],
                    status: 'PENDING',
                    completedAt: null,

                }))
            };

            console.log('Saving payload:', payload);

            const response = await updateProperty(propertyId, payload);

            if (response?.success) {
                window.alert('Problems saved successfully');
                navigation.goBack();
            } else {
                throw new Error(response?.message || 'Failed to save problems');
            }
        } catch (error) {
            console.error('Error saving problems:', error);
            window.alert(error.message || 'Failed to save problems');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.problemsList}>
                {problems.map((problem) => (
                    <View key={problem.id} style={styles.problemItem}>
                        <Image
                            source={{ uri: problem.imageUrl }}
                            style={styles.problemImage}
                            resizeMode="cover"
                        />
                        <View style={styles.problemDetails}>
                            <Text style={styles.problemDescription}>
                                {problem.description}
                            </Text>
                            <Text style={styles.timestamp}>
                                {new Date(problem.timestamp).toLocaleString()}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                const newProblems = problems.filter(p => p.id !== problem.id);
                                setProblems(newProblems);
                            }}
                            style={styles.removeButton}
                        >
                            <Ionicons name="trash-outline" size={24} color="#FF5252" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.addProblemSection}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Describe the problem..."
                        value={newProblem.description}
                        onChangeText={(text) => setNewProblem(prev => ({ ...prev, description: text }))}
                        multiline
                    />
                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={handleImagePick}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <ActivityIndicator color="#666" />
                        ) : newProblem.imageUrl ? (
                            <View>
                                <Image
                                    source={{ uri: newProblem.imageUrl }}
                                    style={styles.previewImage}
                                />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setNewProblem(prev => ({ ...prev, imageUrl: '' }))}
                                >
                                    <Ionicons name="close-circle" size={20} color="#FF5252" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Ionicons name="camera" size={24} color="#666" />
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.addButton, (!newProblem.description || !newProblem.imageUrl) && styles.disabledButton]}
                    onPress={addProblem}
                    disabled={!newProblem.description || !newProblem.imageUrl}
                >
                    <Text style={styles.addButtonText}>Add Problem</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.saveButton, (isSubmitting || problems.length === 0) && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={isSubmitting || problems.length === 0}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save All Problems</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    problemsList: {
        flex: 1,
        padding: 16,
    },
    problemItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    problemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    problemDetails: {
        flex: 1,
    },
    problemDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
    },
    removeButton: {
        padding: 8,
    },
    addProblemSection: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginRight: 12,
        fontSize: 16,
    },
    cameraButton: {
        width: 60,
        height: 60,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    addButton: {
        backgroundColor: '#00BFA5',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#1976D2',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
}); 