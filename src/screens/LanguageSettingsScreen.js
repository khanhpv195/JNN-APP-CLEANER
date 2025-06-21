import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import LanguageSettings from '@/components/LanguageSettings';

export default function LanguageSettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useTranslation();

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
    sectionDescription: {
      fontSize: 14,
      marginBottom: 20,
      color: theme.textSecondary || '#777',
      lineHeight: 20,
    }
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
        <Text style={dynamicStyles.headerTitle}>{t('settings.languageSettings')}</Text>
        <View style={styles.rightHeaderPlaceholder} />
      </View>

      <ScrollView>
        {/* Language Settings Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.language')}</Text>
          <Text style={dynamicStyles.sectionDescription}>
            Select your preferred language. The app will automatically translate the interface to the selected language.
          </Text>
          <LanguageSettings style={{ marginTop: 8 }} />
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