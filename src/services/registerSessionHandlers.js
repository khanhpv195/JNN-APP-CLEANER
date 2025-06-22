import { handleSessionExpired } from '../redux/slices/authSlice';
import { store } from '../redux/store';
import { registerSessionExpirationCallback } from './sessionService';

// This file connects the sessionService with Redux
// It's imported in the app's entry point after store is initialized

export const initializeSessionHandlers = () => {
  // Register the Redux action to be called when session expires
  registerSessionExpirationCallback(() => {
    store.dispatch(handleSessionExpired());
    console.log('Session expired action dispatched to Redux store');
  });
  
  console.log('Session handlers initialized');
}; 