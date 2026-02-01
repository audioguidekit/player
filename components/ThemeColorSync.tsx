import React from 'react';
import { useThemeColor } from '../hooks/useThemeColor';

/**
 * Component that syncs the browser theme-color meta tag with the current theme
 * Must be rendered inside ThemeProvider to access theme context
 */
export const ThemeColorSync: React.FC = () => {
  useThemeColor();
  return null; // This component doesn't render anything
};
