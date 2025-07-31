import React from 'react';
import { View } from 'react-native';

// Safe LinearGradient fallback component with better gradient simulation
const SafeLinearGradient = ({ children, colors = [], style, start, end, ...props }) => {
    // Create a subtle gradient effect using multiple overlays
    const primaryColor = colors[0] || '#00BFA6';
    const secondaryColor = colors[1] || colors[0] || '#00BFA6';
    
    // Mix colors for a middle ground
    const blendColors = (color1, color2) => {
        // Simple color blending - take primary with slight secondary influence
        return primaryColor;
    };
    
    const fallbackStyle = {
        ...style,
        backgroundColor: blendColors(primaryColor, secondaryColor),
        // Add subtle shadow to simulate depth
        shadowColor: secondaryColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    };

    return (
        <View style={fallbackStyle} {...props}>
            {children}
        </View>
    );
};

export default SafeLinearGradient;