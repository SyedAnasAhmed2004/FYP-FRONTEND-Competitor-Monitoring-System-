import Dashboard from '@features/dashboard/Dashboard';
import Competitors from '@features/competitors/Competitors';
import AIAssistant from '@features/aiAssistant/AIAssistant';
import Reports from '@features/reports/Reports';
import LiveAlerts from '@features/alerts/LiveAlerts';
import UsersRoles from '@features/settings/UsersRoles';
import RolesPermissions from '@features/settings/RolesPermissions';
import Login from '@features/auth/Login';

/**
 * Application routes configuration.
 *
 * `permission` maps to the key inside the permissions object returned by the
 * roles API.  ProtectedRoute uses authService.hasPermission(permission) to
 * decide whether to render the page or show an "Access Denied" screen.
 * Leave permission undefined for routes that only require authentication.
 */
export const routes = [
  {
    path: '/login',
    element: Login,
    protected: false,
  },
  {
    path: '/dashboard',
    element: Dashboard,
    protected: true,
    permission: 'dashboard',
  },
  {
    path: '/competitors',
    element: Competitors,
    protected: true,
    permission: 'competitors',
  },
  {
    path: '/ai-assistant',
    element: AIAssistant,
    protected: true,
    permission: 'ai_assistant',
  },
  {
    path: '/reports',
    element: Reports,
    protected: true,
    permission: 'reports',
  },
  {
    path: '/alerts',
    element: LiveAlerts,
    protected: true,
    permission: 'alerts',
  },
  {
    path: '/settings/users-roles',
    element: UsersRoles,
    protected: true,
    permission: 'settings',
  },
  {
    path: '/settings/roles-permissions',
    element: RolesPermissions,
    protected: true,
    permission: 'settings',
  },
];

export const defaultRoute = '/login';

export const publicRoutes = ['/login', '/register', '/forgot-password'];
