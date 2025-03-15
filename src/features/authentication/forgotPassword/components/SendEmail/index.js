import { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native'

import { useForgotPassword } from '@/hooks/useForgotPassword';

const SendEmail = ({ setIsSwitch }) => {
  const [email, setEmail] = useState('')
  
  const { onSubmit, errorMsg, isLoading } = useForgotPassword()

  return (
    <View>
        <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#666"
            editable={!isLoading}
            autoCapitalize="none"
        />

        <Text className="text-red-400 text-center">{errorMsg}</Text>
        <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={() => onSubmit(email, setIsSwitch)}
            disabled={isLoading}
        >
            <Text style={styles.buttonText}>
                {isLoading ? 'Logging in...' : 'Login'}
            </Text>
        </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#00B074',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        backgroundColor: '#F8F9FA',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default SendEmail