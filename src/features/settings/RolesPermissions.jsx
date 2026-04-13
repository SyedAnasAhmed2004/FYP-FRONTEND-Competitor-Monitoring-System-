import React, { useState, useEffect } from 'react';
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
  Divider,
} from 'antd';
import { SafetyOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions,
  selectRoles,
  selectRolesLoading,
} from './settingsSlice';
import notify from '@utils/notify';

const { Text } = Typography;

// The 5 permission keys the backend understands
const PERMISSION_KEYS = ['dashboard', 'competitors', 'ai_assistant', 'reports', 'settings'];

// Human-readable labels (CSS textTransform: uppercase handles capitalisation)
const PERMISSION_DISPLAY = {
  dashboard: 'Dashboard',
  competitors: 'Competitors',
  ai_assistant: 'AI Assistant',
  reports: 'Reports',
  settings: 'Settings',
};

function RolesPermissions() {
  const dispatch = useAppDispatch();

  const roles = useAppSelector(selectRoles);
  const rolesLoading = useAppSelector(selectRolesLoading);

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [localPermissions, setLocalPermissions] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // ── Data fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  // Auto-select first role once the list loads
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles]);

  // Sync local permissions whenever the selected role or roles list changes
  useEffect(() => {
    if (!selectedRoleId || !roles.length) return;
    const role = roles.find((r) => r.id === selectedRoleId);
    if (role) {
      const perms = {};
      PERMISSION_KEYS.forEach((key) => {
        perms[key] = role.permissions?.[key] ?? false;
      });
      setLocalPermissions(perms);
    }
  }, [selectedRoleId, roles]);

  // ── Derived values ───────────────────────────────────────────────────────
  const selectedRoleObj = roles.find((r) => r.id === selectedRoleId);

  // ── Permission toggle ────────────────────────────────────────────────────
  const handlePermissionToggle = async (key, checked) => {
    const newPermissions = { ...localPermissions, [key]: checked };
    // Optimistic update
    setLocalPermissions(newPermissions);

    try {
      await dispatch(
        updateRolePermissions({ id: selectedRoleId, permissions: newPermissions })
      ).unwrap();
    } catch (error) {
      // Revert on failure
      setLocalPermissions((prev) => ({ ...prev, [key]: !checked }));
      notify.error('Failed to update permissions');
    }
  };

  // ── Role modal handlers ──────────────────────────────────────────────────
  const showModal = (role = null) => {
    setEditingRole(role); // null = add, object = edit
    if (role) {
      form.setFieldsValue({ roleName: role.name });
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
      setSubmitting(true);

      if (editingRole) {
        await dispatch(
          updateRole({ id: editingRole.id, data: { name: values.roleName } })
        ).unwrap();
        notify.success('Role updated successfully');
      } else {
        const newRole = await dispatch(createRole({ name: values.roleName })).unwrap();
        notify.success('Role created successfully');
        // Auto-select the newly created role
        if (newRole?.id) setSelectedRoleId(newRole.id);
      }

      handleCancel();
    } catch (error) {
      notify.error(typeof error === 'string' ? error : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = () => {
    if (!selectedRoleObj) return;
    Modal.confirm({
      title: 'Delete Role',
      content: `Are you sure you want to delete the role "${selectedRoleObj.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(deleteRole(selectedRoleId)).unwrap();
          notify.success('Role deleted successfully');
          setSelectedRoleId(null);
        } catch (error) {
          notify.error(typeof error === 'string' ? error : 'Failed to delete role');
        }
      },
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────
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
          {/* Left Side – Roles List */}
          <Col span={6}>
            <Card
              className="roles-list-card"
              bordered={false}
              bodyStyle={{ padding: '20px' }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 20,
                  color: '#1f2937',
                }}
              >
                Roles
              </h3>

              <div className="roles-list">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`role-item ${selectedRoleId === role.id ? 'active' : ''}`}
                    onClick={() => setSelectedRoleId(role.id)}
                  >
                    <SafetyOutlined style={{ marginRight: 8, fontSize: 14 }} />
                    {role.name}
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Right Side – Permissions */}
          <Col span={18}>
            <Card
              className="permissions-card"
              bordered={false}
              bodyStyle={{ padding: '24px' }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 32,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      marginBottom: 4,
                      color: '#1f2937',
                    }}
                  >
                    Permissions
                  </h2>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {selectedRoleObj?.name || '—'}
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
                      fontWeight: 500,
                    }}
                  >
                    Add Role
                  </Button>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => showModal(selectedRoleObj)}
                    disabled={!selectedRoleObj}
                    style={{
                      height: 36,
                      fontSize: 14,
                      fontWeight: 500,
                      borderColor: '#d1d5db',
                    }}
                  >
                    Edit Role
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteRole}
                    disabled={!selectedRoleObj}
                    style={{ height: 36, fontSize: 14, fontWeight: 500 }}
                  >
                    Delete Role
                  </Button>
                </Space>
              </div>

              {/* Permissions List */}
              <div className="permissions-list">
                {PERMISSION_KEYS.map((key, index) => (
                  <div key={key}>
                    <div className="permission-row">
                      <div>
                        <h4
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            marginBottom: 4,
                            color: '#1f2937',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {PERMISSION_DISPLAY[key]}
                        </h4>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Manage access to {PERMISSION_DISPLAY[key]} functionality
                        </Text>
                      </div>

                      <Switch
                        checked={localPermissions[key] ?? false}
                        disabled={!selectedRoleObj}
                        onChange={(checked) => handlePermissionToggle(key, checked)}
                      />
                    </div>
                    {index < PERMISSION_KEYS.length - 1 && (
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
        <Form form={form} layout="vertical" className="add-competitor-form">
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
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={submitting}
                className="submit-btn"
              >
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
