import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../translations/i18n';

const LanguageSettings = ({ style }) => {
  const { i18n, t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  
  // List of available languages
  const languageOptions = Object.keys(LANGUAGES).map(langCode => ({
    code: langCode,
    label: LANGUAGES[langCode].label,
  }));

  // Get the current language label
  const currentLanguageLabel = LANGUAGES[selectedLanguage]?.label || 'English';

  // Handle language change
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode)
      .then(() => {
        setSelectedLanguage(langCode);
        setModalVisible(false);
      })
      .catch((error) => {
        console.error('Failed to change language:', error);
        Alert.alert(
          "Error",
          "Failed to change language. Please try again.",
          [{ text: "OK" }]
        );
      });
  };

  // Render language option item
  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selectedLanguage === item.code && styles.selectedLanguageItem
      ]}
      onPress={() => changeLanguage(item.code)}
    >
      <Text style={[
        styles.languageText,
        selectedLanguage === item.code && styles.selectedLanguageText
      ]}>
        {item.label}
      </Text>
      {selectedLanguage === item.code && (
        <Ionicons name="checkmark" size={24} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.languageSelector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.languageLabel}>{t('settings.language')}</Text>
        <View style={styles.currentLanguage}>
          <Text style={styles.currentLanguageText}>{currentLanguageLabel}</Text>
          <Ionicons name="chevron-forward" size={20} color="#777" />
        </View>
      </TouchableOpacity>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('settings.language')}</Text>
              <View style={styles.headerRight} />
            </View>
            
            <FlatList
              data={languageOptions}
              renderItem={renderLanguageItem}
              keyExtractor={item => item.code}
              style={styles.languageList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  languageLabel: {
    fontSize: 16,
  },
  currentLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLanguageText: {
    fontSize: 16,
    color: '#777',
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 32,
  },
  languageList: {
    paddingHorizontal: 20,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedLanguageItem: {
    backgroundColor: '#f9f9f9',
  },
  languageText: {
    fontSize: 17,
  },
  selectedLanguageText: {
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default LanguageSettings;