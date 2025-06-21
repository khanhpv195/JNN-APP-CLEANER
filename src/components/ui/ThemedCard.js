import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/theme';

/**
 * A themed card component that adapts to the current theme
 */
const ThemedCard = ({ 
  children, 
  style, 
  onPress, 
  elevation = 2,
  ...props 
}) => {
  const { theme } = useTheme();
  
  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.card,
      shadowColor: theme.text,
      borderColor: theme.border,
    },
    elevation && { elevation },
    style,
  ];
  
  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
});

export default ThemedCard;