import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../../App';
import { DEFAULT_TOUR_ID } from '../config/tours';

/**
 * Route structure:
 * / → Redirect to default tour
 * /tour/:tourId → Tour detail (collapsed sheet)
 * /tour/:tourId/:stopId → Playing specific stop (simplified, no /stop/ segment)
 */
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirects to default tour */}
      <Route path="/" element={<Navigate to={`/tour/${DEFAULT_TOUR_ID}`} replace />} />

      {/* Tour routes - more specific route first */}
      <Route path="/tour/:tourId/:stopId" element={<App />} />
      <Route path="/tour/:tourId" element={<App />} />

      {/* Catch-all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
