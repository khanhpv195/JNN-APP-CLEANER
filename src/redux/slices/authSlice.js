import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authenticationApis from './../../shared/api/authenticationApis';

const initialState = {
    isLoggedIn: false,
    user: null,
    accessToken: null,
    loading: false,
    error: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            console.log("Redux: loginSuccess action with payload:", action.payload);
            state.isLoggedIn = true;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken || action.payload.access_token;
            state.loading = false;
            state.error = null;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
            state.accessToken = null;
            AsyncStorage.multiRemove(['accessToken', 'user']);
        },
        updateUser: (state, action) => {
            state.user = action.payload;
        },
        handleSessionExpired: (state) => {
            state.isLoggedIn = false;
            state.user = null;
            state.accessToken = null;
            // Only clear AsyncStorage here, let the fetch.js handle navigation
            AsyncStorage.multiRemove(['accessToken', 'user']);
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, handleSessionExpired } = authSlice.actions;

export const loginUser = (credentials) => async (dispatch) => {
    try {
        dispatch(loginStart());

        // If device information is provided, use loginWithDevice
        if (credentials.device) {
            const response = await authenticationApis.loginWithDevice({
                username: credentials.email,
                password: credentials.password,
                device: credentials.device,
                keepLoggedIn: credentials.keepLoggedIn !== false
            });

            console.log('response', response)
            // Lưu vào AsyncStorage
            await AsyncStorage.setItem('accessToken', response.access_token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            dispatch(loginSuccess(response));
        } else {
            // Regular login without device info
            const response = await authenticationApis.login({
                username: credentials.email,
                password: credentials.password
            });

            // Lưu vào AsyncStorage
            await AsyncStorage.setItem('accessToken', response.access_token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            dispatch(loginSuccess(response));
        }
    } catch (error) {
        dispatch(loginFailure(error.message));
    }
};

// Thunk action để kiểm tra trạng thái đăng nhập từ AsyncStorage
export const checkAuthState = () => async (dispatch) => {
    try {
        console.log("Checking auth state from AsyncStorage");
        const accessToken = await AsyncStorage.getItem('accessToken');
        const userString = await AsyncStorage.getItem('user');

        if (accessToken && userString) {
            try {
                const user = JSON.parse(userString);
                console.log("Found saved credentials, restoring session");
                dispatch(loginSuccess({ user, accessToken }));
                return true; // Trả về true nếu đăng nhập thành công
            } catch (parseError) {
                console.error('Error parsing user data:', parseError);
                dispatch(logout());
                return false;
            }
        } else {
            // Nếu không có token hoặc user, đảm bảo trạng thái là đã logout
            console.log("No saved credentials found");
            dispatch(logout());
            return false;
        }
    } catch (error) {
        console.error('Error checking auth state:', error);
        // Trong trường hợp lỗi, đảm bảo trạng thái là đã logout
        dispatch(logout());
        return false;
    }
};

// Thunk action để xử lý logout khi phiên hết hạn
export const handleExpiredSession = () => async (dispatch) => {
    try {
        // Xóa dữ liệu từ AsyncStorage
        await AsyncStorage.multiRemove(['accessToken', 'user']);
        // Cập nhật trạng thái Redux
        dispatch(logout());
    } catch (error) {
        console.error('Error handling session expiration:', error);
        // Đảm bảo trạng thái là đã logout ngay cả khi có lỗi
        dispatch(logout());
    }
};

export default authSlice.reducer; 