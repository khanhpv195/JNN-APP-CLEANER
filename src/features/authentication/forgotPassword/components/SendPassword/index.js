import { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';

import { Colors } from '@/shared/constants/colors';
import { useResetPassword } from '@/hooks/useForgotPassword';

const SendPassword = () => {
  const [password, setPassword] = useState('')
  const [cfPassword, setCfPassowrd] = useState('')
  const [isShow, setIsShow] = useState(false)

  const { onSubmit, errorMsg, isLoading, setErrorMsg } = useResetPassword()

  return (
      <View style={{/* was: className="gap-5" */}}>
        <View style={{/* was: className="flex-row items-center border border-neutral-200 rounded-2xl px-4" */}}>
          <TextInput
              style={{/* was: className="outline-none w-full h-14 border-none" */}}
              value={password}
              onChangeText={setPassword}
              placeholder="New Password"
              placeholderTextColor="#666"
              secureTextEntry={!isShow}
              editable={!isLoading}
          />
          <TouchableOpacity onPress={() => setIsShow(!isShow)}>
            {isShow ? <EyeIcon size={20} color={Colors.blue} /> : <EyeSlashIcon size={20} color={Colors.blue} />}
          </TouchableOpacity>
        </View>
        <View style={{/* was: className="flex-row items-center border border-neutral-200 rounded-2xl px-4" */}}>
          <TextInput
              style={{/* was: className="outline-none w-full h-14 border-none" */}}
              value={cfPassword}
              onChangeText={setCfPassowrd}
              placeholder="Confirm Password"
              placeholderTextColor="#666"
              secureTextEntry={!isShow}
              editable={!isLoading}
          />
          <TouchableOpacity onPress={() => setIsShow(!isShow)}>
            {isShow ? <EyeIcon size={20} color={Colors.blue} /> : <EyeSlashIcon size={20} color={Colors.blue} />}
          </TouchableOpacity>
        </View>

        <Text style={{/* was: className="text-red-400 text-center" */}}>{errorMsg}</Text>
        <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={() => onSubmit(password, cfPassword)}
            disabled={isLoading}
        >
            <Text style={styles.buttonText}>
                {isLoading ? 'Logging in...' : 'Confirm'}
            </Text>
        </TouchableOpacity>
      </View>
  )
}

const styles = StyleSheet.create({
    icon: {
        width: 200,
        height: 150,
        marginBottom: 20,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#00B074',
        textAlign: 'center',
    },
    passwordContainer: {
        width: '100%',
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: 12,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#00B074',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        borderRadius: 12
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    forgotPassword: {
        marginTop: 20,
    },
    forgotPasswordText: {
        color: '#FF0000',
        fontSize: 14,
    },
});

export default SendPassword