import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from './en.json';
import vi from './vi.json';
import es from './es.json';
import zh from './zh.json';
import ja from './ja.json';

const LANGUAGES = {
  en: { translation: en, label: 'English' },
  vi: { translation: vi, label: 'Tiếng Việt' },
  es: { translation: es, label: 'Español' },
  zh: { translation: zh, label: '中文' },
  ja: { translation: ja, label: '日本語' }
};

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      // Get stored language from AsyncStorage
      const storedLanguage = await AsyncStorage.getItem('userLanguage');
      if (storedLanguage) {
        return callback(storedLanguage);
      }
      
      // Use device language as fallback
      return callback('en');
    } catch (error) {
      console.error('Error reading language from storage:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      // Save selected language to AsyncStorage
      await AsyncStorage.setItem('userLanguage', language);
    } catch (error) {
      console.error('Error saving language to storage:', error);
    }
  }
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: LANGUAGES,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false,
    }
  });

export default i18n;
export { LANGUAGES };