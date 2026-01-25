/**
 * Default theme configuration
 * This is the base theme that matches the original application design
 */

import { ThemeConfig } from '../types';

export const defaultTheme: ThemeConfig = {
  id: 'default',
  name: 'Default',
  description: 'Original application design',

  header: {
    backgroundColor: '#FD8686', // Coral/salmon color
    iconColor: '#E1F000', // Yellow-green
    textColor: '#374151', // Dark gray
    timeFontSize: '14px',
    timeFontWeight: '400',
    progressBar: {
      backgroundColor: '#E5E7EB', // Light gray
      highlightColor: '#22C55E', // Green
    },
  },

  mainContent: {
    backgroundColor: '#AFC1E4', // Light blue
  },

  cards: {
    backgroundColor: '#FFFFFF',
    textColor: '#171717', // Near black
    borderColor: '#F3F4F6',
    borderRadius: '16px',
    shadow: '0 2px 15px rgba(0, 0, 0, 0.05)',
    titleFontSize: '18px',
    titleFontWeight: '500',
    durationBadgeFontSize: '14px',
    numberFontSize: '14px',
    numberFontWeight: '600',
    image: {
      placeholderColor: '#E5E7EB',
      durationBadgeBackground: 'rgba(0, 0, 0, 0.4)',
      durationBadgeText: '#FFFFFF',
    },
  },

  stepIndicators: {
    active: {
      outlineColor: '#57BC7C', // Green outline
      numberColor: '#4F8764', // Dark green
      backgroundColor: '#FFFFFF',
    },
    inactive: {
      borderColor: '#CBCBCB', // Light gray border
      numberColor: '#111827', // Dark gray
      backgroundColor: '#FFFFFF',
    },
    completed: {
      backgroundColor: '#22C55E', // Green
      checkmarkColor: '#FFFFFF',
    },
  },

  buttons: {
    primary: {
      backgroundColor: '#FF0000', // Red
      textColor: '#FFFFFF',
      hoverBackground: '#E60000',
      iconColor: '#FFFFFF',
      fontSize: '18px',
      fontWeight: '600',
    },
    secondary: {
      backgroundColor: '#F3F4F6',
      textColor: '#111827',
      borderColor: '#E5E7EB',
      hoverBackground: '#E5E7EB',
      fontSize: '16px',
      fontWeight: '500',
    },
    transcription: {
      backgroundColor: '#FFFFFF',
      iconColor: '#5B96C2',
      hoverBackground: '#4A85B1',
    },
  },

  typography: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      heading: ['Inter', 'sans-serif'],
      numbers: ['Inter', 'sans-serif'], // Use same font for numbers in default theme
    },
  },

  branding: {
    logoUrl: undefined,
    showLogoBorder: false,
    logoSize: 'original',
  },

  miniPlayer: {
    backgroundColor: '#FFFFFF',
    textColor: '#111827',
    titleFontSize: '16px',
    titleFontWeight: '400',
    timeFontSize: '16px',
    timeFontWeight: '600',
    transcriptionFontSize: '14px',
    progressBar: {
      backgroundColor: '#E5E7EB',
      highlightColor: '#22C55E',
    },
    controls: {
      playButtonBackground: '#FF0000', // Red
      playButtonIcon: '#FFFFFF',
      otherButtonsBackground: '#5B96C2', // Blue
      otherButtonsIcon: '#FFFFFF',
    },
    minimized: {
      playButtonIcon: '#111827',
    },
  },

  sheets: {
    backgroundColor: '#FFFFFF',
    handleColor: '#D1D5DB',
    textColor: '#111827',
    borderColor: '#E5E7EB',
    titleFontSize: '18px',
    titleFontWeight: '700',
  },

  status: {
    success: '#22C55E', // green-500
    error: '#DC2626',   // red-600
    warning: '#F59E0B', // amber-500
    info: '#3B82F6',    // blue-500
  },

  loading: {
    spinnerColor: '#18181B', // zinc-900
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
    backgroundColor: '#F9FAFB', // gray-50
    textColor: '#111827',       // gray-900
    borderColor: '#E5E7EB',     // gray-200
    focusBorderColor: '#3B82F6', // blue-500
    placeholderColor: '#9CA3AF', // gray-400
  },

  colors: {
    text: {
      primary: '#111827',   // gray-900
      secondary: '#6B7280', // gray-500
      tertiary: '#9CA3AF',  // gray-400
      inverse: '#FFFFFF',
    },
    border: {
      light: '#F3F4F6',   // gray-100
      medium: '#E5E7EB',  // gray-200
      dark: '#D1D5DB',    // gray-300
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB', // gray-50
      tertiary: '#F3F4F6',  // gray-100
    },
  },
};
