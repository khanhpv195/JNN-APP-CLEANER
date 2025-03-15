import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Platform
} from 'react-native';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { useGetProperty } from '@/hooks/useProperty';
import {
    useCreateMaintenance
} from '@/shared/api/maintenanceApis';
import { Picker } from '@react-native-picker/picker';

export const MaintenanceTaskCreation = () => {
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    // Get properties list
    const { properties, isLoading: loadingProperties } = useGetProperty();

    console.log('properties', properties);

    // Create maintenance task mutation
    const createMaintenanceMutation = useCreateMaintenance();

    const handleCreateMaintenanceTask = async () => {
        if (!selectedPropertyId) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select a property',
                position: 'bottom',
                visibilityTime: 3000,
            });
            return;
        }

        if (!description.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter a description',
                position: 'bottom',
                visibilityTime: 3000,
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // Prepare request data
            const taskData = {
                propertyId: selectedPropertyId,
                description: description.trim()
            };

            console.log('Creating maintenance task with data:', taskData);

            // Call API
            await createMaintenanceMutation.mutateAsync(taskData);

            // Clear form
            setSelectedPropertyId('');
            setDescription('');

            // Show success message
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Maintenance task created successfully',
                position: 'bottom',
                visibilityTime: 3000,
            });

            // navigate to maintenance task list

        } catch (error) {
            console.error('Error creating maintenance task:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to create maintenance task',
                position: 'bottom',
                visibilityTime: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.maintenanceSection}>
            <Text style={styles.sectionTitle}>Create Maintenance Task</Text>

            {loadingProperties ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#00BFA5" />
                    <Text style={styles.loadingText}>Loading properties...</Text>
                </View>
            ) : (
                <>
                    <View style={styles.pickerContainer}>
                        <Text style={styles.inputLabel}>Select Property:</Text>
                        <TouchableOpacity
                            style={styles.pickerWrapper}
                            onPress={() => Platform.OS === 'ios' && setShowPicker(!showPicker)}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.pickerText}>
                                {selectedPropertyId
                                    ? properties.find(p => p._id === selectedPropertyId)?.name || `Property ${selectedPropertyId}`
                                    : "-- Select a property --"}
                            </Text>
                            {Platform.OS === 'ios' && <Text style={{ fontSize: 18, color: '#666' }}>▼</Text>}
                        </TouchableOpacity>
                    </View>

                    {Platform.OS === 'android' && (
                        <View style={styles.androidPickerContainer}>
                            <Picker
                                selectedValue={selectedPropertyId}
                                onValueChange={(itemValue) => setSelectedPropertyId(itemValue)}
                                style={styles.picker}
                                enabled={!isSubmitting}
                            >
                                <Picker.Item label="-- Select a property --" value="" />
                                {properties.map((property) => (
                                    <Picker.Item
                                        key={property?._id}
                                        label={property?.name || `Property ${property?._id}`}
                                        value={property?._id}
                                    />
                                ))}
                            </Picker>
                        </View>
                    )}

                    {Platform.OS === 'ios' && showPicker && (
                        <View style={styles.iosPickerModal}>
                            <View style={styles.iosPickerContainer}>
                                <View style={styles.iosPickerHeader}>
                                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                                        <Text style={styles.iosPickerDoneBtn}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <Picker
                                    selectedValue={selectedPropertyId}
                                    onValueChange={(itemValue) => setSelectedPropertyId(itemValue)}
                                    style={styles.iosPicker}
                                    enabled={!isSubmitting}
                                >
                                    <Picker.Item label="-- Select a property --" value="" />
                                    {properties.map((property) => (
                                        <Picker.Item
                                            key={property?._id}
                                            label={property?.name || `Property ${property?._id}`}
                                            value={property?._id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Description:</Text>
                        <TextInput
                            style={styles.textInput}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Enter maintenance task description"
                            multiline
                            numberOfLines={4}
                            editable={!isSubmitting}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.createButton,
                            (!selectedPropertyId || !description.trim() || isSubmitting) && styles.disabledButton
                        ]}
                        onPress={handleCreateMaintenanceTask}
                        disabled={!selectedPropertyId || !description.trim() || isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.createButtonText}>Create Task</Text>
                        )}
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    header: {
        backgroundColor: '#00BFA5',
        padding: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    profileSection: {
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 20,
    },
    avatarContainer: {
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E1E1E1',
        marginBottom: 10,
    },
    username: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
    },
    menuSection: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    signOutItem: {
        borderBottomWidth: 0,
    },
    signOutText: {
        color: '#FF3B30',
    },
    // Maintenance task creation styles
    maintenanceSection: {
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 20,
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    pickerContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        fontWeight: '500',
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFF',
        padding: 12,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pickerText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    picker: {
        height: 50,
        width: '100%',
        backgroundColor: '#fff',
    },
    iosPickerModal: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        justifyContent: 'flex-end',
    },
    iosPickerContainer: {
        backgroundColor: '#fff',
        width: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
    },
    iosPickerDoneBtn: {
        color: '#00BFA5',
        fontSize: 16,
        fontWeight: 'bold',
    },
    iosPicker: {
        height: 200,
        width: '100%',
    },
    androidPickerContainer: {
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#FFF',
    },
    inputContainer: {
        marginBottom: 16,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: 8,
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
        backgroundColor: '#FFF',
    },
    createButton: {
        backgroundColor: '#00BFA5',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledButton: {
        backgroundColor: '#A0A0A0',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 8,
        color: '#666',
    },
    // Maintenance settings styles
    settingsSection: {
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 20,
        borderRadius: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    saveButton: {
        backgroundColor: '#00BFA5',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
}); 