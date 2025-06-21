# Internationalization (i18n) System

This directory contains the internationalization system for the mobile app. It supports multiple languages, including English, Vietnamese, Spanish, Chinese, and Japanese.

## Files Structure

- `i18n.js` - Main configuration file for i18n
- `en.json` - English translations
- `vi.json` - Vietnamese translations
- `es.json` - Spanish translations
- `zh.json` - Chinese translations
- `ja.json` - Japanese translations
- `translator.js` - Utility functions for dynamic translations with Google Translate API
- `withTranslation.js` - Higher-Order Component (HOC) for easy integration with React components
- `index.js` - Exports all translation-related functionality

## How to Use

### Basic Usage

```javascript
import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('settings.title')}</Text>
      <Text>{t('common.save')}</Text>
    </View>
  );
};

export default MyComponent;
```

### Using the HOC

```javascript
import React from 'react';
import { View, Text, Button } from 'react-native';
import { withTranslation } from '../translations';

const MyComponent = ({ t, changeLanguage }) => {
  return (
    <View>
      <Text>{t('settings.title')}</Text>
      <Button 
        title="Switch to Vietnamese" 
        onPress={() => changeLanguage('vi')} 
      />
    </View>
  );
};

export default withTranslation(MyComponent);
```

### Dynamic Translation

For dynamic content that isn't in the translation files, you can use the Google Translate API:

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { translateText } from '../translations';
import { useTranslation } from 'react-i18next';

const DynamicContent = ({ content }) => {
  const { i18n } = useTranslation();
  const [translatedContent, setTranslatedContent] = useState(content);
  
  useEffect(() => {
    const translate = async () => {
      if (i18n.language !== 'en') {
        const translated = await translateText(content, i18n.language, 'en');
        setTranslatedContent(translated);
      } else {
        setTranslatedContent(content);
      }
    };
    
    translate();
  }, [content, i18n.language]);
  
  return (
    <View>
      <Text>{translatedContent}</Text>
    </View>
  );
};

export default DynamicContent;
```

## Adding a New Language

1. Create a new JSON file with the language code (e.g., `fr.json` for French)
2. Copy the structure from `en.json` and translate the values
3. Add the language to the `LANGUAGES` object in `i18n.js`

## Using Google Translate API

To use the Google Translate API for dynamic translations:

1. Get an API key from Google Cloud Console
2. Enable the Cloud Translation API
3. Set billing for your Google Cloud project
4. Replace `YOUR_GOOGLE_TRANSLATE_API_KEY` in `translator.js` with your actual API key

## Translation Keys Structure

The translation keys are structured hierarchically:

- `settings` - Settings-related translations
- `languages` - Language names
- `common` - Common UI elements

Add new keys as needed, maintaining the hierarchical structure for better organization.