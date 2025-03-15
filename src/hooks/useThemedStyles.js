import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';

/**
 * A hook to create dynamically themed styles
 * This helps components use theme-based styling without repeating code
 * 
 * @param {Function} styleCreator - A function that takes theme and returns styles
 * @param {Array} deps - Additional dependencies that should trigger style recalculation
 * @returns {Object} StyleSheet object with theme-aware styles
 * 
 * @example
 * // Usage in a component:
 * const styles = useThemedStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.background,
 *   },
 *   text: {
 *     color: theme.text,
 *   }
 * }));
 */
export const useThemedStyles = (styleCreator, deps = []) => {
  const { theme } = useTheme();
  
  return useMemo(() => {
    return StyleSheet.create(styleCreator(theme));
  }, [theme, styleCreator, ...deps]);
};

/**
 * Common styles that can be used across the app
 */
export const useCommonStyles = () => {
  const { theme } = useTheme();
  
  return useMemo(() => StyleSheet.create({
    // Screen containers
    screenContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    
    // Content containers
    contentContainer: {
      flex: 1,
      padding: 16,
    },
    
    // Cards
    card: {
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    
    // Typography
    heading1: {
      fontSize: 28,
      fontWeight: 'bold', 
      color: theme.text,
      marginBottom: 16,
    },
    heading2: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    heading3: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    heading4: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    bodyText: {
      fontSize: 16,
      color: theme.text,
    },
    captionText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    
    // Dividers
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 16,
    },
    
    // Forms
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.textSecondary,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme.card,
      color: theme.text,
    },
    
    // Buttons
    buttonPrimary: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    buttonTextSecondary: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary,
    },
  }), [theme]);
};

export default useThemedStyles;