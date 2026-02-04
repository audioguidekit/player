import { createGlobalStyle } from 'styled-components';
import { ExtendedTheme } from './ThemeProvider';

export const GlobalStyles = createGlobalStyle<{ theme?: ExtendedTheme }>`
  html {
    width: 100%;
    height: 100%;
  }

  /* iOS Safari fix */
  @supports (-webkit-touch-callout: none) {
    html {
      height: -webkit-fill-available;
      /* Fix for iOS PWA standalone mode - prevents bottom black bar */
      min-height: calc(100% + env(safe-area-inset-top));
    }

    body {
      min-height: -webkit-fill-available;
    }

    #root {
      min-height: -webkit-fill-available;
    }
  }

  /* iOS PWA: Status bar backdrop for notch/Dynamic Island area
     Creates a fixed element that covers the safe area at the top
     This ensures scrolling content is obscured behind the status bar */
  @supports (-webkit-touch-callout: none) and (padding: env(safe-area-inset-top)) {
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      /* Height matches the safe area (notch/Dynamic Island + status bar) */
      /* iOS 11.0-11.2 used constant() */
      height: constant(safe-area-inset-top, 0px);
      height: env(safe-area-inset-top, 0px);
      /* Blurred backdrop matching iOS status bar style */
      backdrop-filter: saturate(180%) blur(20px);
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      background-color: rgba(0, 0, 0, 0.5);
      pointer-events: none;
    }
  }

  body {
    margin: 0;
    padding: 0;
    width: 100%;
    font-family: ${({ theme }) => theme?.typography?.fontFamily?.sans?.join(', ') || 'Inter, sans-serif'} !important;
    background-color: ${({ theme }) => theme?.colors?.background?.primary || '#FFFFFF'};
    color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
    overscroll-behavior: none;
    height: ${({ theme }) => theme?.platform?.viewport?.height || '100vh'};
  }

  /* Apply heading font from theme to all heading elements */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) =>
      theme?.typography?.fontFamily?.heading
        ? theme.typography.fontFamily.heading.join(', ')
        : theme?.typography?.fontFamily?.sans?.join(', ') || 'Inter, sans-serif'
    } !important;
  }

  #root {
    width: 100%;
    height: ${({ theme }) => theme?.platform?.viewport?.height || '100vh'};
  }

  /* Custom focus outline - uses theme border color instead of browser default blue */
  *:focus {
    outline: none;
  }

  *:focus-visible {
    outline: 2px solid ${({ theme }) => theme?.colors?.border?.dark || '#CCCCCC'};
    outline-offset: 2px;
  }

  /* Audio playing loader animation - uses duration badge text color */
  .audio-playing-loader {
    width: 3px;
    height: 16px;
    border-radius: 3px;
    display: inline-block;
    position: relative;
    background: currentColor;
    color: ${({ theme }) => theme?.cards?.image?.durationBadgeText || '#FFFFFF'};
    box-sizing: border-box;
    animation: animloader 0.3s 0.3s linear infinite alternate;
  }

  .audio-playing-loader::after,
  .audio-playing-loader::before {
    content: '';
    width: 3px;
    height: 16px;
    border-radius: 3px;
    background: currentColor;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 7px;
    box-sizing: border-box;
    animation: animloader 0.3s 0.45s linear infinite alternate;
  }

  .audio-playing-loader::before {
    left: -7px;
    animation-delay: 0s;
  }

  @keyframes animloader {
    0% {
      height: 16px;
    }

    100% {
      height: 8px;
    }
  }

  /* Smooth spin animation for audio spinner - Safari optimized */
  @keyframes spin-smooth {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .audio-spinner-ring {
    animation: spin-smooth 1.5s linear infinite;
    transform-origin: center;
  }
`;
