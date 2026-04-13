import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { routes, defaultRoute } from './routes';
import ProtectedRoute from '@components/ProtectedRoute';
import authService from '@services/authService';
import { useAppSelector } from '@app/hooks';
import { selectIsAuthenticated, selectPermissionsLoaded } from '@features/auth/authSlice';

/**
 * Main routing component.
 * Passes each route's `permission` key down to ProtectedRoute so that
 * authenticated users without the required permission see "Access Denied"
 * instead of the page.
 */
const AppRoutes = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const permissionsLoaded = useAppSelector(selectPermissionsLoaded);

  const homeRoute = isAuthenticated ? authService.getFirstAccessibleRoute() || '/dashboard' : defaultRoute;

  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.protected ? (
              <ProtectedRoute permission={route.permission}>
                <route.element />
              </ProtectedRoute>
            ) : (
              <route.element />
            )
          }
        />
      ))}

      {/* Default redirect */}
      <Route
        path="/"
        element={
          !isAuthenticated || permissionsLoaded ? (
            <Navigate to={homeRoute} replace />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
              <Spin size="large" tip="Loading access permissions..." />
            </div>
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to={homeRoute} replace />} />
    </Routes>
  );
};

export default AppRoutes;
