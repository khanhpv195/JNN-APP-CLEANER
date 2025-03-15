import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

const NavigationService = {
    navigate(name, params) {
        if (navigationRef.isReady()) {
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
};

export default NavigationService; 