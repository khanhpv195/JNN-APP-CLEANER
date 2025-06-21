import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/components';

// Predefined color palettes
const colorPalettes = {
  primary: [
    '#22c55e', // Default green
    '#0ea5e9', // Sky blue
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#14b8a6', // Teal
  ],
  neutral: [
    '#6C737F', // Default neutral
    '#475569', // Slate
    '#4b5563', // Gray
    '#52525b', // Zinc
    '#71717a', // Neutral gray
    '#525252', // Stone
    '#57534e', // Warm gray
    '#64748b', // Cool gray
    '#334155', // Blue gray
    '#374151', // True gray
  ],
  dark: [
    '#333333', // Default dark
    '#1e293b', // Slate
    '#1f2937', // Gray
    '#18181b', // Zinc
    '#27272a', // Neutral
    '#1c1917', // Stone
    '#292524', // Warm gray
    '#0f172a', // Blue gray
    '#111827', // True gray
    '#0f172a', // Dark blue
  ],
  light: [
    '#FFFFFF', // White
    '#f8fafc', // Slate
    '#f9fafb', // Gray
    '#fafafa', // Zinc
    '#f5f5f5', // Neutral
    '#f5f5f4', // Stone
    '#f7f7f7', // Light gray
    '#f1f5f9', // Light blue gray
    '#f3f4f6', // Light true gray
    '#f8f9fa', // Off white
  ],
  accent: [
    '#2E90FA', // Default blue
    '#3b82f6', // Blue
    '#f43f5e', // Rose
    '#d946ef', // Fuchsia
    '#a855f7', // Purple
    '#0284c7', // Light blue
    '#0891b2', // Cyan
    '#0d9488', // Teal
    '#2563eb', // Royal blue
    '#7c3aed', // Violet
  ],
};

/**
 * Color picker component with predefined palettes
 * and hex input for custom colors
 */
