/**
 * Translator utility using Google Translate API
 * 
 * To use Google Translate API, you'll need to:
 * 1. Get an API key from Google Cloud Console
 * 2. Enable the Cloud Translation API
 * 3. Set billing for your Google Cloud project
 * 
 * Once you have the API key, replace 'YOUR_GOOGLE_TRANSLATE_API_KEY' below
 */

// Replace with your actual API key
const GOOGLE_TRANSLATE_API_KEY = 'YOUR_GOOGLE_TRANSLATE_API_KEY';
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

/**
 * Translates text using Google Translate API
 * 
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'en', 'vi', 'es')
 * @param {string} sourceLang - Source language code (optional, auto-detect if not provided)
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLang, sourceLang = null) => {
  try {
    // If API key is not set, return original text
    if (GOOGLE_TRANSLATE_API_KEY === 'YOUR_GOOGLE_TRANSLATE_API_KEY') {
      console.warn('Google Translate API key not set. Using original text.');
      return text;
    }

    // Build request URL
    let url = `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}&target=${targetLang}&q=${encodeURIComponent(text)}`;
    if (sourceLang) {
      url += `&source=${sourceLang}`;
    }

    // Make API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Check for valid response
    if (data.data && data.data.translations && data.data.translations.length > 0) {
      return data.data.translations[0].translatedText;
    } else {
      throw new Error('Invalid translation response');
    }
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text on error
    return text;
  }
};

/**
 * Batch translate multiple texts at once
 * 
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (optional)
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const batchTranslate = async (texts, targetLang, sourceLang = null) => {
  try {
    // If API key is not set, return original texts
    if (GOOGLE_TRANSLATE_API_KEY === 'YOUR_GOOGLE_TRANSLATE_API_KEY') {
      console.warn('Google Translate API key not set. Using original texts.');
      return texts;
    }

    // Build request URL and body
    const url = `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`;
    const body = {
      q: texts,
      target: targetLang,
    };
    
    if (sourceLang) {
      body.source = sourceLang;
    }

    // Make API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Check for valid response
    if (data.data && data.data.translations && data.data.translations.length > 0) {
      return data.data.translations.map(t => t.translatedText);
    } else {
      throw new Error('Invalid translation response');
    }
  } catch (error) {
    console.error('Batch translation error:', error);
    // Return original texts on error
    return texts;
  }
};

/**
 * Convert a translation object (nested keys with English values)
 * to a different language using Google Translate API
 * 
 * @param {Object} translationObj - Translation object with English values
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} - Translated object
 */
export const convertTranslationObject = async (translationObj, targetLang) => {
  // Flatten the object to get all the text values
  const flattenedTexts = [];
  const flattenedPaths = [];

  const flattenObject = (obj, path = '') => {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        flattenObject(obj[key], currentPath);
      } else {
        flattenedTexts.push(obj[key]);
        flattenedPaths.push(currentPath);
      }
    }
  };

  flattenObject(translationObj);
  
  // Translate all texts
  const translatedTexts = await batchTranslate(flattenedTexts, targetLang, 'en');
  
  // Rebuild the object with translated texts
  const result = {};
  
  for (let i = 0; i < flattenedPaths.length; i++) {
    const path = flattenedPaths[i];
    const value = translatedTexts[i];
    
    // Build the nested object structure
    const parts = path.split('.');
    let current = result;
    
    for (let j = 0; j < parts.length - 1; j++) {
      const part = parts[j];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  return result;
};