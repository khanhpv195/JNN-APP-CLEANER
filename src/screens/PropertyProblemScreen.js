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
    KeyboardAvoidingView,
    Platform,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReservation } from '../hooks/useReservation';
import {
    handleImagePicker,
    createImageFormData
} from '@/utils/imageUtils';

export default function PropertyProblemScreen({ route, navigation }) {
    const [taskId, setTaskId] = useState(route?.params?.taskId);
    const [propertyId, setPropertyId] = useState(route?.params?.propertyId);
    const [problems, setProblems] = useState(route?.params?.problems || []);
    const [newProblem, setNewProblem] = useState({ description: '', imageUrl: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const { updateProperty, uploadImage } = useReservation();

    useEffect(() => {
        if (route?.params?.taskId) {
            setTaskId(route.params.taskId);
        }
    }, [route]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

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

    const handleImageSelection = () => {
        handleImagePicker({
            setImageLoading,
            setFormData: async (callback) => {
                // When image is selected from picker
                const updatedData = callback({});
                if (updatedData.image) {
                    try {
                        await handleImageSelected({ uri: updatedData.image });
                    } catch (error) {
                        console.error('Failed to process selected image:', error);
                    }
                }
            },
        });
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
            Alert.alert('Error', 'Failed to get image URL from server');
        }
    };

    const handleImageSelected = async (imageAsset) => {
        try {
            setIsUploading(true);
            const formData = createImageFormData(imageAsset.uri);

            console.log('Uploading image...');
            const response = await uploadImage(formData);
            console.log('Upload API response:', response);

            handleUploadResponse(response);

        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setIsUploading(false);
            setImageLoading(false);
        }
    };

    const addProblem = () => {
        if (!newProblem.description.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return;
        }

        if (!newProblem.imageUrl) {
            Alert.alert('Error', 'Please select an image');
            return;
        }

        // Create a new problem in the same format as the existing problems
        const newProblemItem = {
            date: new Date().toISOString(),
            description: newProblem.description,
            images: [newProblem.imageUrl],  // Put the imageUrl in an array to match existing format
            status: 'PENDING',
            completedAt: null,
            // Add these fields to ensure compatibility with both displays
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            imageUrl: newProblem.imageUrl
        };

        setProblems(prev => [...prev, newProblemItem]);
        setNewProblem({ description: '', imageUrl: '' });
        Keyboard.dismiss();
    };

    const handleSave = async () => {
        if (!taskId || !propertyId) {
            Alert.alert('Error', 'Missing required task or property information');
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
                Alert.alert('Success', 'Problems saved successfully');
                navigation.goBack();
            } else {
                throw new Error(response?.message || 'Failed to save problems');
            }
        } catch (error) {
            console.error('Error saving problems:', error);
            Alert.alert('Error', error.message || 'Failed to save problems');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.mainContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.container}>
                <ScrollView style={styles.problemsList}>
                    {problems.map((problem, index) => (
                        <View key={problem.id || index} style={styles.problemItem}>
                            <Image
                                source={{ uri: problem.imageUrl || (problem.images && problem.images[0]) }}
                                style={styles.problemImage}
                                resizeMode="cover"
                            />
                            <View style={styles.problemDetails}>
                                <Text style={styles.problemDescription}>
                                    {problem.description}
                                </Text>
                                <View style={styles.problemFooter}>
                                    <Text style={styles.timestamp}>
                                        {new Date(problem.timestamp || problem.date).toLocaleString()}
                                    </Text>
                                    <View style={[styles.statusBadge,
                                    problem.status === 'PENDING' && styles.pendingBadge,
                                    problem.status === 'INPROCESS' && styles.inprocessBadge,
                                    problem.status === 'COMPLETED' && styles.completedBadge
                                    ]}>
                                        <Text style={styles.statusText}>{problem.status || 'PENDING'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}

                    {keyboardVisible && Platform.OS === 'android' &&
                        <View style={{ height: 300 }} />
                    }
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
                            onPress={handleImageSelection}
                            disabled={isUploading || imageLoading}
                        >
                            {isUploading || imageLoading ? (
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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
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
        maxHeight: 100,
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
    problemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pendingBadge: {
        backgroundColor: '#FFF9C4',
    },
    inprocessBadge: {
        backgroundColor: '#BBDEFB',
    },
    completedBadge: {
        backgroundColor: '#C8E6C9',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333',
    },
});