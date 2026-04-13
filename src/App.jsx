import React, { useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import Login from '@features/auth/Login';
import MainLayout from '@components/MainLayout';
import AppRoutes from '@routes/AppRoutes';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { bootstrapAuth, selectIsAuthenticated, selectPermissionsLoaded } from '@features/auth/authSlice';

console.log('📱 App component loaded');

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const permissionsLoaded = useAppSelector(selectPermissionsLoaded);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !permissionsLoaded && !bootstrappedRef.current) {
      bootstrappedRef.current = true;
      dispatch(bootstrapAuth());
    }

    if (!isAuthenticated) {
      bootstrappedRef.current = false;
    }
  }, [dispatch, isAuthenticated, permissionsLoaded]);

  console.log('🎨 App rendering...');
  
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#E63946',
          colorInfo: '#E63946',
          colorSuccess: '#52B788',
          colorWarning: '#F77F00',
          colorError: '#D62828',
          colorLink: '#E63946',
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        },
      }}
    >
      <AntApp>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes with Layout */}
          <Route path="/*" element={<MainLayout />}>
            <Route path="*" element={<AppRoutes />} />
          </Route>
        </Routes>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
