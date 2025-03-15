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
            state.isLoggedIn = true;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
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
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions;

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
        const accessToken = await AsyncStorage.getItem('accessToken');
        const userString = await AsyncStorage.getItem('user');

        if (accessToken && userString) {
            const user = JSON.parse(userString);
            dispatch(loginSuccess({ user, accessToken }));
        }
    } catch (error) {
        console.error('Error checking auth state:', error);
    }
};

export default authSlice.reducer; 