import Dashboard from '@features/dashboard/Dashboard';
import Competitors from '@features/competitors/Competitors';
import AIAssistant from '@features/aiAssistant/AIAssistant';
import Reports from '@features/reports/Reports';
import UsersRoles from '@features/settings/UsersRoles';
import RolesPermissions from '@features/settings/RolesPermissions';

/**
 * Application routes configuration
 * Maps paths to components for React Router
 */
export const routes = [
  {
    path: '/dashboard',
    element: Dashboard,
    protected: true,
  },
  {
    path: '/competitors',
    element: Competitors,
    protected: true,
  },
  {
    path: '/ai-assistant',
    element: AIAssistant,
    protected: true,
  },
  {
    path: '/reports',
    element: Reports,
    protected: true,
  },
  {
    path: '/settings/users-roles',
    element: UsersRoles,
    protected: true,
  },
  {
    path: '/settings/roles-permissions',
    element: RolesPermissions,
    protected: true,
  },
];

/**
 * Default route to redirect to
 */
export const defaultRoute = '/dashboard';

/**
 * Public routes (no authentication required)
 */
export const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
];
