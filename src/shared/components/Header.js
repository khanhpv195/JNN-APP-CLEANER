import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/components';

/**
 * A reusable themed header component that can be used across all screens
 * @param {string} title - The title to display in the header
 * @param {function} onBack - Function to call when the back button is pressed
 * @param {React.ReactNode} rightComponent - Optional component to display on the right side
 * @param {boolean} transparent - Whether the header should be transparent
 */
const Header = ({ 
  title, 
  onBack, 
  rightComponent, 
  transparent = false 
}) => {
  const { theme } = useTheme();
  
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: transparent ? 'transparent' : theme.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
      paddingHorizontal: 16,
      borderBottomWidth: transparent ? 0 : 1,
      borderBottomColor: transparent ? 'transparent' : theme.border,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: transparent ? theme.text : '#FFFFFF',
    },
    backButton: {
      padding: 8,
    },
    backIcon: {
      color: transparent ? theme.text : '#FFFFFF',
    },
    rightContainer: {
      width: 40,
      alignItems: 'flex-end',
    }
  });
  
  return (
    <View style={dynamicStyles.container}>
      {onBack ? (
        <TouchableOpacity 
          style={dynamicStyles.backButton} 
          onPress={onBack}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={dynamicStyles.backIcon.color} 
          />
        </TouchableOpacity>
      ) : (
        <View style={dynamicStyles.rightContainer} />
      )}
      
      <ThemedText style={dynamicStyles.title}>{title}</ThemedText>
      
      {rightComponent ? (
        rightComponent
      ) : (
        <View style={dynamicStyles.rightContainer} />
      )}
    </View>
  );
};

export default Header;