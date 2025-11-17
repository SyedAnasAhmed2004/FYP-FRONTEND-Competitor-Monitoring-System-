import React, { useState } from 'react';
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
  Statistic
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
  SafetyOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

function UsersRoles() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [form] = Form.useForm();

  // Sample data
  const [users] = useState([
    {
      key: '1',
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      status: 'Active',
      avatar: 'JD',
      avatarColor: '#E63946',
    },
    {
      key: '2',
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      role: 'Manager',
      status: 'Active',
      avatar: 'SJ',
      avatarColor: '#2563eb',
    },
    {
      key: '3',
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.w@example.com',
      role: 'Analyst',
      status: 'Inactive',
      avatar: 'MW',
      avatarColor: '#16a34a',
    },
    {
      key: '4',
      id: 4,
      name: 'Emily Brown',
      email: 'emily.b@example.com',
      role: 'Viewer',
      status: 'Active',
      avatar: 'EB',
      avatarColor: '#9333ea',
    },
  ]);

  const roles = ['Admin', 'Manager', 'Analyst', 'Viewer'];

  const showModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue(user);
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
      console.log('Form values:', values);
      // Add logic to save user
      handleCancel();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Actions menu
  const getActionsMenu = (record) => ({
    items: [
      {
        key: 'edit',
        label: 'Edit User',
        icon: <EditOutlined />,
        onClick: () => showModal(record),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Delete User',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => console.log('Delete user:', record),
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
              fontSize: 16
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
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag 
          className="platform-tag"
          style={{ 
            backgroundColor: '#f0f0f0',
            borderColor: '#e5e7eb',
            color: '#1f2937'
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
        <Tag 
          color={status === 'Active' ? 'success' : 'default'}
          style={{ borderRadius: 6 }}
        >
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
        <Dropdown 
          menu={getActionsMenu(record)} 
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            className="more-actions-btn"
          />
        </Dropdown>
      ),
    },
  ];

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
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              width: '100%'
            }}>
              <div className="competitors-header-text">
                <h2 className="competitors-header-title">User Management</h2>
                <Text className="competitors-header-subtitle">
                  Manage system users, roles, and permissions
                </Text>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              width: '100%'
            }}>
              <Input
                placeholder="Search users..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ 
                  flex: 1,
                  borderRadius: 8
                }}
                className="input-custom"
              />
              
              <Select
                value={selectedRole}
                onChange={setSelectedRole}
                style={{ width: 150, borderRadius: 8 }}
                className="input-custom"
              >
                <Option value="All Roles">All Roles</Option>
                {roles.map(role => (
                  <Option key={role} value={role}>{role}</Option>
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
            dataSource={users}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} users`,
            }}
            className="competitors-table"
          />
        </div>

        {/* Role Permissions Section */}
        <Card style={{ marginTop: 24 }} bordered={false}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, marginBottom: 4 }}>Role Permissions</h2>
            <Text type="secondary">Overview of what each role can do in the system</Text>
          </div>
          
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Card 
              bordered={true} 
              style={{ 
                borderRadius: 8, 
                borderColor: '#e5e7eb',
                flex: '0 0 calc(50% - 8px)',
                minWidth: 300
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={12}>
                  <UserOutlined style={{ fontSize: 18 }} />
                  <Text strong style={{ fontSize: 16 }}>Testing Role</Text>
                  <Tag color="default">1 user</Tag>
                </Space>
                <Space size={8}>
                  <Button type="text" icon={<EditOutlined />} size="small" />
                  <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Space>
              </div>
            </Card>
            
            <Card 
              bordered={true} 
              style={{ 
                borderRadius: 8, 
                borderColor: '#e5e7eb',
                flex: '0 0 calc(50% - 8px)',
                minWidth: 300
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={12}>
                  <TeamOutlined style={{ fontSize: 18 }} />
                  <Text strong style={{ fontSize: 16 }}>Admin</Text>
                  <Tag color="error">8 users</Tag>
                </Space>
                <Space size={8}>
                  <Button type="text" icon={<EditOutlined />} size="small" />
                  <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Space>
              </div>
            </Card>
          </div>
        </Card>

        {/* System Statistics Section */}
        <Card style={{ marginTop: 24 }} bordered={false}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, marginBottom: 4 }}>System Statistics</h2>
            <Text type="secondary">User activity and system usage metrics</Text>
          </div>
          
          <Row gutter={[24, 16]}>
            <Col xs={12} sm={6}>
              <div>
                <Text type="secondary" style={{ fontSize: 14 }}>Total Users</Text>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>10</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div>
                <Text type="secondary" style={{ fontSize: 14 }}>Active Users</Text>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>10</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div>
                <Text type="secondary" style={{ fontSize: 14 }}>Admin Users</Text>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>8</div>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div>
                <Text type="secondary" style={{ fontSize: 14 }}>New This Month</Text>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>1</div>
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
        <Form
          form={form}
          layout="vertical"
          className="add-competitor-form"
        >
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
              { type: 'email', message: 'Please enter valid email' }
            ]}
            className="form-item-custom"
          >
            <Input placeholder="Enter email address" className="input-custom" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select role' }]}
            className="form-item-custom"
          >
            <Select placeholder="Select role" className="input-custom">
              {roles.map(role => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
          </Form.Item>

          <div className="modal-footer">
            <Space size={12}>
              <Button onClick={handleCancel} className="cancel-btn">
                Cancel
              </Button>
              <Button type="primary" onClick={handleSubmit} className="submit-btn">
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
