import { useEffect } from 'react';
import { Language } from '../types';
import { storageService } from '../src/services/storageService';

export interface UseLanguageSelectionProps {
  languages: Language[] | null;
  selectedLanguage: Language | null;
  setSelectedLanguage: (lang: Language) => void;
}

/**
 * Hook to handle language selection based on:
 * 1. Saved user preference
 * 2. Browser/device language
 * 3. English fallback
 * 4. First available language
 */
export const useLanguageSelection = ({
  languages,
  selectedLanguage,
  setSelectedLanguage,
}: UseLanguageSelectionProps) => {
  useEffect(() => {
    if (languages && languages.length > 0 && !selectedLanguage) {
      let languageToUse: Language | undefined;

      // 1. Check for saved user preference (user explicitly chose a language)
      const preferences = storageService.getPreferences();
      const savedLanguageCode = preferences.selectedLanguage;

      if (savedLanguageCode) {
        languageToUse = languages.find(l => l.code === savedLanguageCode);
      }

      // 2. If no saved preference, detect browser/device language
      if (!languageToUse) {
        const browserLanguage = navigator.language || navigator.languages?.[0];
        if (browserLanguage) {
          // Extract language code (e.g., "cs-CZ" -> "cs", "en-US" -> "en")
          const browserLangCode = browserLanguage.split('-')[0].toLowerCase();
          languageToUse = languages.find(l => l.code === browserLangCode);

          if (languageToUse) {
            console.log(`[LANGUAGE] Detected browser language: ${browserLanguage}, using: ${languageToUse.code}`);
          }
        }
      }

      // 3. Fall back to English
      if (!languageToUse) {
        languageToUse = languages.find(l => l.code === 'en');
      }

      // 4. Fall back to first available language
      if (!languageToUse) {
        languageToUse = languages[0];
      }

      setSelectedLanguage(languageToUse);
    }
  }, [languages, selectedLanguage, setSelectedLanguage]);
};
