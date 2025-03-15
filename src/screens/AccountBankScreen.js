import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUpdateBankInformation } from '../hooks/useUpdateBankInformation';
import Toast from 'react-native-toast-message';

export default function AccountBankScreen() {
    const navigation = useNavigation();
    const [isEditMode, setIsEditMode] = useState(false);
    const [accountNumber, setAccountNumber] = useState('000123456789');
    const [routingNumber, setRoutingNumber] = useState('110000000');
    const [accountHolderName, setAccountHolderName] = useState('Test Account');
    const { updateBankInformation, loading } = useUpdateBankInformation();

    const handleSave = async () => {
        try {
            const bankData = {
                account_number: accountNumber,
                routing_number: routingNumber,
                account_holder_name: accountHolderName
            };

            await updateBankInformation(bankData);

            Toast.show({
                type: 'success',
                position: 'bottom',
                text1: 'Success',
                text2: 'Bank information updated successfully',
                visibilityTime: 3000,
                autoHide: true,
                topOffset: 30,
                bottomOffset: 40,
            });

            setIsEditMode(false);
        } catch (error) {
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error',
                text2: error.message || 'Failed to update bank information',
                visibilityTime: 3000,
                autoHide: true,
                topOffset: 30,
                bottomOffset: 40,
            });
        }
    };

    const handleCancel = () => {
        // Reset to original values if needed
        setIsEditMode(false);
    };

    const renderField = (label, value) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {isEditMode ? (
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={(text) => {
                        switch (label) {
                            case 'Account number':
                                setAccountNumber(text);
                                break;
                            case 'Routing number':
                                setRoutingNumber(text);
                                break;
                            case 'Account holder name':
                                setAccountHolderName(text);
                                break;
                        }
                    }}
                    keyboardType={label.includes('number') ? 'numeric' : 'default'}
                />
            ) : (
                <Text style={styles.fieldValue}>{value}</Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment receiving account</Text>
            </View>

            {/* Form Content */}
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Recipient account information</Text>

                <View style={styles.inputContainer}>
                    {renderField('Account number', accountNumber)}
                    {renderField('Routing number', routingNumber)}
                    {renderField('Account holder name', accountHolderName)}
                </View>
            </View>

            {/* Buttons */}
            {isEditMode ? (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleCancel}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.saveButton]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? 'Saving...' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => setIsEditMode(true)}
                >
                    <Text style={styles.updateButtonText}>Update</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#00BFA5',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '500',
        color: 'white',
    },
    content: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    inputContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    fieldValue: {
        fontSize: 16,
        color: '#333',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
    },
    input: {
        fontSize: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
    },
    buttonContainer: {
        flexDirection: 'row',
        padding: 16,
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#00BFA5',
    },
    saveButton: {
        backgroundColor: '#00BFA5',
    },
    cancelButtonText: {
        color: '#00BFA5',
        fontSize: 16,
        fontWeight: '500',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    updateButton: {
        backgroundColor: '#00BFA5',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    updateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
}); 