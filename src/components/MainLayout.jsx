import React from 'react';
import { Layout, Menu, Badge, Avatar, Dropdown } from 'antd';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { BellOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { FaUser } from 'react-icons/fa';
import { navigationConfig } from '../routes/navigation';
import authService from '@services/authService';
import notify from '@utils/notify';

const { Header, Content } = Layout;

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle sign out
  const handleSignOut = () => {
    try {
      authService.logout();
      notify.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      notify.error('Error during logout');
    }
  };
  
  // Find selected key based on current path
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
        // If on settings main page
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

  // Build menu items with submenus
  const buildMenuItems = (navItems) => {
    return navItems.map(navItem => {
      // For routes with children (Settings)
      if (navItem.children) {
        return {
          key: navItem.menuKey,
          icon: <navItem.icon size={18} />,
          label: (
            <div className="submenu-label-wrapper">
              <span>{navItem.label}</span>
              <DownOutlined className="submenu-arrow-icon" />
            </div>
          ),
          // Don't navigate when clicking parent, let submenu handle it
          children: navItem.children.map(child => ({
            key: child.menuKey,
            icon: <child.icon size={18} />,
            label: child.label,
            onClick: () => navigate(child.path),
          })),
        };
      }
      
      // For regular routes (Dashboard, etc.)
      return {
        key: navItem.menuKey,
        icon: <navItem.icon size={18} />,
        label: navItem.label,
        onClick: () => navigate(navItem.path),
      };
    });
  };

  const menuItems = buildMenuItems(navigationConfig);

  // Profile dropdown menu items
  const profileMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleSignOut,
      danger: true,
    },
  ];

  return (
    <Layout className="strategic-agent-layout">
      <Header className="strategic-header">
        <div className="header-left">
          <div className="logo-container">
            <Avatar size={40} className="logo-avatar">S</Avatar>
            <div className="brand-text">
              <h1 className="brand-title">Strategic Agent</h1>
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
              <span className="profile-name">Super Admin</span>
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
