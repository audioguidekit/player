/**
 * Modern Purple theme configuration
 * An alternative theme demonstrating customization capabilities
 */

import { ThemeConfig } from '../types';

export const modernTheme: ThemeConfig = {
  id: 'modern',
  name: 'Modern Purple',
  description: 'A modern theme with purple accents',

  header: {
    backgroundColor: '#7C3AED', // Purple
    iconColor: '#FCD34D', // Yellow
    textColor: '#FFFFFF',
    timeFontSize: '14px',
    timeFontWeight: '400',
    progressBar: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      highlightColor: '#FCD34D', // Yellow
    },
  },

  mainContent: {
    backgroundColor: '#F5F3FF', // Light purple
  },

  cards: {
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    borderColor: '#E9D5FF',
    borderRadius: '8px',
    shadow: '0 2px 15px rgba(124, 58, 237, 0.1)',
    titleFontSize: '18px',
    titleFontWeight: '500',
    durationBadgeFontSize: '14px',
    numberFontSize: '14px',
    numberFontWeight: '600',
    image: {
      placeholderColor: '#E9D5FF',
      durationBadgeBackground: 'rgba(39, 32, 48, 0.4)',
      durationBadgeText: '#FFFFFF',
    },
  },

  stepIndicators: {
    active: {
      outlineColor: '#7C3AED', // Purple
      numberColor: '#7C3AED',
      backgroundColor: '#FFFFFF',
    },
    inactive: {
      borderColor: '#D1D5DB',
      numberColor: '#6B7280',
      backgroundColor: '#FFFFFF',
    },
    completed: {
      backgroundColor: '#10B981', // Emerald
      checkmarkColor: '#FFFFFF',
    },
  },

  buttons: {
    primary: {
      backgroundColor: '#7C3AED', // Purple
      textColor: '#FFFFFF',
      hoverBackground: '#6D28D9',
      iconColor: '#FFFFFF',
      fontSize: '18px',
      fontWeight: '600',
    },
    secondary: {
      backgroundColor: '#F3F4F6',
      textColor: '#7C3AED',
      borderColor: '#E5E7EB',
      hoverBackground: '#E5E7EB',
      fontSize: '16px',
      fontWeight: '500',
    },
    transcription: {
      backgroundColor: '#FFFFFF',
      iconColor: '#A78BFA',
      hoverBackground: '#8B5CF6',
    },
  },

  typography: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      heading: ['Inter', 'sans-serif'],
      numbers: ['Inter', 'sans-serif'], // Use same font for numbers in modern theme
    },
  },

  branding: {
    logoUrl: undefined,
    showLogoBorder: false,
    logoSize: 'original',
  },

  miniPlayer: {
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    titleFontSize: '16px',
    titleFontWeight: '400',
    timeFontSize: '16px',
    timeFontWeight: '600',
    transcriptionFontSize: '14px',
    progressBar: {
      backgroundColor: '#E5E7EB',
      highlightColor: '#7C3AED',
    },
    controls: {
      playButtonBackground: '#7C3AED',
      playButtonIcon: '#FFFFFF',
      otherButtonsBackground: '#A78BFA',
      otherButtonsIcon: '#FFFFFF',
    },
    minimized: {
      playButtonIcon: '#1F2937',
    },
  },

  sheets: {
    backgroundColor: '#FFFFFF',
    handleColor: '#D1D5DB',
    textColor: '#1F2937',
    borderColor: '#E9D5FF',
    titleFontSize: '18px',
    titleFontWeight: '700',
  },

  status: {
    success: '#10B981', // emerald-500
    error: '#EF4444',   // red-500
    warning: '#F59E0B', // amber-500
    info: '#7C3AED',    // purple-600
  },

  loading: {
    spinnerColor: '#7C3AED',
    backgroundColor: '#FFFFFF',
    messageFontSize: '16px',
    messageFontWeight: '500',
  },

  startCard: {
    titleFontSize: '30px',
    titleFontWeight: '700',
    metaFontSize: '14px',
    metaFontWeight: '400',
    metaColor: '#6B7280', // Meta items color (duration, stops)
    descriptionFontSize: '16px',
    sectionLabelFontSize: '14px',
    sectionLabelFontWeight: '500',
    sectionDescriptionFontSize: '12px',
  },

  inputs: {
    backgroundColor: '#FAF5FF', // purple-50
    textColor: '#1F2937',       // gray-800
    borderColor: '#E9D5FF',     // purple-200
    focusBorderColor: '#7C3AED', // purple-600 (matches primary button)
    placeholderColor: '#9CA3AF', // gray-400
  },

  colors: {
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    border: {
      light: '#F3F4F6',
      medium: '#E5E7EB',
      dark: '#D1D5DB',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#FAF5FF', // purple-50
      tertiary: '#F5F3FF',  // purple-100
    },
  },
};
