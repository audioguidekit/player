/**
 * Translation context and hook for i18n support
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { Translations, LanguageCode } from './types';

// Import all translation files
import { en } from './locales/en';
import { cs } from './locales/cs';
import { de } from './locales/de';
import { fr } from './locales/fr';
import { it } from './locales/it';
import { es } from './locales/es';

// Translation registry
const translations: Record<LanguageCode, Translations> = {
  en,
  cs,
  de,
  fr,
  it,
  es,
};

// Context types
interface TranslationContextValue {
  t: Translations;
  currentLanguage: LanguageCode;
}

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

// Provider props
interface TranslationProviderProps {
  children: ReactNode;
  language: LanguageCode;
}

/**
 * TranslationProvider component
 * Wraps the app to provide translation context
 */
export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children, language }) => {
  const t = translations[language] || translations.en; // Fallback to English

  const value: TranslationContextValue = {
    t,
    currentLanguage: language,
  };

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

/**
 * useTranslation hook
 * Returns the current translations object
 */
export const useTranslation = () => {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }

  return context;
};