const ColorPicker = ({ 
  value, 
  onChange, 
  paletteType = 'primary',
  label,
  showHexInput = true
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [hexValue, setHexValue] = useState(value || colorPalettes[paletteType][0]);
  const [customPalette, setCustomPalette] = useState(colorPalettes[paletteType] || colorPalettes.primary);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Validate hex color code
  const isValidHexColor = (color) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  };
  
  // Handle custom color input
  const handleHexChange = (text) => {
    // Auto-add # prefix if missing
    let formattedText = text;
    if (text && !text.startsWith('#')) {
      formattedText = `#${text}`;
    }
    
    setHexValue(formattedText);
    
    // Clear error when user is typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };
  
  // Apply color and close modal
  const applyColor = (color) => {
    // Validate the color
    if (isValidHexColor(color)) {
      onChange(color);
      setModalVisible(false);
      setErrorMessage('');
    } else {
      setErrorMessage('Please enter a valid hex color (e.g., #FF5500)');
    }
  };
  
  // Apply custom hex color
  const applyHexColor = () => {
    if (isValidHexColor(hexValue)) {
      onChange(hexValue);
      
      // Add to custom palette if not already there
      if (!customPalette.includes(hexValue)) {
        // Remove the last color and add new one at beginning
        const newPalette = [hexValue, ...customPalette.slice(0, -1)];
        setCustomPalette(newPalette);
      }
      
      setModalVisible(false);
      setErrorMessage('');
    } else {
      setErrorMessage('Please enter a valid hex color (e.g., #FF5500)');
    }
  };
  
  // Handle color selection from palette
  const handleColorSelection = (color) => {
    setHexValue(color);
    onChange(color);
    setModalVisible(false);
  };
  
  // Dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.textSecondary || theme.text,
    },
    colorPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      backgroundColor: theme.card,
      padding: 12,
    },
    colorSwatch: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 12,
      backgroundColor: value || colorPalettes[paletteType][0],
    },
    colorText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxWidth: 400,
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      maxHeight: Dimensions.get('window').height * 0.8,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    closeButton: {
      padding: 8,
    },
    palettesContainer: {
      marginBottom: 20,
    },
    paletteRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    colorOption: {
      width: '18%',
      aspectRatio: 1,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    selectedColorOption: {
      borderWidth: 2,
      borderColor: theme.primary,
    },
    hexInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    hexInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme.background,
      color: theme.text,
      marginRight: 10,
    },
    applyButton: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
    applyButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    errorText: {
      color: theme.error || '#FF3B30',
      marginTop: 5,
    },
    paletteTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
      marginTop: 12,
    },
  });
  
  return (
    <View style={dynamicStyles.container}>
      {label && (
        <ThemedText style={dynamicStyles.label}>{label}</ThemedText>
      )}
      
      <TouchableOpacity 
        style={dynamicStyles.colorPreview}
        onPress={() => setModalVisible(true)}
      >
        <View 
          style={[
            dynamicStyles.colorSwatch,
            { backgroundColor: value || colorPalettes[paletteType][0] }
          ]} 
        />
        <ThemedText style={dynamicStyles.colorText}>
          {value || colorPalettes[paletteType][0]}
        </ThemedText>
        <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={dynamicStyles.modalContainer}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <ThemedText style={dynamicStyles.modalTitle}>Choose Color</ThemedText>
              <TouchableOpacity 
                style={dynamicStyles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={dynamicStyles.palettesContainer}>
                {/* Primary Colors */}
                <ThemedText style={dynamicStyles.paletteTitle}>Primary Colors</ThemedText>
                <View style={dynamicStyles.paletteRow}>
                  {colorPalettes.primary.map((color, index) => (
                    <TouchableOpacity
                      key={`primary-${index}`}
                      style={[
                        dynamicStyles.colorOption,
                        { backgroundColor: color },
                        value === color && dynamicStyles.selectedColorOption
                      ]}
                      onPress={() => handleColorSelection(color)}
                    />
                  ))}
                </View>
                
                {/* Accent Colors */}
                <ThemedText style={dynamicStyles.paletteTitle}>Accent Colors</ThemedText>
                <View style={dynamicStyles.paletteRow}>
                  {colorPalettes.accent.map((color, index) => (
                    <TouchableOpacity
                      key={`accent-${index}`}
                      style={[
                        dynamicStyles.colorOption,
                        { backgroundColor: color },
                        value === color && dynamicStyles.selectedColorOption
                      ]}
                      onPress={() => handleColorSelection(color)}
                    />
                  ))}
                </View>
                
                {/* Neutral Colors */}
                <ThemedText style={dynamicStyles.paletteTitle}>Neutral Colors</ThemedText>
                <View style={dynamicStyles.paletteRow}>
                  {colorPalettes.neutral.map((color, index) => (
                    <TouchableOpacity
                      key={`neutral-${index}`}
                      style={[
                        dynamicStyles.colorOption,
                        { backgroundColor: color },
                        value === color && dynamicStyles.selectedColorOption
                      ]}
                      onPress={() => handleColorSelection(color)}
                    />
                  ))}
                </View>
                
                {/* Light Colors */}
                <ThemedText style={dynamicStyles.paletteTitle}>Light Colors</ThemedText>
                <View style={dynamicStyles.paletteRow}>
                  {colorPalettes.light.map((color, index) => (
                    <TouchableOpacity
                      key={`light-${index}`}
                      style={[
                        dynamicStyles.colorOption,
                        { backgroundColor: color },
                        { borderColor: theme.border },
                        value === color && dynamicStyles.selectedColorOption
                      ]}
                      onPress={() => handleColorSelection(color)}
                    />
                  ))}
                </View>
                
                {/* Dark Colors */}
                <ThemedText style={dynamicStyles.paletteTitle}>Dark Colors</ThemedText>
                <View style={dynamicStyles.paletteRow}>
                  {colorPalettes.dark.map((color, index) => (
                    <TouchableOpacity
                      key={`dark-${index}`}
                      style={[
                        dynamicStyles.colorOption,
                        { backgroundColor: color },
                        value === color && dynamicStyles.selectedColorOption
                      ]}
                      onPress={() => handleColorSelection(color)}
                    />
                  ))}
                </View>
              </View>
              
              {/* Custom Hex Input */}
              {showHexInput && (
                <>
                  <ThemedText style={dynamicStyles.paletteTitle}>Custom Color</ThemedText>
                  <View style={dynamicStyles.hexInputContainer}>
                    <TextInput
                      style={dynamicStyles.hexInput}
                      value={hexValue}
                      onChangeText={handleHexChange}
                      placeholder="#RRGGBB"
                      placeholderTextColor={theme.textSecondary}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={dynamicStyles.applyButton}
                      onPress={applyHexColor}
                    >
                      <ThemedText style={dynamicStyles.applyButtonText}>Apply</ThemedText>
                    </TouchableOpacity>
                  </View>
                  
                  {errorMessage ? (
                    <ThemedText style={dynamicStyles.errorText}>{errorMessage}</ThemedText>
                  ) : null}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ColorPicker;