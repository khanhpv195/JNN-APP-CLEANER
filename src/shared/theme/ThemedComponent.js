import React from 'react';
import { useTheme } from './index';
import { StyleSheet } from 'react-native';

/**
 * Higher-order component that provides theme-aware styling to components
 * @param {React.Component} Component The component to wrap with theme capabilities
 * @returns {React.Component} A themed version of the component
 */
export const withTheme = (Component) => {
  return (props) => {
    const { theme } = useTheme();
    return <Component {...props} theme={theme} />;
  };
};

/**
 * Creates themed styles based on the current theme
 * @param {Function} styleCreator A function that takes theme as an argument and returns StyleSheet
 * @returns {Object} StyleSheet object with theme-aware styles
 */
export const createThemedStyles = (styleCreator) => {
  return () => {
    const { theme } = useTheme();
    return styleCreator(theme);
  };
};

/**
 * Hook to create themed styles on the fly
 * @param {Function} styleCreator A function that takes theme as an argument and returns StyleSheet
 * @returns {Object} StyleSheet object with theme-aware styles
 */
export const useThemedStyles = (styleCreator) => {
  const { theme } = useTheme();
  return React.useMemo(() => {
    try {
      // First attempt to use it as a function
      if (typeof styleCreator === 'function') {
        return StyleSheet.create(styleCreator(theme));
      }
      // If it's not a function, use it directly as an object
      return styleCreator;
    } catch (error) {
      console.error('Error in useThemedStyles:', error);
      // Return the original styles as a fallback
      return styleCreator;
    }
  }, [theme, styleCreator]);
};

/**
 * Common styles that can be reused across components
 * @param {Object} theme Current theme object
 * @returns {Object} Common themed styles
 */
export const commonStyles = (theme) => ({
  // Containers
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
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
  },
  
  // Text
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary || theme.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: theme.text,
  },
  
  // Buttons
  primaryButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Headers
  header: {
    backgroundColor: theme.primary,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  // Inputs
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.background,
    color: theme.text,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: theme.textSecondary || theme.text,
  },
  
  // Lists
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  
  // Separators
  separator: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 8,
  },
});