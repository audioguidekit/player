/**
 * Terminal theme configuration
 * A dark hacker-aesthetic theme with deep blacks, cyan accents, and monospace typography.
 * Designed for immersive focus with high contrast and terminal-inspired styling.
 */

import { ThemeConfig } from '../types';

export const terminalTheme: ThemeConfig = {
  id: 'terminal',
  name: 'Terminal',
  description: 'Dark hacker aesthetic with cyan accents and monospace typography',

  header: {
    backgroundColor: '#0A0E14', // Top header bar background - very dark
    iconColor: '#00D9FF', // Header icons (home button, settings, etc.) - cyan
    textColor: '#E6EDF3', // Header title text (remaining time, etc.) - light
    timeFontSize: '14px', // Remaining time display
    timeFontWeight: '600',
    progressBar: {
      backgroundColor: 'rgba(139, 148, 158, 0.2)', // Header progress bar track - subtle
      highlightColor: '#00D9FF', // Header progress bar fill/completion - cyan
    },
  },

  mainContent: {
    backgroundColor: '#0D1117', // Main screen background (behind all cards and content) - dark
  },

  cards: {
    backgroundColor: '#161B22', // Card container background (all content cards) - dark gray
    textColor: '#E6EDF3', // Card text content (titles, descriptions) - light
    borderColor: '#30363D', // Card border outline - medium dark border
    borderRadius: '8px', // Card corner rounding - sharper for terminal aesthetic
    shadow: '0 4px 20px rgba(0, 217, 255, 0.08)', // Card drop shadow - subtle cyan glow
    titleFontSize: '18px', // Card title text
    titleFontWeight: '600',
    durationBadgeFontSize: '14px', // Duration badge on card images
    numberFontSize: '14px', // Step number in audio stops
    numberFontWeight: '700',
    image: {
      placeholderColor: '#21262D', // Card image placeholder/loading state background
      durationBadgeBackground: 'rgba(10, 14, 20, 0.75)', // Duration/time badge overlay background on card images
      durationBadgeText: '#00D9FF', // Duration/time badge text on card images - cyan
    },
  },

  stepIndicators: {
    active: {
      outlineColor: '#00D9FF', // Active step circle border/outline - cyan
      numberColor: '#00D9FF', // Active step number text - cyan
      backgroundColor: '#0D1117', // Active step circle background - dark
    },
    inactive: {
      borderColor: '#30363D', // Inactive/future step circle border - medium border
      numberColor: '#6E7681', // Inactive/future step number text - darker gray
      backgroundColor: '#0D1117', // Inactive/future step circle background - dark
    },
    completed: {
      backgroundColor: '#00D9FF', // Completed step circle background (filled) - cyan
      checkmarkColor: '#0A0E14', // Completed step checkmark icon - dark for contrast
    },
  },

  buttons: {
    primary: {
      backgroundColor: '#00D9FF', // Primary action button background (Start, Continue, Submit) - cyan
      textColor: '#0A0E14', // Primary button text - dark for contrast
      hoverBackground: '#00C4E8', // Primary button background on hover/press - darker cyan
      iconColor: '#0A0E14', // Primary button icon color - dark
      fontSize: '18px',
      fontWeight: '700',
      fontFamily: ['JetBrains Mono', 'monospace'], // Monospace for terminal aesthetic
    },
    secondary: {
      backgroundColor: '#21262D', // Secondary action button background (Cancel, Skip) - dark
      textColor: '#E6EDF3', // Secondary button text - light
      borderColor: '#30363D', // Secondary button border - medium border
      hoverBackground: '#30363D', // Secondary button background on hover/press
      fontSize: '16px',
      fontWeight: '600',
      fontFamily: ['JetBrains Mono', 'monospace'], // Monospace for terminal aesthetic
    },
    transcription: {
      backgroundColor: '#161B22', // Transcription toggle button background - card color
      iconColor: '#00D9FF', // Transcription button icon - cyan
      hoverBackground: '#21262D', // Transcription button background on hover/press
    },
  },

  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'], // Clean sans for readability
      heading: ['JetBrains Mono', 'monospace'], // Monospace for terminal aesthetic
      numbers: ['JetBrains Mono', 'monospace'], // Monospace for numerical displays
    },
  },

  branding: {
    logoUrl: undefined,
    showLogoBorder: false,
    logoSize: 'original',
  },

  miniPlayer: {
    backgroundColor: '#161B22', // Mini player bar background - card dark
    textColor: '#E6EDF3', // Mini player title and time text - light
    titleFontSize: '16px', // Track title
    titleFontWeight: '500',
    timeFontSize: '16px', // Time display
    timeFontWeight: '700',
    transcriptionFontSize: '14px', // Transcription text
    progressBar: {
      backgroundColor: '#21262D', // Mini player progress bar track - dark
      highlightColor: '#00D9FF', // Mini player progress bar fill/completion - cyan
    },
    controls: {
      playButtonBackground: '#00D9FF', // Mini player play/pause button background (expanded state) - cyan
      playButtonIcon: '#0A0E14', // Mini player play/pause icon (expanded state) - dark
      otherButtonsBackground: '#21262D', // Mini player skip/rewind buttons background - dark
      otherButtonsIcon: '#8B949E', // Mini player skip/rewind icons - medium gray
    },
    minimized: {
      playButtonIcon: '#00D9FF', // Mini player play/pause icon (minimized state) - cyan
    },
  },

  sheets: {
    backgroundColor: '#161B22', // Bottom sheet modal background - DARK (not white!)
    handleColor: '#484F58', // Bottom sheet drag handle - visible on dark
    textColor: '#E6EDF3', // Bottom sheet text content - light
    borderColor: '#30363D', // Bottom sheet top border - medium border
    titleFontSize: '18px', // Sheet title
    titleFontWeight: '700',
  },

  status: {
    success: '#3FB950', // Success message text and icons - terminal green
    error: '#F85149',   // Error message text and icons - bright red
    warning: '#D29922', // Warning message text and icons - amber
    info: '#00D9FF',    // Info message text and icons - cyan
  },

  loading: {
    spinnerColor: '#00D9FF', // Loading spinner/indicator color - cyan
    backgroundColor: '#0D1117', // Loading screen background - dark
    messageFontSize: '16px', // Loading message text
    messageFontWeight: '600',
  },

  startCard: {
    titleFontSize: '30px', // Main tour title
    titleFontWeight: '700',
    metaFontSize: '14px', // Duration, stops count
    metaFontWeight: '500',
    metaColor: '#8B949E', // Meta items color (duration, stops) - medium gray
    descriptionFontSize: '16px', // Tour description
    sectionLabelFontSize: '14px', // "What's included", "What to expect"
    sectionLabelFontWeight: '600',
    sectionDescriptionFontSize: '12px', // Section content text
  },

  inputs: {
    backgroundColor: '#0D1117', // Text input field background - dark
    textColor: '#E6EDF3', // Text input field text - light
    borderColor: '#30363D', // Text input field border (default state) - medium border
    focusBorderColor: '#00D9FF', // Text input field border (focused/active state) - cyan
    placeholderColor: '#6E7681', // Text input placeholder text - darker gray
  },

  colors: {
    text: {
      primary: '#E6EDF3',   // Primary text (headings, main content, body text) - light
      secondary: '#8B949E', // Secondary text (subtitles, supporting text, labels) - medium gray
      tertiary: '#6E7681',  // Tertiary text (metadata, timestamps, helper text) - darker gray
      inverse: '#00D9FF',   // Inverse text (on dark backgrounds, audio wave) - cyan for visibility
    },
    border: {
      light: '#21262D',   // Light borders (subtle dividers, decorative lines)
      medium: '#30363D',  // Medium borders (card borders, section separators)
      dark: '#484F58',    // Dark borders (emphasized dividers, focused borders)
    },
    background: {
      primary: '#161B22',   // Primary background (cards, modals, overlays) - card dark
      secondary: '#0D1117', // Secondary background (page background, sections) - darker
      tertiary: '#21262D',  // Tertiary background (hover states, disabled elements)
    },
  },
};
