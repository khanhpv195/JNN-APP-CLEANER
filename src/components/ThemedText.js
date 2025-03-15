import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';

/**
 * A themed text component that automatically uses the current theme's text color.
 * This should be used throughout the app instead of the standard React Native Text component.
 */
const ThemedText = ({ 
  children, 
  style, 
  variant = 'body', 
  color,
  ...props 
}) => {
  const { theme } = useTheme();
  
  // Get the base style for the selected variant
  const baseStyle = textStyles[variant] || textStyles.body;
  
  // Apply the theme's text color and any custom styles
  const textStyle = [
    baseStyle,
    { color: color || theme.text },
    style
  ];
  
  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
};

// Text variants that can be used throughout the app
const createTextStyles = () => {
  return StyleSheet.create({
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    body: {
      fontSize: 16,
    },
    bodySmall: {
      fontSize: 14,
    },
    caption: {
      fontSize: 12,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
    },
  });
};

const textStyles = createTextStyles();

export default ThemedText;