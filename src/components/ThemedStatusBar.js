import React from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '@/shared/theme';

/**
 * A themed status bar component that adapts to the current theme.
 * This ensures the status bar matches your app's theme colors.
 */
const ThemedStatusBar = () => {
  const { theme } = useTheme();
  
  // Calculate whether to use light or dark content based on the primary color brightness
  const isDarkColor = (color) => {
    // Convert hex to RGB
    let r, g, b;
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      if (hex.length === 3) {
        r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
        g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
        b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      } else {
        return true; // Default to dark
      }
    } else {
      return true; // Default to dark for non-hex colors
    }
    
    // Calculate perceived brightness
    // Formula: (R * 0.299 + G * 0.587 + B * 0.114) > 186
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    return brightness < 160; // Use a threshold of 160
  };
  
  const barStyle = isDarkColor(theme.primary) ? 'light-content' : 'dark-content';
  
  return (
    <StatusBar 
      backgroundColor={theme.primary} 
      barStyle={barStyle} 
      animated={true} 
    />
  );
};

export default ThemedStatusBar;