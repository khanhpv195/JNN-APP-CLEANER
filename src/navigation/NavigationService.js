import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

const NavigationService = {
    navigate(name, params) {
        if (navigationRef.isReady()) {
            // Check if we're already on this screen to prevent navigation loops
            const currentRouteName = this.getCurrentRoute();
            if (currentRouteName === name) {
                console.log(`Already on ${name} screen, preventing navigation loop`);
                return;
            }
            navigationRef.navigate(name, params);
        }
    },

    reset(name, params) {
        if (navigationRef.isReady()) {
            navigationRef.reset({
                index: 0,
                routes: [{ name, params }],
            });
        }
    },

    goBack() {
        if (navigationRef.isReady() && navigationRef.canGoBack()) {
            navigationRef.goBack();
        }
    },
    
    getCurrentRoute() {
        if (navigationRef.isReady()) {
            console.log("Current route: ", navigationRef.getCurrentRoute()?.name);
            return navigationRef.getCurrentRoute()?.name;
        }
        return null;
    },
};

export default NavigationService; 