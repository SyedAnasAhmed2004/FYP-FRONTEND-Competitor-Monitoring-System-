import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Switch, 
  Typography,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Divider
} from 'antd';
import {
  SafetyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const { Text } = Typography;

function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState('Testing Role');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();

  // Roles list
  const roles = [
    { id: 1, name: 'Testing Role' },
    { id: 2, name: 'Admin' },
    { id: 3, name: 'Manager' },
    { id: 4, name: 'Analyst' },
    { id: 5, name: 'Viewer' },
  ];

  // Permissions data
  const [permissions, setPermissions] = useState({
    'Testing Role': {
      ROLES: true,
      USERS: true,
      'APP STORE': false,
      'APP LINK': true,
      SETTINGS: true,
    },
    'Admin': {
      ROLES: true,
      USERS: true,
      'APP STORE': true,
      'APP LINK': true,
      SETTINGS: true,
    },
  });

  const showModal = (role = null) => {
    setEditingRole(role);
    if (role) {
      form.setFieldsValue({ roleName: role });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRole(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);
      handleCancel();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePermissionToggle = (module, checked) => {
    setPermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [module]: checked
      }
    }));
  };

  const currentPermissions = permissions[selectedRole] || {};

  return (
    <div>
      {/* Page Title */}
      <div className="page-title-section">
        <h1>
          <SafetyOutlined className="page-title-icon" /> 
          Roles & Permissions
        </h1>
      </div>

      {/* Page Content */}
      <div className="page-content">
        <Row gutter={24}>
          {/* Left Side - Roles List */}
          <Col span={6}>
            <Card 
              className="roles-list-card" 
              bordered={false}
              bodyStyle={{ padding: '20px' }}
            >
              <h3 style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                marginBottom: 20,
                color: '#1f2937'
              }}>
                Roles
              </h3>
              
              <div className="roles-list">
                {roles.map(role => (
                  <div
                    key={role.id}
                    className={`role-item ${selectedRole === role.name ? 'active' : ''}`}
                    onClick={() => setSelectedRole(role.name)}
                  >
                    <SafetyOutlined style={{ marginRight: 8, fontSize: 14 }} />
                    {role.name}
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Right Side - Permissions */}
          <Col span={18}>
            <Card 
              className="permissions-card" 
              bordered={false}
              bodyStyle={{ padding: '24px' }}
            >
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: 32 
              }}>
                <div>
                  <h2 style={{ 
                    fontSize: 20, 
                    fontWeight: 600, 
                    marginBottom: 4,
                    color: '#1f2937'
                  }}>
                    Permissions
                  </h2>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {selectedRole}
                  </Text>
                </div>
                
                <Space size={12}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                    style={{
                      backgroundColor: '#E63946',
                      borderColor: '#E63946',
                      height: 36,
                      fontSize: 14,
                      fontWeight: 500
                    }}
                  >
                    Add Role
                  </Button>
                  <Button 
                    icon={<EditOutlined />}
                    onClick={() => showModal(selectedRole)}
                    style={{
                      height: 36,
                      fontSize: 14,
                      fontWeight: 500,
                      borderColor: '#d1d5db'
                    }}
                  >
                    Edit Role
                  </Button>
                  <Button 
                    danger
                    icon={<DeleteOutlined />}
                    style={{
                      height: 36,
                      fontSize: 14,
                      fontWeight: 500
                    }}
                  >
                    Delete Role
                  </Button>
                </Space>
              </div>

              {/* Permissions List */}
              <div className="permissions-list">
                {Object.entries(currentPermissions).map(([module, isEnabled], index) => (
                  <div key={module}>
                    <div className="permission-row">
                      <div>
                        <h4 style={{ 
                          fontSize: 14, 
                          fontWeight: 600, 
                          marginBottom: 4,
                          color: '#1f2937',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {module}
                        </h4>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Manage access to {module} functionality
                        </Text>
                      </div>
                      
                      <Switch 
                        checked={isEnabled}
                        onChange={(checked) => handlePermissionToggle(module, checked)}
                      />
                    </div>
                    {index < Object.keys(currentPermissions).length - 1 && (
                      <Divider style={{ margin: '20px 0' }} />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Add/Edit Role Modal */}
      <Modal
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        className="add-competitor-modal"
        centered
        title={editingRole ? 'Edit Role' : 'Add Role'}
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
            label="Role Name"
            name="roleName"
            rules={[{ required: true, message: 'Please enter role name' }]}
            className="form-item-custom"
          >
            <Input placeholder="Enter role name" className="input-custom" />
          </Form.Item>

          <div className="modal-footer">
            <Space size={12}>
              <Button onClick={handleCancel} className="cancel-btn">
                Cancel
              </Button>
              <Button type="primary" onClick={handleSubmit} className="submit-btn">
                {editingRole ? 'Update Role' : 'Add Role'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default RolesPermissions;
