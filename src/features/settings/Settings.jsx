import React from 'react';
import { Row, Col, Card, Typography, Switch, Button, Divider, Input, Select } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

function Settings() {
  return (
    <div>
      <div className="page-title-section">
        <h1><SettingOutlined /> Settings</h1>
      </div>
      <div className="page-content">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Account Settings" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Name</Text>
                <Input placeholder="Enter your name" style={{ marginTop: 8 }} />
              </Col>
              <Col span={12}>
                <Text strong>Email</Text>
                <Input placeholder="Enter your email" style={{ marginTop: 8 }} />
              </Col>
              <Col span={12}>
                <Text strong>Company</Text>
                <Input placeholder="Enter company name" style={{ marginTop: 8 }} />
              </Col>
              <Col span={12}>
                <Text strong>Role</Text>
                <Select defaultValue="admin" style={{ width: '100%', marginTop: 8 }}>
                  <Option value="admin">Admin</Option>
                  <Option value="user">User</Option>
                  <Option value="manager">Manager</Option>
                </Select>
              </Col>
            </Row>
            <Divider />
            <Button type="primary">Save Changes</Button>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Notification Preferences" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Email Notifications</Text>
                  <br />
                  <Text type="secondary">Receive email updates about your account</Text>
                </div>
                <Switch defaultChecked />
              </Col>
              <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Push Notifications</Text>
                  <br />
                  <Text type="secondary">Receive push notifications in browser</Text>
                </div>
                <Switch defaultChecked />
              </Col>
              <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>SMS Notifications</Text>
                  <br />
                  <Text type="secondary">Receive text messages for important updates</Text>
                </div>
                <Switch />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Privacy & Security" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Two-Factor Authentication</Text>
                  <br />
                  <Text type="secondary">Add an extra layer of security to your account</Text>
                </div>
                <Switch />
              </Col>
              <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Profile Visibility</Text>
                  <br />
                  <Text type="secondary">Make your profile visible to other users</Text>
                </div>
                <Switch defaultChecked />
              </Col>
              <Col span={24}>
                <Button danger>Change Password</Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      </div>
    </div>
  );
}

export default Settings;
