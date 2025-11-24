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
 * Navigation configuration for sidebar/navbar menu items
 * Separate from routing to allow for flexible menu structure
 */
export const navigationConfig = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: BarChartOutlined,
    path: '/dashboard',
    menuKey: '1',
  },
  {
    key: 'competitors',
    label: 'Competitors',
    icon: TeamOutlined,
    path: '/competitors',
    menuKey: '2',
  },
  {
    key: 'ai-assistant',
    label: 'AI Assistant',
    icon: IconMessageChatbot,
    path: '/ai-assistant',
    menuKey: '3',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: BiSolidReport,
    path: '/reports',
    menuKey: '4',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: SettingOutlined,
    path: '/settings',
    menuKey: '5',
    children: [
      {
        key: 'users-roles',
        label: 'Users & Roles',
        icon: UserOutlined,
        path: '/settings/users-roles',
        menuKey: '5-1',
      },
      {
        key: 'roles-permissions',
        label: 'Roles & Permissions',
        icon: SafetyOutlined,
        path: '/settings/roles-permissions',
        menuKey: '5-2',
      },
    ],
  },
];

/**
 * Helper function to get all navigation paths
 */
export const getAllPaths = () => {
  const paths = [];
  const extractPaths = (items) => {
    items.forEach((item) => {
      if (item.path) paths.push(item.path);
      if (item.children) extractPaths(item.children);
    });
  };
  extractPaths(navigationConfig);
  return paths;
};

/**
 * Helper function to find navigation item by path
 */
export const findNavItemByPath = (path) => {
  const findItem = (items, targetPath) => {
    for (const item of items) {
      if (item.path === targetPath) return item;
      if (item.children) {
        const found = findItem(item.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };
  return findItem(navigationConfig, path);
};
