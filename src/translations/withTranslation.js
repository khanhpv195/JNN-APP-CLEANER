import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Higher Order Component (HOC) to wrap any component with translation capability
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 * @returns {React.Component} - Wrapped component with translation props
 */
const withTranslation = (WrappedComponent) => {
  return (props) => {
    const { t, i18n } = useTranslation();
    
    // Additional translation-related functions
    const changeLanguage = (lang) => {
      return i18n.changeLanguage(lang);
    };
    
    const getCurrentLanguage = () => {
      return i18n.language;
    };
    
    // Pass all translation props to the wrapped component
    const translationProps = {
      t,
      i18n,
      changeLanguage,
      getCurrentLanguage,
    };
    
    return <WrappedComponent {...props} {...translationProps} />;
  };
};

export default withTranslation;