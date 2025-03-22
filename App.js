import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Platform, View } from 'react-native';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/NavigationService';
import { checkAuthState } from './src/redux/slices/authSlice';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  removeNotificationListeners
} from './src/services/notificationService';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/shared/api/queryClient';
import "./global.css"
import Toast from 'react-native-toast-message';
import { ThemeProvider } from './src/shared/theme';
import ThemedStatusBar from './src/components/ThemedStatusBar';
import { ThemedTailwindProvider } from './src/styles/ThemedTailwind';
// Import i18n configuration
import './src/translations/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/translations/i18n';

// Child component to use Redux hooks
function AppContent() {
  const dispatch = useDispatch();
  const { isLoggedIn, loading, user } = useSelector(state => state.auth);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);
  const notificationListeners = useRef(null);

  useEffect(() => {
    const initializeApp = async () => {
      // Check login status
      dispatch(checkAuthState());
    };

    initializeApp();

    // Cleanup
    return () => {
      if (notificationListeners.current) {
        removeNotificationListeners(notificationListeners.current);
      }
    };
  }, [dispatch]);  // Chỉ phụ thuộc vào dispatch

  // Tạo một useEffect riêng để kiểm tra bankAccount mỗi khi user hoặc isLoggedIn thay đổi
  useEffect(() => {
    if (isLoggedIn && user) {
      console.log('User data:', JSON.stringify(user));

      // Check bankAccount in detail
      console.log('Bank account value:', user.bankAccount);
      console.log('Bank account type:', typeof user.bankAccount);
      console.log('Is array?', Array.isArray(user.bankAccount));

      if (typeof user.bankAccount === 'object' && !Array.isArray(user.bankAccount)) {
        console.log('Object keys:', Object.keys(user.bankAccount));
      }

      // Kiểm tra xem bankAccount có tồn tại và có dữ liệu không
      const hasBankAccount = user.bankAccount &&
        (typeof user.bankAccount === 'object' &&
          ((Array.isArray(user.bankAccount) ? user.bankAccount.length > 0 : Object.keys(user.bankAccount).length > 0)));

      console.log('Final check - Bank account exists:', hasBankAccount);

      if (!hasBankAccount) {
        console.log('Bank account missing or empty, redirecting to AccountBank');
        navigationRef.current?.navigate('AccountBank');
      } else {
        console.log('Bank account exists, no redirect needed');
      }
    }
  }, [isLoggedIn, user]);  // Phụ thuộc vào isLoggedIn và user để kiểm tra mỗi khi thông tin thay đổi

  // Tạo một useEffect riêng để xử lý lưu token khi user đăng nhập
  useEffect(() => {
    const saveTokenToBackend = async () => {
      if (isLoggedIn && user && expoPushToken) {
        // Chỉ log một lần khi cần thiết
        console.log('Need to save token to backend:', expoPushToken);
        // Gọi API để lưu token
        // await saveTokenToBackend(user.id, expoPushToken);
      }
    };

    saveTokenToBackend();
  }, [isLoggedIn, user, expoPushToken]);  // Chỉ chạy khi một trong các giá trị này thay đổi

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <ThemedStatusBar />
      <AppNavigator />
    </NavigationContainer>
  );
}

// Main component
export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ThemeProvider>
            <ThemedTailwindProvider>
              <AppContent />
              <Toast />
            </ThemedTailwindProvider>
          </ThemeProvider>
        </Provider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}