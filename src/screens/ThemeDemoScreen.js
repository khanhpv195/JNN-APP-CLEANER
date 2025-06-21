import React from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/theme';
import { 
  ThemedText, 
  ThemedButton, 
  ThemedCard,
  Loading
} from '@/components';

/**
 * A screen to demonstrate all themed components in one place
 * This is useful for developers to see how the theme affects components
 */
export default function ThemeDemoScreen({ navigation }) {
  const { theme } = useTheme();
  
  // Create dynamic styles based on the current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.primary,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    section: {
      margin: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      color: theme.text,
      backgroundColor: theme.background,
    },
    colorBlock: {
      width: '100%',
      padding: 12,
      marginBottom: 8,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    colorText: {
      fontWeight: '600',
    },
  });
  
  // Helper to create color blocks to display theme colors
  const ColorBlock = ({ colorName, colorValue, textColor = '#FFF' }) => (
    <View style={[dynamicStyles.colorBlock, { backgroundColor: colorValue }]}>
      <ThemedText style={[dynamicStyles.colorText, { color: textColor }]}>
        {colorName}
      </ThemedText>
      <ThemedText style={[dynamicStyles.colorText, { color: textColor }]}>
        {colorValue}
      </ThemedText>
    </View>
  );
  
  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ padding: 8, marginRight: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <ThemedText style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
          Theme Demo
        </ThemedText>
      </View>
      
      <ScrollView>
        {/* Color Palette Section */}
        <View style={dynamicStyles.section}>
          <ThemedText variant="h3">Current Theme Colors</ThemedText>
          
          <View style={{ marginTop: 16 }}>
            <ColorBlock colorName="Primary" colorValue={theme.primary} />
            <ColorBlock colorName="Secondary" colorValue={theme.secondary} />
            <ColorBlock colorName="Accent" colorValue={theme.accent} />
            <ColorBlock 
              colorName="Background" 
              colorValue={theme.background} 
              textColor={theme.text} 
            />
            <ColorBlock 
              colorName="Card" 
              colorValue={theme.card} 
              textColor={theme.text} 
            />
            <ColorBlock 
              colorName="Text" 
              colorValue={theme.text} 
              textColor={theme.background} 
            />
            <ColorBlock 
              colorName="Border" 
              colorValue={theme.border} 
              textColor={theme.text} 
            />
            <ColorBlock colorName="Error" colorValue={theme.error || '#FF3B30'} />
            <ColorBlock colorName="Success" colorValue={theme.success || '#34C759'} />
          </View>
        </View>
        
        <View style={dynamicStyles.divider} />
        
        {/* Typography Section */}
        <View style={dynamicStyles.section}>
          <ThemedText variant="h3">Typography</ThemedText>
          
          <View style={{ marginTop: 16 }}>
            <ThemedText variant="h1">Heading 1</ThemedText>
            <ThemedText variant="h2">Heading 2</ThemedText>
            <ThemedText variant="h3">Heading 3</ThemedText>
            <ThemedText variant="h4">Heading 4</ThemedText>
            <ThemedText variant="body">Body Text - Lorem ipsum dolor sit amet</ThemedText>
            <ThemedText variant="bodySmall">Body Small - Lorem ipsum dolor sit amet</ThemedText>
            <ThemedText variant="caption">Caption - Lorem ipsum dolor sit amet</ThemedText>
          </View>
        </View>
        
        <View style={dynamicStyles.divider} />
        
        {/* Buttons Section */}
        <View style={dynamicStyles.section}>
          <ThemedText variant="h3">Buttons</ThemedText>
          
          <View style={{ marginTop: 16, gap: 12 }}>
            <ThemedButton title="Primary Button" variant="primary" />
            <ThemedButton title="Secondary Button" variant="secondary" />
            <ThemedButton title="Outline Button" variant="outline" />
            <ThemedButton title="Text Button" variant="text" />
            <ThemedButton title="Danger Button" variant="danger" />
            <ThemedButton title="Disabled Button" disabled />
            <ThemedButton title="Loading Button" loading />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedButton title="Small" size="small" />
              <ThemedButton title="Medium" size="medium" />
              <ThemedButton title="Large" size="large" />
            </View>
          </View>
        </View>
        
        <View style={dynamicStyles.divider} />
        
        {/* Cards Section */}
        <View style={dynamicStyles.section}>
          <ThemedText variant="h3">Cards</ThemedText>
          
          <View style={{ marginTop: 16, gap: 12 }}>
            <ThemedCard>
              <ThemedText variant="h4">Basic Card</ThemedText>
              <ThemedText>This is a basic card with the theme's card background.</ThemedText>
            </ThemedCard>
            
            <ThemedCard elevation={4}>
              <ThemedText variant="h4">Card with Elevation</ThemedText>
              <ThemedText>This card has more elevation/shadow.</ThemedText>
            </ThemedCard>
            
            <ThemedCard onPress={() => alert('Card Pressed')}>
              <ThemedText variant="h4">Touchable Card</ThemedText>
              <ThemedText>This card is touchable. Try pressing it!</ThemedText>
            </ThemedCard>
          </View>
        </View>
        
        <View style={dynamicStyles.divider} />
        
        {/* Form Elements */}
        <View style={dynamicStyles.section}>
          <ThemedText variant="h3">Form Elements</ThemedText>
          
          <View style={{ marginTop: 16 }}>
            <ThemedText style={{ marginBottom: 8 }}>Text Input</ThemedText>
            <TextInput 
              style={dynamicStyles.input}
              placeholder="Enter some text"
              placeholderTextColor={theme.textSecondary || '#999'}
            />
            
            <ThemedText style={{ marginBottom: 8, marginTop: 8 }}>Loading Indicator</ThemedText>
            <View style={{ height: 100 }}>
              <Loading />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}