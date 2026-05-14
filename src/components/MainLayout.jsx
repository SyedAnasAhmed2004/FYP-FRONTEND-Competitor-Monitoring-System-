import React from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { FaUser } from 'react-icons/fa';
import { navigationConfig } from '../routes/navigation';
import notify from '@utils/notify';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import {
  logoutUser,
  selectPermissions,
  selectPermissionsLoaded,
  selectUser,
  selectUserType,
} from '@features/auth/authSlice';

const { Header, Content } = Layout;

const flattenPermissions = (permissions) => ({
  dashboard: !!permissions?.dashboard,
  competitors: !!permissions?.competitors,
  ai_assistant: !!permissions?.ai_assistant,
  reports: !!permissions?.reports,
  settings: !!permissions?.settings,
  alerts: !!permissions?.alerts,
});

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector(selectUser);
  const permissions = useAppSelector(selectPermissions);
  const permissionsLoaded = useAppSelector(selectPermissionsLoaded);
  const userType = useAppSelector(selectUserType);

  const displayName = currentUser?.name || currentUser?.username || 'User';
  const isSuperAdmin = userType === 'super_admin';
  const resolvedPermissions = flattenPermissions(permissions);

  console.log('[layout] MainLayout state', {
    currentUser,
    userType,
    isSuperAdmin,
    permissionsLoaded,
    permissions,
    resolvedPermissions,
  });

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      notify.success('Logged out successfully!');
      navigate('/login');
    } catch {
      notify.error('Error during logout');
    }
  };

  // ── Active menu key detection ─────────────────────────────────────────────
  const getSelectedKeys = () => {
    const keys = [];
    const openKeys = [];

    for (const navItem of navigationConfig) {
      if (navItem.children) {
        for (const child of navItem.children) {
          if (location.pathname === child.path) {
            keys.push(child.menuKey);
            openKeys.push(navItem.menuKey);
            return { selectedKeys: keys, openKeys };
          }
        }
        if (location.pathname === navItem.path) {
          keys.push(navItem.menuKey);
          return { selectedKeys: keys, openKeys };
        }
      } else {
        if (location.pathname === navItem.path) {
          keys.push(navItem.menuKey);
        }
      }
    }

    return { selectedKeys: keys.length ? keys : ['1'], openKeys };
  };

  const { selectedKeys, openKeys } = getSelectedKeys();

  // ── Build menu items, filtering by permission ─────────────────────────────
  const buildMenuItems = (navItems) => {
    const builtItems = navItems
      .filter((item) => {
        if (!item.permission) return true;
        if (isSuperAdmin) return true;
        if (!permissionsLoaded) return false;
        return resolvedPermissions[item.permission] === true;
      })
      .map((navItem) => {
        if (navItem.children) {
          const visibleChildren = navItem.children.filter((c) => {
            if (!c.permission) return true;
            if (isSuperAdmin) return true;
            if (!permissionsLoaded) return false;
            return resolvedPermissions[c.permission] === true;
          });
          // Hide the parent entirely if all children are inaccessible
          if (visibleChildren.length === 0) return null;

          return {
            key: navItem.menuKey,
            icon: <navItem.icon size={18} />,
            label: (
              <div className="submenu-label-wrapper">
                <span>{navItem.label}</span>
                <DownOutlined className="submenu-arrow-icon" />
              </div>
            ),
            children: visibleChildren.map((child) => ({
              key: child.menuKey,
              icon: <child.icon size={18} />,
              label: child.label,
              onClick: () => navigate(child.path),
            })),
          };
        }

        return {
          key: navItem.menuKey,
          icon: <navItem.icon size={18} />,
          label: navItem.label,
          onClick: () => navigate(navItem.path),
        };
      })
      .filter(Boolean);

    console.log('[layout] visible menu items', builtItems.map((item) => item.key));
    return builtItems;
  };

  const menuItems = buildMenuItems(navigationConfig);

  // ── Profile dropdown ──────────────────────────────────────────────────────
  const profileMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleSignOut,
      danger: true,
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout className="strategic-agent-layout">
      <Header className="strategic-header">
        <div className="header-left">
          <div className="logo-container">
            <Avatar size={40} className="logo-avatar">S</Avatar>
            <div className="brand-text">
              <h1 className="brand-title">Track Rival</h1>
              <p className="brand-subtitle">AI-Powered Intelligence</p>
            </div>
          </div>
        </div>

        <div className="header-center">
          <Menu
            mode="horizontal"
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
            items={menuItems}
            className="top-menu"
          />
        </div>

        <div className="header-right">
          <Dropdown
            menu={{ items: profileMenuItems }}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="profile-dropdown"
          >
            <div className="profile-header-trigger">
              <FaUser className="profile-icon" />
              <span className="profile-name">
                {isSuperAdmin ? 'Super Admin' : displayName}
              </span>
              <DownOutlined className="profile-arrow" />
            </div>
          </Dropdown>
        </div>
      </Header>

      <Content className="main-content">
        <Outlet />
      </Content>
    </Layout>
  );
}

export default MainLayout;
