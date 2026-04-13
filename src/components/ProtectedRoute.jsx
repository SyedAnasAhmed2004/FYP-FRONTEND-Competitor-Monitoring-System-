import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button, Result, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import authService from '@services/authService';
import { useAppSelector } from '@app/hooks';
import { selectIsAuthenticated, selectPermissionsLoaded } from '@features/auth/authSlice';

const flattenPermissions = (permissions) => ({
  dashboard: !!permissions?.dashboard,
  competitors: !!permissions?.competitors,
  ai_assistant: !!permissions?.ai_assistant,
  reports: !!permissions?.reports,
  settings: !!permissions?.settings,
});

/**
 * Wraps any route that requires authentication and/or a specific permission.
 *
 * Props:
 *   children   – the page component to render
 *   permission – optional permission key ('dashboard' | 'competitors' |
 *                'ai_assistant' | 'reports' | 'settings').
 *                If omitted, any authenticated user is allowed.
 */
const ProtectedRoute = ({ children, permission }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const permissionsLoaded = useAppSelector(selectPermissionsLoaded);
  const resolvedPermissions = flattenPermissions(authService.getPermissions());

  console.log('[route] ProtectedRoute check', {
    path: location.pathname,
    permission,
    isAuthenticated,
    permissionsLoaded,
    storedPermissions: authService.getPermissions(),
    resolvedPermissions,
    userType: authService.getUserType(),
  });

  // ── 1. Not logged in ──────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!permissionsLoaded) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Spin size="large" tip="Loading your access permissions..." />
      </div>
    );
  }

  // ── 2. Logged in but lacks the required permission ────────────────────────
  if (!authService.hasPermission(permission)) {
    console.log('[route] Access denied', {
      path: location.pathname,
      permission,
      storedPermissions: authService.getPermissions(),
      resolvedPermissions,
      userType: authService.getUserType(),
    });
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Result
          status="403"
          title="Access Denied"
          subTitle="You don't have permission to view this page. Contact your administrator if you think this is a mistake."
          extra={
            authService.getFirstAccessibleRoute() ? (
              <Button
                type="primary"
                onClick={() => navigate(authService.getFirstAccessibleRoute(), { replace: true })}
              >
                Go to my dashboard
              </Button>
            ) : null
          }
        />
      </div>
    );
  }

  // ── 3. Authenticated and permitted ───────────────────────────────────────
  return children;
};

export default ProtectedRoute;
