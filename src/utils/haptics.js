let Haptics;

try {
    Haptics = require('expo-haptics');
} catch (error) {
    // Fallback if expo-haptics is not available
    Haptics = {
        selectionAsync: () => Promise.resolve(),
        notificationAsync: () => Promise.resolve(),
        impactAsync: () => Promise.resolve(),
        NotificationFeedbackType: {
            Success: 'success',
            Warning: 'warning',
            Error: 'error'
        },
        ImpactFeedbackStyle: {
            Light: 'light',
            Medium: 'medium',
            Heavy: 'heavy'
        }
    };
}

export const hapticFeedback = {
    // Light impact for selection
    selection: () => {
        Haptics.selectionAsync();
    },
    
    // Light impact for success actions
    success: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    
    // Warning feedback
    warning: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    },
    
    // Error feedback
    error: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    
    // Light tap
    light: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    
    // Medium tap
    medium: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    
    // Heavy tap
    heavy: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
};