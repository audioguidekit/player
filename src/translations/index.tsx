/**
 * Translation context and hook for i18n support
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { Translations } from './types';
import {
  supportedLanguages,
  isLanguageSupported,
} from '../config/languages';
import type { SupportedLanguageCode } from '../config/languages';

// Use configured languages (tree-shaking removes unused language files)
const translations = supportedLanguages;

// Context types
interface TranslationContextValue {
  t: Translations;
  currentLanguage: SupportedLanguageCode;
}

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

// Provider props
interface TranslationProviderProps {
  children: ReactNode;
  language: string; // Accepts any language code, falls back to English if unsupported
}

/**
 * TranslationProvider component
 * Wraps the app to provide translation context
 */
export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children, language }) => {
  // Use the requested language if supported, otherwise fall back to English
  const resolvedLanguage: SupportedLanguageCode = isLanguageSupported(language) ? language : 'en';
  const t = translations[resolvedLanguage];

  const value: TranslationContextValue = {
    t,
    currentLanguage: resolvedLanguage,
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

// Re-export types and utilities for external use
export type { SupportedLanguageCode } from '../config/languages';
export { isLanguageSupported } from '../config/languages';
