import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView
} from 'react-native';
import { useTheme } from '@/shared/theme';
import { ThemedText, ThemedCard } from '@/components';

// Predefined color themes
const colorThemes = {
  primary: [
    { name: "Green", value: "#22c55e" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" }
  ],
  secondary: [
    { name: "Gray", value: "#6C737F" },
    { name: "Slate", value: "#475569" },
    { name: "Cool Gray", value: "#64748b" },
    { name: "Warm Gray", value: "#57534e" },
    { name: "Dark Gray", value: "#374151" }
  ],
  accent: [
    { name: "Sky Blue", value: "#2E90FA" },
    { name: "Violet", value: "#7c3aed" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Amber", value: "#f59e0b" }
  ],
  background: [
    { name: "White", value: "#FFFFFF" },
    { name: "Light Gray", value: "#f9fafb" },
    { name: "Light Blue", value: "#f1f5f9" },
    { name: "Warm White", value: "#f5f5f4" },
    { name: "Cool White", value: "#f8fafc" }
  ],
  card: [
    { name: "Off White", value: "#F5F5F5" },
    { name: "Pale Blue", value: "#f1f5f9" },
    { name: "Soft Gray", value: "#f3f4f6" },
    { name: "Warm White", value: "#f5f5f4" },
    { name: "Pure White", value: "#FFFFFF" }
  ],
  text: [
    { name: "Dark Gray", value: "#333333" },
    { name: "Almost Black", value: "#1e293b" },
    { name: "Navy", value: "#0f172a" },
    { name: "Charcoal", value: "#1f2937" },
    { name: "Pure Black", value: "#000000" }
  ]
};

// Demo UI elements for different color themes
const ThemeExample = ({ colors }) => {
  return (
    <View style={styles.themeExample}>
      {/* Header Example */}
      <View style={[styles.exampleHeader, { backgroundColor: colors.primary }]}>
        <ThemedText style={styles.exampleHeaderText}>Header Example</ThemedText>
      </View>
      
      {/* Card Example */}
      <View style={[styles.exampleCard, { backgroundColor: colors.card, borderColor: colors.border || '#E1E1E1' }]}>
        <ThemedText style={[styles.exampleTitle, { color: colors.text }]}>Card Title</ThemedText>
        <ThemedText style={[styles.exampleText, { color: colors.text }]}>This is sample content with text styling.</ThemedText>
        
        {/* Button Example */}
        <View style={[styles.exampleButton, { backgroundColor: colors.primary }]}>
          <ThemedText style={styles.exampleButtonText}>Button</ThemedText>
        </View>
        
        {/* Link Example */}
        <ThemedText style={[styles.exampleLink, { color: colors.accent }]}>Link Example</ThemedText>
      </View>
    </View>
  );
};

/**
 * A simplified color picker with predefined themes and live preview
 */
const SimplifiedColorPicker = ({ 
  colorType,
  value,
  onChange,
  label
}) => {
  const { theme } = useTheme();
  const colors = colorThemes[colorType] || colorThemes.primary;
  
  // Create preview theme with current selection
  const previewTheme = {
    primary: colorType === 'primary' ? value : theme.primary,
    secondary: colorType === 'secondary' ? value : theme.secondary,
    accent: colorType === 'accent' ? value : theme.accent,
    background: colorType === 'background' ? value : theme.background,
    card: colorType === 'card' ? value : theme.card,
    text: colorType === 'text' ? value : theme.text,
    border: theme.border
  };
  
  // Dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      marginBottom: 12,
      color: theme.textSecondary || theme.text,
      fontWeight: '500',
    },
    colorsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    colorOption: {
      width: '18%',
      borderRadius: 8,
      padding: 2,
      marginBottom: 10,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedColorOption: {
      borderColor: theme.primary,
    },
    colorSwatch: {
      height: 40,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorName: {
      textAlign: 'center',
      fontSize: 12,
      marginTop: 4,
      color: theme.text,
    },
    previewContainer: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      overflow: 'hidden',
    }
  });
  
  return (
    <View style={dynamicStyles.container}>
      {label && (
        <ThemedText style={dynamicStyles.label}>{label}</ThemedText>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.colorsScrollContent}
      >
        {colors.map((color, index) => (
          <TouchableOpacity
            key={`${colorType}-${index}`}
            style={[
              dynamicStyles.colorOption,
              value === color.value && dynamicStyles.selectedColorOption
            ]}
            onPress={() => onChange(color.value)}
          >
            <View style={[dynamicStyles.colorSwatch, { backgroundColor: color.value }]}>
              {value === color.value && (
                <View style={styles.checkmark}>
                  <ThemedText style={styles.checkmarkText}>✓</ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={dynamicStyles.colorName}>{color.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={dynamicStyles.previewContainer}>
        <ThemeExample colors={previewTheme} />
      </View>
    </View>
  );
};

// Static styles
const styles = StyleSheet.create({
  colorsScrollContent: {
    paddingBottom: 8,
    paddingRight: 16,
    gap: 16,
  },
  checkmark: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  themeExample: {
    padding: 8,
  },
  exampleHeader: {
    padding: 12,
    borderTopLeftRadius: 8, 
    borderTopRightRadius: 8,
  },
  exampleHeaderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  exampleCard: {
    padding: 12,
    borderWidth: 1,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    marginBottom: 12,
  },
  exampleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    width: 100,
    marginBottom: 12,
  },
  exampleButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  exampleLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});

export default SimplifiedColorPicker;