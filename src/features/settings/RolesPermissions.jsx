import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Switch,
  Typography,
  Checkbox,
  Divider,
  Row,
  Col,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
} from 'antd';
import {
  SafetyOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

function RolesPermissions() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();

  // Permissions data
  const permissionsData = [
    { module: 'Dashboard', view: true, create: false, edit: false, delete: false },
    { module: 'Users', view: true, create: true, edit: true, delete: true },
    { module: 'Reports', view: true, create: true, edit: true, delete: false },
    { module: 'Settings', view: true, create: false, edit: true, delete: false },
    { module: 'Analytics', view: true, create: true, edit: true, delete: true },
  ];

  // Roles data
  const [roles, setRoles] = useState([
    {
      key: '1',
      role: 'Admin',
      description: 'Full system access with all permissions',
      users: 5,
      color: 'red',
      permissions: {
        Dashboard: { view: true, create: true, edit: true, delete: true },
        Users: { view: true, create: true, edit: true, delete: true },
        Reports: { view: true, create: true, edit: true, delete: true },
        Settings: { view: true, create: true, edit: true, delete: true },
        Analytics: { view: true, create: true, edit: true, delete: true },
      },
    },
    {
      key: '2',
      role: 'Manager',
      description: 'Manage team and view reports',
      users: 12,
      color: 'blue',
      permissions: {
        Dashboard: { view: true, create: false, edit: false, delete: false },
        Users: { view: true, create: true, edit: true, delete: false },
        Reports: { view: true, create: true, edit: true, delete: false },
        Settings: { view: true, create: false, edit: false, delete: false },
        Analytics: { view: true, create: false, edit: false, delete: false },
      },
    },
    {
      key: '3',
      role: 'User',
      description: 'Basic access to view and create content',
      users: 45,
      color: 'green',
      permissions: {
        Dashboard: { view: true, create: false, edit: false, delete: false },
        Users: { view: true, create: false, edit: false, delete: false },
        Reports: { view: true, create: true, edit: false, delete: false },
        Settings: { view: false, create: false, edit: false, delete: false },
        Analytics: { view: true, create: false, edit: false, delete: false },
      },
    },
  ]);

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const columns = [
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (text, record) => (
        <Space>
          <SafetyOutlined style={{ fontSize: 18, color: record.color }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Users',
      dataIndex: 'users',
      key: 'users',
      render: (users) => <Tag color="blue">{users} Users</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Role">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditRole(record)}
            >
              Edit
            </Button>
          </Tooltip>
          {record.role !== 'Admin' && (
            <Tooltip title="Delete Role">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDeleteRole(record.key)}
              >
                Delete
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleEditRole = (role) => {
    setEditingRole(role);
    form.setFieldsValue({
      role: role.role,
      description: role.description,
    });
    setIsModalVisible(true);
  };

  const handleDeleteRole = (key) => {
    setRoles(roles.filter(role => role.key !== key));
    message.success('Role deleted successfully!');
  };

  const handleAddRole = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingRole) {
        setRoles(roles.map(role =>
          role.key === editingRole.key
            ? { ...role, ...values }
            : role
        ));
        message.success('Role updated successfully!');
      } else {
        const newRole = {
          key: String(roles.length + 1),
          users: 0,
          color: 'purple',
          permissions: {
            Dashboard: { view: true, create: false, edit: false, delete: false },
            Users: { view: true, create: false, edit: false, delete: false },
            Reports: { view: true, create: false, edit: false, delete: false },
            Settings: { view: false, create: false, edit: false, delete: false },
            Analytics: { view: true, create: false, edit: false, delete: false },
          },
          ...values,
        };
        setRoles([...roles, newRole]);
        message.success('Role created successfully!');
      }
      setIsModalVisible(false);
    });
  };

  const expandedRowRender = (record) => {
    const permissionColumns = [
      {
        title: 'Module',
        dataIndex: 'module',
        key: 'module',
        render: (text) => <Text strong>{text}</Text>,
      },
      {
        title: 'View',
        dataIndex: 'view',
        key: 'view',
        align: 'center',
        render: (_, perm) => (
          <Checkbox
            checked={record.permissions[perm.module]?.view}
            onChange={(e) => handlePermissionChange(record.key, perm.module, 'view', e.target.checked)}
          />
        ),
      },
      {
        title: 'Create',
        dataIndex: 'create',
        key: 'create',
        align: 'center',
        render: (_, perm) => (
          <Checkbox
            checked={record.permissions[perm.module]?.create}
            onChange={(e) => handlePermissionChange(record.key, perm.module, 'create', e.target.checked)}
          />
        ),
      },
      {
        title: 'Edit',
        dataIndex: 'edit',
        key: 'edit',
        align: 'center',
        render: (_, perm) => (
          <Checkbox
            checked={record.permissions[perm.module]?.edit}
            onChange={(e) => handlePermissionChange(record.key, perm.module, 'edit', e.target.checked)}
          />
        ),
      },
      {
        title: 'Delete',
        dataIndex: 'delete',
        key: 'delete',
        align: 'center',
        render: (_, perm) => (
          <Checkbox
            checked={record.permissions[perm.module]?.delete}
            onChange={(e) => handlePermissionChange(record.key, perm.module, 'delete', e.target.checked)}
          />
        ),
      },
    ];

    const permData = Object.keys(record.permissions).map(module => ({
      module,
      ...record.permissions[module],
    }));

    return (
      <div style={{ padding: '16px', background: '#fafafa' }}>
        <Title level={5}>
          <LockOutlined /> Permissions for {record.role}
        </Title>
        <Table
          columns={permissionColumns}
          dataSource={permData}
          pagination={false}
          size="small"
        />
      </div>
    );
  };

  const handlePermissionChange = (roleKey, module, permission, value) => {
    setRoles(roles.map(role => {
      if (role.key === roleKey) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [module]: {
              ...role.permissions[module],
              [permission]: value,
            },
          },
        };
      }
      return role;
    }));
    message.success('Permission updated!');
  };

  return (
    <div>
      <div className="page-title-section">
        <h1><SafetyOutlined /> Roles & Permissions</h1>
      </div>
      
      <div className="page-content">
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">Define roles and manage permissions for each role</Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>
                  {roles.length}
                </div>
                <Text type="secondary">Total Roles</Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>
                  {roles.reduce((sum, role) => sum + role.users, 0)}
                </div>
              <Text type="secondary">Total Users</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#faad14' }}>
                5
              </div>
              <Text type="secondary">Modules</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Text strong style={{ fontSize: 16 }}>Role Permissions Matrix</Text>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRole}
          >
            Add New Role
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={roles}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: (expanded, record) => {
              setExpandedRowKeys(expanded ? [record.key] : []);
            },
          }}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="role"
            label="Role Name"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input prefix={<SafetyOutlined />} placeholder="Enter role name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter role description"
            />
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </div>
  );
}

export default RolesPermissions;
