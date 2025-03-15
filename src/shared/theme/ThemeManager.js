import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { Colors } from '../constants/colors';

// Default theme - uses the values from Colors
const defaultTheme = {
  colors: {
    primary: Colors.primary,
    secondary: Colors.neutral,
    accent: Colors.blue,
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E1E1E1',
    error: '#FF3B30',
    warning: '#FFCC00',
    success: '#34C759',
    info: '#007AFF',
  },
  
  // Backwards compatibility
  primary: Colors.primary,
  secondary: Colors.neutral,
  accent: Colors.blue,
  background: '#FFFFFF',
  card: '#F5F5F5',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E1E1E1',
  error: '#FF3B30',
  warning: '#FFCC00',
  success: '#34C759',
  info: '#007AFF',
};

// Create theme context
export const ThemeContext = createContext({
  theme: defaultTheme,
  setTheme: () => {},
  updateThemeColors: () => {},
  resetTheme: () => {},
  updateTailwindConfig: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// Save theme to AsyncStorage
const saveTheme = async (theme) => {
  try {
    await AsyncStorage.setItem('APP_THEME', JSON.stringify(theme));
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

// Provider component to wrap your app
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('APP_THEME');
        if (savedTheme) {
          setTheme(JSON.parse(savedTheme));
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Update specific colors in the theme
  const updateThemeColors = (newColors) => {
    // Update both direct properties and colors object
    const updatedTheme = { 
      ...theme, 
      ...newColors,
      colors: {
        ...theme.colors,
        ...newColors
      }
    };
    
    setTheme(updatedTheme);
    saveTheme(updatedTheme);
    
    // Also update global Colors object to ensure compatibility
    if (newColors.primary) Colors.primary = newColors.primary;
    if (newColors.secondary) Colors.neutral = newColors.secondary;
    if (newColors.accent) Colors.blue = newColors.accent;
    
    // Update Tailwind config if possible
    updateTailwindConfig(updatedTheme);
  };

  // Reset theme to default
  const resetTheme = () => {
    setTheme(defaultTheme);
    saveTheme(defaultTheme);
    
    // Reset Colors global object
    Colors.primary = defaultTheme.primary;
    Colors.neutral = defaultTheme.secondary;
    Colors.blue = defaultTheme.accent;
    
    // Reset Tailwind
    updateTailwindConfig(defaultTheme);
  };
  
  // Update Tailwind config with new theme values
  // NOTE: This can't actually modify the Tailwind config at runtime
  // but we include it for potential future updates that might support this
  const updateTailwindConfig = (newTheme) => {
    // In a real implementation, you'd need to use a runtime approach
    // that can modify Tailwind classes dynamically
    // This might involve using a library that supports runtime themes
    console.log('Theme updated. Tailwind config would be updated here in a production app.');
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        updateThemeColors,
        resetTheme,
        updateTailwindConfig,
        isLoading 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};