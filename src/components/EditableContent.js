import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { PencilIcon, XMarkIcon, CheckIcon } from "react-native-heroicons/outline";
import Toast from 'react-native-toast-message';

const EditableContent = ({ title, content, onSave, multiline = true, placeholder = "Enter content..." }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            await onSave(editedContent);
            setIsLoading(false);
            setIsEditing(false);

            // Show success toast
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `${title} updated successfully`,
                position: 'bottom',
                visibilityTime: 2000,
            });
        } catch (error) {
            setIsLoading(false);

            // Show error toast
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: `Failed to update ${title.toLowerCase()}`,
                position: 'bottom',
                visibilityTime: 3000,
            });

            console.error('Error saving content:', error);
        }
    };

    return (
        <View style={{/* was: className="border border-gray-200 divide-y divide-gray-200 px-5 rounded-2xl bg-white mb-4" */}}>
            <View style={{/* was: className="flex-row justify-between items-start py-4" */}}>
                <Text style={{/* was: className="font-semibold capitalize" */}}>{title}</Text>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <PencilIcon size={16} color="#22c55e" />
                </TouchableOpacity>
            </View>
            <View style={{/* was: className="py-4" */}}>
                <Text style={{/* was: className="text-gray-600 text-sm" */}}>
                    {content || `No ${title.toLowerCase()} available`}
                </Text>
            </View>

            {/* Edit Modal */}
            <Modal
                visible={isEditing}
                transparent={true}
                animationType="slide"
                onRequestClose={() => !isLoading && setIsEditing(false)}
            >
                <View style={{/* was: className="flex-1 bg-black bg-opacity-50 justify-end" */}}>
                    <View style={{/* was: className="bg-gray-50 rounded-t-3xl p-5 h-4/5" */}}>
                        <View style={{/* was: className="flex-row justify-between items-center mb-6" */}}>
                            <Text style={{/* was: className="text-xl font-bold" */}}>Edit {title}</Text>
                            <TouchableOpacity
                                style={{/* was: className="bg-green-500 p-2 rounded-full" */}}
                                onPress={() => !isLoading && setIsEditing(false)}
                                disabled={isLoading}
                            >
                                <XMarkIcon size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View style={{/* was: className="flex-1" */}}>
                            <TextInput
                                style={{/* was: className="bg-white border border-gray-300 rounded-xl p-4 text-base flex-1" */}}
                                placeholder={placeholder}
                                value={editedContent}
                                onChangeText={setEditedContent}
                                multiline={true}
                                numberOfLines={12}
                                textAlignVertical="top"
                                style={{ minHeight: '80%' }}
                                editable={!isLoading}
                            />

                            <View style={{/* was: className="flex-row justify-end mt-3" */}}>
                                <TouchableOpacity
                                    style={{/* was: className="flex-row items-center justify-center bg-red-500 px-6 py-3 rounded-xl mr-3" */}}
                                    onPress={() => !isLoading && setIsEditing(false)}
                                    disabled={isLoading}
                                >
                                    <XMarkIcon size={20} color="white" />
                                    <Text style={{/* was: className="text-white font-medium ml-2" */}}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`flex-row items-center justify-center ${isLoading ? 'bg-green-400' : 'bg-green-500'} px-6 py-3 rounded-xl`}
                                    onPress={handleSave}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <CheckIcon size={20} color="white" />
                                    )}
                                    <Text style={{/* was: className="text-white font-medium ml-2" */}}>
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default EditableContent; 