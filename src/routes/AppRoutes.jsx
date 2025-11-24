import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes, defaultRoute } from './routes';
import ProtectedRoute from '@components/ProtectedRoute';

/**
 * Main routing component
 * Handles all application routes with authentication checks
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Protected routes */}
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.protected ? (
              <ProtectedRoute>
                <route.element />
              </ProtectedRoute>
            ) : (
              <route.element />
            )
          }
        />
      ))}
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />
      
      {/* 404 - Redirect to default route */}
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  );
};

export default AppRoutes;
