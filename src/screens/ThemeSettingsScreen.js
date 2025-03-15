import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert,
  Switch 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/theme';
import { SimplifiedColorPicker } from '@/components';
import { useTranslation } from 'react-i18next';

export default function ThemeSettingsScreen({ navigation }) {
  const { theme, updateThemeColors, resetTheme } = useTheme();
  const { t } = useTranslation();
  
  // Theme color state
  const [primaryColor, setPrimaryColor] = useState(theme.primary);
  const [secondaryColor, setSecondaryColor] = useState(theme.secondary);
  const [accentColor, setAccentColor] = useState(theme.accent);
  const [backgroundColor, setBackgroundColor] = useState(theme.background);
  const [cardColor, setCardColor] = useState(theme.card);
  const [textColor, setTextColor] = useState(theme.text);
  
  // Dark mode switch
  const [darkMode, setDarkMode] = useState(false);

  // Update state when theme changes
  useEffect(() => {
    setPrimaryColor(theme.primary);
    setSecondaryColor(theme.secondary);
    setAccentColor(theme.accent);
    setBackgroundColor(theme.background);
    setCardColor(theme.card);
    setTextColor(theme.text);
  }, [theme]);

  const handleSaveTheme = () => {
    // Validate colors before saving
    if (!isValidHexColor(primaryColor) || 
        !isValidHexColor(secondaryColor) || 
        !isValidHexColor(accentColor) || 
        !isValidHexColor(backgroundColor) ||
        !isValidHexColor(cardColor) ||
        !isValidHexColor(textColor)) {
      Alert.alert(
        "Invalid Color Format",
        "Please enter valid hex colors (e.g., #FF5500)",
        [{ text: "OK" }]
      );
      return;
    }

    // Update theme with new colors
    updateThemeColors({
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      background: backgroundColor,
      card: cardColor,
      text: textColor
    });

    Alert.alert(
      "Theme Updated",
      "Your theme changes have been saved.",
      [{ text: "OK" }]
    );
  };

  const handleResetTheme = () => {
    Alert.alert(
      "Reset Theme",
      "Are you sure you want to reset the theme to default?",
      [
        { text: t('common.cancel'), style: "cancel" },
        { 
          text: "Reset", 
          onPress: () => {
            resetTheme();
            Alert.alert("Theme Reset", "Theme has been reset to default values.");
          } 
        }
      ]
    );
  };

  // Theme validation function
  const isValidHexColor = (color) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  };

  // Dynamic styles based on current theme
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
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    section: {
      backgroundColor: theme.card,
      margin: 16,
      borderRadius: 8,
      padding: 16,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      color: theme.text,
    },
    button: {
      backgroundColor: theme.primary,
      margin: 16,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '600',
    },
    resetButton: {
      backgroundColor: theme.error || '#FF3B30',
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    switchLabel: {
      fontSize: 16,
      color: theme.text,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>{t('settings.themeSettings')}</Text>
        <View style={styles.rightHeaderPlaceholder} />
      </View>

      <ScrollView>
        {/* Theme Settings Section */}
        <View style={dynamicStyles.section}>
          {/* Dark Mode Toggle - for future implementation */}
          <View style={dynamicStyles.switchContainer}>
            <Text style={dynamicStyles.switchLabel}>{t('settings.darkMode')} ({t('settings.comingSoon')})</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              disabled={true} // Disabled for now
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor={darkMode ? theme.accent : '#f4f3f4'}
            />
          </View>
          
          <SimplifiedColorPicker
            label={t('theme.primaryColor')}
            value={primaryColor}
            onChange={setPrimaryColor}
            colorType="primary"
          />
          
          <SimplifiedColorPicker
            label={t('theme.secondaryColor')}
            value={secondaryColor}
            onChange={setSecondaryColor}
            colorType="secondary"
          />
          
          <SimplifiedColorPicker
            label={t('theme.accentColor')}
            value={accentColor}
            onChange={setAccentColor}
            colorType="accent"
          />
          
          <SimplifiedColorPicker
            label={t('theme.backgroundColor')}
            value={backgroundColor}
            onChange={setBackgroundColor}
            colorType="background"
          />
          
          <SimplifiedColorPicker
            label={t('theme.cardColor')}
            value={cardColor}
            onChange={setCardColor}
            colorType="card"
          />
          
          <SimplifiedColorPicker
            label={t('theme.textColor')}
            value={textColor}
            onChange={setTextColor}
            colorType="text"
          />
          
          {/* Theme Save Button */}
          <TouchableOpacity
            style={dynamicStyles.button}
            onPress={handleSaveTheme}
          >
            <Text style={dynamicStyles.buttonText}>{t('theme.saveTheme')}</Text>
          </TouchableOpacity>
          
          {/* Theme Demo Button */}
          <TouchableOpacity
            style={[dynamicStyles.button, { backgroundColor: theme.accent }]}
            onPress={() => navigation.navigate('ThemeDemo')}
          >
            <Text style={dynamicStyles.buttonText}>{t('theme.previewComponents')}</Text>
          </TouchableOpacity>
          
          {/* Theme Reset Button */}
          <TouchableOpacity
            style={[dynamicStyles.button, dynamicStyles.resetButton]}
            onPress={handleResetTheme}
          >
            <Text style={dynamicStyles.buttonText}>{t('theme.resetTheme')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Static styles that don't depend on theme
const styles = StyleSheet.create({
  backButton: {
    padding: 8,
  },
  rightHeaderPlaceholder: {
    width: 40,
  }
});