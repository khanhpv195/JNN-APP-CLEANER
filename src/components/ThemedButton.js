import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/shared/theme';
import ThemedText from './ThemedText';

/**
 * A themed button component that uses the current theme colors
 */
const ThemedButton = ({ 
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}) => {
  const { theme } = useTheme();
  
  // Get base styles based on variant and size
  const baseStyle = [
    styles.button,
    styles[size],
    getVariantStyle(variant, theme),
    disabled && getDisabledStyle(variant, theme),
    style,
  ];
  
  // Get text color based on variant
  const textColor = getTextColor(variant, theme, disabled);
  
  return (
    <TouchableOpacity
      style={baseStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {leftIcon && !loading && leftIcon}
      
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={textColor} 
          style={styles.loadingIndicator}
        />
      ) : (
        <ThemedText 
          style={[styles.buttonText, styles[`${size}Text`], { color: textColor }, textStyle]}
        >
          {title}
        </ThemedText>
      )}
      
      {rightIcon && !loading && rightIcon}
    </TouchableOpacity>
  );
};

// Helper function to get button style based on variant
const getVariantStyle = (variant, theme) => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
      };
    case 'secondary':
      return {
        backgroundColor: 'transparent',
        borderColor: theme.primary,
        borderWidth: 1,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderColor: theme.border,
        borderWidth: 1,
      };
    case 'text':
      return {
        backgroundColor: 'transparent',
        paddingHorizontal: 4,
      };
    case 'danger':
      return {
        backgroundColor: theme.error || '#FF3B30',
        borderColor: theme.error || '#FF3B30',
      };
    default:
      return {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
      };
  }
};

// Helper function to get disabled style based on variant
const getDisabledStyle = (variant, theme) => {
  const baseStyle = { opacity: 0.6 };
  
  if (variant === 'text' || variant === 'outline' || variant === 'secondary') {
    return {
      ...baseStyle,
      borderColor: theme.border,
    };
  }
  
  return baseStyle;
};

// Helper function to get text color based on variant
const getTextColor = (variant, theme, disabled) => {
  if (disabled) {
    return theme.textSecondary || '#666666';
  }
  
  switch (variant) {
    case 'primary':
      return '#FFFFFF';
    case 'secondary':
      return theme.primary;
    case 'outline':
      return theme.text;
    case 'text':
      return theme.primary;
    case 'danger':
      return '#FFFFFF';
    default:
      return '#FFFFFF';
  }
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  loadingIndicator: {
    marginHorizontal: 8,
  },
});

export default ThemedButton;