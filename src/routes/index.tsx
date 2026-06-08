import React from 'react';
import { RootNavigator } from '../../screens/RootNavigator';

/**
 * Route structure (owned by RootNavigator, which renders an iOS-style
 * push/pop stack between the two levels):
 * / → Tour selection screen (auto-redirects into the tour for single-tour apps)
 * /tour/:tourId → Tour detail (collapsed sheet)
 * /tour/:tourId/:stopId → Playing specific stop (simplified, no /stop/ segment)
 *
 * RootNavigator keeps the list (base) and the tour (overlay) mounted together
 * so the transition and the interactive back gesture can move them in parallax.
 */
export const AppRoutes: React.FC = () => {
  return <RootNavigator />;
};
