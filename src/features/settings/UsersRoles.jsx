import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  Dropdown,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchRoles,
  deleteRole,
  selectUsers,
  selectRoles,
  selectUsersLoading,
  selectRolesLoading,
} from './settingsSlice';
import notify from '@utils/notify';

const { Text } = Typography;
const { Option } = Select;

const AVATAR_COLORS = ['#E63946', '#2563eb', '#16a34a', '#9333ea', '#f59e0b', '#06b6d4'];

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

function UsersRoles() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const users = useAppSelector(selectUsers);
  const roles = useAppSelector(selectRoles);
  const usersLoading = useAppSelector(selectUsersLoading);
  const rolesLoading = useAppSelector(selectRolesLoading);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [form] = Form.useForm();

  // ── Data fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
  }, [dispatch]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getRoleName = (roleValue) => {
    if (!roleValue) return '';
    if (typeof roleValue === 'object' && roleValue?.name) return roleValue.name;
    const role = roles.find((r) => r.id === roleValue);
    return role ? role.name : String(roleValue);
  };

  const tableData = users.map((user, index) => ({
    key: user.id,
    id: user.id,
    name: user.name || user.username || '',
    email: user.email || '',
    role: user.role_id,
    roleName: user.role_name || getRoleName(user.role_id),
    status: user.is_active !== false ? 'Active' : 'Inactive',
    avatar: getInitials(user.name || user.username || ''),
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
  }));

  const filteredData = tableData.filter((user) => {
    const matchesSearch =
      !searchText ||
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = selectedRole === 'All Roles' || user.roleName === selectedRole;
    return matchesSearch && matchesRole;
  });

  // User count per role (for the overview cards)
  const userCountByRole = {};
  users.forEach((u) => {
    const rid = u.role_id;
    if (rid) userCountByRole[rid] = (userCountByRole[rid] || 0) + 1;
  });

  const activeCount = users.filter((u) => u.is_active !== false).length;

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);
  const newThisMonth = users.filter(
    (u) => u.date_joined && new Date(u.date_joined) >= thisMonthStart
  ).length;

  // ── Modal handlers ───────────────────────────────────────────────────────
  const showModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({ name: user.name, email: user.email, role: user.role_id });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingUser) {
        await dispatch(
          updateUser({
            id: editingUser.id,
            userData: { name: values.name, email: values.email, role: values.role },
          })
        ).unwrap();
        notify.success('User updated successfully');
      } else {
        await dispatch(
          createUser({
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role,
          })
        ).unwrap();
        notify.success('User created successfully');
      }

      handleCancel();
    } catch (error) {
      notify.error(typeof error === 'string' ? error : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = (record) => {
    Modal.confirm({
      title: 'Delete User',
      content: `Are you sure you want to delete "${record.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteUser(record.id)).unwrap();
          notify.success('User deleted successfully');
        } catch (error) {
          notify.error(typeof error === 'string' ? error : 'Failed to delete user');
        }
      },
    });
  };

  const handleDeleteRole = (role) => {
    Modal.confirm({
      title: 'Delete Role',
      content: `Are you sure you want to delete the role "${role.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteRole(role.id)).unwrap();
          notify.success('Role deleted successfully');
        } catch (error) {
          notify.error(typeof error === 'string' ? error : 'Failed to delete role');
        }
      },
    });
  };

  // ── Table config ─────────────────────────────────────────────────────────
  const getActionsMenu = (record) => ({
    items: [
      {
        key: 'edit',
        label: 'Edit User',
        icon: <EditOutlined />,
        onClick: () => showModal(record),
      },
      { type: 'divider' },
      {
        key: 'delete',
        label: 'Delete User',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteUser(record),
      },
    ],
  });

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="company-cell">
          <Avatar
            size={40}
            style={{
              backgroundColor: record.avatarColor,
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {record.avatar}
          </Avatar>
          <div>
            <div className="company-name">{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'roleName',
      key: 'role',
      render: (role) => (
        <Tag
          className="platform-tag"
          style={{
            backgroundColor: '#f0f0f0',
            borderColor: '#e5e7eb',
            color: '#1f2937',
          }}
        >
          <TeamOutlined style={{ marginRight: 4, fontSize: 12 }} />
          {role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'success' : 'default'} style={{ borderRadius: 6 }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Dropdown menu={getActionsMenu(record)} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined />} className="more-actions-btn" />
        </Dropdown>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page Title */}
      <div className="page-title-section">
        <h1>
          <UserOutlined className="page-title-icon" />
          Users & Roles
        </h1>
      </div>

      {/* Page Content */}
      <div className="page-content">
        {/* Header Card */}
        <Card className="competitors-header-card" bordered={false}>
          <div className="competitors-header-content" style={{ flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '100%',
              }}
            >
              <div className="competitors-header-text">
                <h2 className="competitors-header-title">User Management</h2>
                <Text className="competitors-header-subtitle">
                  Manage system users, roles, and permissions
                </Text>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              <Input
                placeholder="Search users..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ flex: 1, borderRadius: 8 }}
                className="input-custom"
              />

              <Select
                value={selectedRole}
                onChange={setSelectedRole}
                style={{ width: 150, borderRadius: 8 }}
                className="input-custom"
              >
                <Option value="All Roles">All Roles</Option>
                {roles.map((role) => (
                  <Option key={role.id} value={role.name}>
                    {role.name}
                  </Option>
                ))}
              </Select>

              <Button
                type="primary"
                className="add-competitor-btn"
                icon={<UserAddOutlined />}
                onClick={() => showModal()}
              >
                Add User
              </Button>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <div className="competitors-table-wrapper" style={{ marginTop: 24 }}>
          <div className="table-header-section">
            <TeamOutlined className="table-header-icon" />
            <h3 className="table-header-title">All Users</h3>
          </div>

          <Table
            columns={columns}
            dataSource={filteredData}
            loading={usersLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} users`,
            }}
            className="competitors-table"
          />
        </div>

        {/* Role Permissions Section */}
        <Card style={{ marginTop: 24, border: '2px solid #fee2e2', borderRadius: 12 }} bordered={false}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', color: '#1f2937' }}>
              Role Permissions
            </h2>
            <Text type="secondary">Overview of what each role can do in the system</Text>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {roles.map((role) => {
              const count = userCountByRole[role.id] || 0;
              return (
                <Card
                  key={role.id}
                  bordered={true}
                  style={{
                    borderRadius: 8,
                    borderColor: '#e5e7eb',
                    flex: '0 0 calc(50% - 8px)',
                    minWidth: 300,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Space size={12}>
                      <TeamOutlined style={{ fontSize: 18 }} />
                      <Text strong style={{ fontSize: 16 }}>
                        {role.name}
                      </Text>
                      <Tag color={count > 0 ? 'error' : 'default'}>
                        {count} {count === 1 ? 'user' : 'users'}
                      </Tag>
                    </Space>
                    <Space size={8}>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => navigate('/settings/roles-permissions')}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDeleteRole(role)}
                      />
                    </Space>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* System Statistics Section */}
        <Card style={{ marginTop: 24, border: '2px solid #fee2e2', borderRadius: 12 }} bordered={false}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', color: '#1f2937' }}>
               System Statistics
            </h2>
            <Text type="secondary">User activity and system usage metrics</Text>
          </div>

          <Row gutter={[24, 16]}>
            <Col xs={12} sm={6}>
              <div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Total Users
                </Text>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{users.length}</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Active Users
                </Text>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{activeCount}</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Admin Users
                </Text>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>
                  {
                    users.filter((u) => getRoleName(u.role).toLowerCase() === 'admin').length
                  }
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  New This Month
                </Text>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{newThisMonth}</div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        className="add-competitor-modal"
        centered
        title={editingUser ? 'Edit User' : 'Add User'}
        destroyOnClose
        maskClosable={false}
        getContainer={false}
      >
        <Form form={form} layout="vertical" className="add-competitor-form">
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Please enter name' }]}
            className="form-item-custom"
          >
            <Input placeholder="Enter full name" className="input-custom" />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' },
            ]}
            className="form-item-custom"
          >
            <Input placeholder="Enter email address" className="input-custom" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter a password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
              className="form-item-custom"
              extra={<span style={{ fontSize: 12, color: '#94a3b8' }}>Minimum 8 characters</span>}
            >
              <Input.Password placeholder="Enter password" className="input-custom" />
            </Form.Item>
          )}

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select role' }]}
            className="form-item-custom"
          >
            <Select placeholder="Select role" className="input-custom" loading={rolesLoading}>
              {roles.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="modal-footer">
            <Space size={12}>
              <Button onClick={handleCancel} className="cancel-btn">
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={submitting}
                className="submit-btn"
              >
                {editingUser ? 'Update User' : 'Add User'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default UsersRoles;
