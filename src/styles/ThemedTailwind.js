import React, { createContext, useContext, useMemo } from 'react';
import { useTheme } from '@/shared/theme';

// Create a context for themed Tailwind classes
const ThemedTailwindContext = createContext({
  tw: {},
});

/**
 * Provider that creates dynamic Tailwind class mappings based on the current theme
 */
export const ThemedTailwindProvider = ({ children }) => {
  const { theme } = useTheme();
  
  // Create a mapping of themed Tailwind classes
  const themedClasses = useMemo(() => {
    return {
      // Background classes
      'bg-primary': { backgroundColor: theme.primary },
      'bg-secondary': { backgroundColor: theme.secondary },
      'bg-accent': { backgroundColor: theme.accent },
      'bg-background': { backgroundColor: theme.background },
      'bg-card': { backgroundColor: theme.card },
      'bg-error': { backgroundColor: theme.error || '#FF3B30' },
      'bg-success': { backgroundColor: theme.success || '#34C759' },
      'bg-warning': { backgroundColor: theme.warning || '#FFCC00' },
      'bg-info': { backgroundColor: theme.info || '#007AFF' },
      
      // Text classes
      'text-primary': { color: theme.primary },
      'text-secondary': { color: theme.secondary },
      'text-accent': { color: theme.accent },
      'text-default': { color: theme.text },
      'text-muted': { color: theme.textSecondary || '#666666' },
      'text-error': { color: theme.error || '#FF3B30' },
      'text-success': { color: theme.success || '#34C759' },
      'text-white': { color: '#FFFFFF' },
      
      // Border classes
      'border-primary': { borderColor: theme.primary },
      'border-secondary': { borderColor: theme.secondary },
      'border-accent': { borderColor: theme.accent },
      'border-default': { borderColor: theme.border },
    };
  }, [theme]);
  
  return (
    <ThemedTailwindContext.Provider value={{ tw: themedClasses }}>
      {children}
    </ThemedTailwindContext.Provider>
  );
};

/**
 * Hook to access the themed Tailwind classes
 * @returns {Object} An object with the 'tw' property containing themed class mappings
 */
export const useThemedTailwind = () => useContext(ThemedTailwindContext);

/**
 * Helper function that merges regular styles with themed Tailwind classes
 * @param {Array|Object} styles Regular style objects
 * @param {Array} twClasses Array of Tailwind class names (e.g. ['bg-primary', 'text-white'])
 * @returns {Array} Merged style array
 */
export const withThemedTailwind = (styles, twClasses = []) => {
  const { tw } = useThemedTailwind();
  
  const themedStyles = twClasses
    .map(className => tw[className])
    .filter(Boolean);
    
  if (Array.isArray(styles)) {
    return [...styles, ...themedStyles];
  }
  
  return [styles, ...themedStyles];
};