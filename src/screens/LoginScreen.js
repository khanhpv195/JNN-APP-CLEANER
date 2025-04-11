import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    SafeAreaView,
    Alert,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '@/redux/slices/authSlice';
import * as Device from 'expo-device';
import { registerForPushNotificationsAsync } from '@/services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NavigationService from '@/navigation/NavigationService';
import { useTheme } from '@/shared/theme';
import { ThemedText, ThemedButton } from '@/components';
import Logo from '../../assets/images/Logo.png';

/**
 * LoginScreen Component
 * Handles user authentication through email/password login
 */
export default function LoginScreen({ navigation, route }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isShow, setIsShow] = useState(false);
    const [keepLoggedIn, setKeepLoggedIn] = useState(true);
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [pushToken, setPushToken] = useState(null);
    const { theme } = useTheme();

    const dispatch = useDispatch();
    const { loading, error, isLoggedIn } = useSelector((state) => state.auth);

    // Get device information and push token when component mounts
    useEffect(() => {
        const getDeviceAndTokenInfo = async () => {
            try {
                // Get device information
                const deviceInfo = {
                    brand: Device.brand || '',
                    name: Device.deviceName || '',
                    firebaseDeviceToken: '', // Khởi tạo rỗng
                    osName: Platform.OS,
                    osVersion: Platform.Version.toString(),
                    uniqueId: `${Device.modelName || 'unknown'}-${Date.now()}`,
                    firstInstallTime: Date.now(),
                    macAddress: '00:00:00:00:00:00', // Privacy concerns, not recommended to collect actual MAC
                };

                // Thử lấy token từ App.js (đã được lưu trong AsyncStorage)
                let token = await AsyncStorage.getItem('pushNotificationToken');
                console.log("Token từ AsyncStorage:", token);

                // Nếu không có token trong storage, đăng ký lấy token mới
                if (!token) {
                    console.log("Không tìm thấy token, đang đăng ký mới...");
                    try {
                        token = await registerForPushNotificationsAsync();
                        console.log("Token mới đăng ký:", token);

                        if (token) {
                            await AsyncStorage.setItem('pushNotificationToken', token);
                            console.log("Đã lưu token mới vào AsyncStorage");
                        }
                    } catch (tokenError) {
                        console.error("Lỗi khi đăng ký token:", tokenError);
                    }
                }

                if (token) {
                    deviceInfo.firebaseDeviceToken = token;
                    setPushToken(token);
                    console.log("Đã gán token vào deviceInfo:", token);
                } else {
                    console.warn("Không thể lấy được token thông báo");
                }

                setDeviceInfo(deviceInfo);
            } catch (error) {
                console.error('Lỗi khi lấy thông tin thiết bị:', error);
            }
        };

        getDeviceAndTokenInfo();
    }, []);

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        const loginData = {
            email,
            password,
            keepLoggedIn
        };

        // Add device information if available
        if (deviceInfo) {
            loginData.device = deviceInfo;
        }

        dispatch(loginUser(loginData));
    };

    // Handle displaying session expiration message when redirected to login
    useEffect(() => {
        // Check route params for session expiration flag
        if (route?.params?.sessionExpired) {
            console.log("Session expired flag detected in route params, showing alert");
            // Clear the session expired param immediately to prevent showing the alert multiple times
            if (navigation.setParams) {
                navigation.setParams({ sessionExpired: undefined });
            }

            // Show the alert after clearing params
            setTimeout(() => {
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please log in again.',
                    [{ text: 'OK' }]
                );
            }, 100);
        }
    }, [route?.params]);

    // Debug auth state changes
    useEffect(() => {
        console.log("LoginScreen - Auth state changed:", { isLoggedIn, loading, error });
    }, [isLoggedIn, loading, error]);

    // Debug successful login flow
    useEffect(() => {
        if (isLoggedIn) {
            console.log("LoginScreen - User is logged in, should navigate away");
        }
    }, [isLoggedIn]);

    // Create dynamic styles based on the current theme
    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.background,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 16,
            paddingHorizontal: 16,
            backgroundColor: theme.card,
        },
        input: {
            flex: 1,
            height: 56,
            color: theme.text,
        },
        button: {
            width: '100%',
            height: 50,
            backgroundColor: theme.primary,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10,
        },
        buttonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        buttonDisabled: {
            backgroundColor: theme.border,
        },
        forgotPasswordText: {
            color: theme.accent,
            fontWeight: '600',
        },
        title: {
            fontWeight: 'bold',
            fontSize: 24,
            color: theme.text,
        },
        subtitle: {
            color: theme.textSecondary,
        },
        errorText: {
            color: theme.error || '#FF3B30',
            textAlign: 'center',
        },
        checkboxLabel: {
            color: theme.text,
            marginLeft: 8,
            fontSize: 16,
        }
    });

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <View style={styles.logoContainer}>
                <Image source={Logo} style={styles.logo} />
                <ThemedText style={dynamicStyles.title}>JNN Management System</ThemedText>
                <ThemedText style={dynamicStyles.subtitle}>Project by JNN</ThemedText>
            </View>

            <View style={styles.formContainer}>
                <View style={dynamicStyles.inputContainer}>
                    <TextInput
                        style={dynamicStyles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor={theme.textSecondary}
                        editable={!loading}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={dynamicStyles.inputContainer}>
                    <TextInput
                        style={dynamicStyles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor={theme.textSecondary}
                        secureTextEntry={!isShow}
                        editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setIsShow(!isShow)}>
                        <Icon name={isShow ? "eye-outline" : "eye-off-outline"} size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                        style={[
                            styles.checkbox,
                            keepLoggedIn && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                        onPress={() => setKeepLoggedIn(!keepLoggedIn)}
                    >
                        {keepLoggedIn && <Icon name="checkmark" size={16} color="white" />}
                    </TouchableOpacity>
                    <ThemedText style={dynamicStyles.checkboxLabel}>Keep me logged in</ThemedText>
                </View>

                {error && <ThemedText style={dynamicStyles.errorText}>{error}</ThemedText>}

                <ThemedButton
                    title={loading ? 'Logging in...' : 'Login'}
                    onPress={handleLogin}
                    disabled={loading}
                    style={styles.loginButton}
                />

                <TouchableOpacity
                    onPress={() => NavigationService.navigate('ForgotPassword')}
                    style={styles.forgotPassword}
                >
                    <ThemedText style={dynamicStyles.forgotPasswordText}>Forgot password</ThemedText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

/**
 * Static styles that don't depend on theme
 */
const styles = StyleSheet.create({
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        height: 120,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    formContainer: {
        width: '85%',
        maxWidth: 400,
        gap: 20
    },
    loginButton: {
        marginTop: 10,
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    }
});