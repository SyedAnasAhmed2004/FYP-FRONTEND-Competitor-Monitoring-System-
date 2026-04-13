import {
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { IconMessageChatbot } from '@tabler/icons-react';
import { BiSolidReport } from 'react-icons/bi';

/**
 * Navigation configuration for the top menu.
 *
 * `permission` must match the key inside the permissions object that the
 * backend returns for a role.  MainLayout uses authService.hasPermission()
 * to decide which items to render.  Omit `permission` to show the item to
 * every authenticated user.
 */
export const navigationConfig = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: BarChartOutlined,
    path: '/dashboard',
    menuKey: '1',
    permission: 'dashboard',
  },
  {
    key: 'competitors',
    label: 'Competitors',
    icon: TeamOutlined,
    path: '/competitors',
    menuKey: '2',
    permission: 'competitors',
  },
  {
    key: 'ai-assistant',
    label: 'AI Assistant',
    icon: IconMessageChatbot,
    path: '/ai-assistant',
    menuKey: '3',
    permission: 'ai_assistant',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: BiSolidReport,
    path: '/reports',
    menuKey: '4',
    permission: 'reports',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: SettingOutlined,
    path: '/settings',
    menuKey: '5',
    permission: 'settings',
    children: [
      {
        key: 'users-roles',
        label: 'Users & Roles',
        icon: UserOutlined,
        path: '/settings/users-roles',
        menuKey: '5-1',
        permission: 'settings',
      },
      {
        key: 'roles-permissions',
        label: 'Roles & Permissions',
        icon: SafetyOutlined,
        path: '/settings/roles-permissions',
        menuKey: '5-2',
        permission: 'settings',
      },
    ],
  },
];

export const getAllPaths = () => {
  const paths = [];
  const extract = (items) => {
    items.forEach((item) => {
      if (item.path) paths.push(item.path);
      if (item.children) extract(item.children);
    });
  };
  extract(navigationConfig);
  return paths;
};

export const findNavItemByPath = (path) => {
  const find = (items, target) => {
    for (const item of items) {
      if (item.path === target) return item;
      if (item.children) {
        const found = find(item.children, target);
        if (found) return found;
      }
    }
    return null;
  };
  return find(navigationConfig, path);
};
