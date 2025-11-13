import React, { useState } from 'react';
import { Form, Input, Button, Typography, Row, Col, Card } from 'antd';
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '@services/authService';
import notify from '@utils/notify';
import './Login.css';

const { Title, Text, Link } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authService.login(values.email, values.password);
      
      if (response.success) {
        notify.success('Login successful!');
        // Navigate to dashboard after successful login
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        notify.error(response.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      notify.error('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Row className="login-row">
        {/* Left Side - Branding */}
        <Col xs={0} md={12} lg={14} className="login-left">
          <div className="branding-content">
            <div className="brand-badge">
              <div className="badge-icon">●</div>
              <Text className="badge-text">Live Customer Insights</Text>
            </div>
            
            <Title level={1} className="main-title">
              Voice of Customer
              <br />
              <span className="title-highlight">Analytics Portal</span>
            </Title>
            
            <Text className="subtitle">
              Harness the power of AI to analyze customer sentiment across all
              <br />
              touchpoints. Transform feedback into actionable insights.
            </Text>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon feature-icon-blue">
                  <span>📊</span>
                </div>
                <div className="feature-content">
                  <Title level={4}>Real-time Analytics</Title>
                  <Text>Monitor customer sentiment as it happens</Text>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon feature-icon-purple">
                  <span>⚡</span>
                </div>
                <div className="feature-content">
                  <Title level={4}>AI-Powered Insights</Title>
                  <Text>Advanced sentiment analysis across 8 data sources</Text>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon feature-icon-green">
                  <span>🛡️</span>
                </div>
                <div className="feature-content">
                  <Title level={4}>Enterprise Security</Title>
                  <Text>Enterprise-grade security for your data</Text>
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Right Side - Login Form */}
        <Col xs={24} md={12} lg={10} className="login-right">
          {/* Logo above login card */}
          <div className="top-logo">
            <div className="logo-vq">VQ</div>
            <Text className="logo-title">VOICE OF CUSTOMER</Text>
          </div>

          <Card className="login-card" bordered={false}>
            <div className="login-header">
              <Title level={2} className="welcome-title">Welcome Back</Title>
              <Text className="welcome-subtitle">Enter your credentials to access the portal</Text>
            </div>

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
              className="login-form"
            >
              <Form.Item
                label={<span className="form-label"><span className="required-star">*</span> Email Address</span>}
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input
                  prefix={<MailOutlined className="input-icon" />}
                  placeholder="Enter your email address"
                  size="large"
                  className="custom-input"
                />
              </Form.Item>

              <Form.Item
                label={<span className="form-label"><span className="required-star">*</span> Password</span>}
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Enter your password"
                  size="large"
                  className="custom-input"
                  iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  className="login-button"
                >
                  Sign In to Portal
                </Button>
              </Form.Item>

              <div className="forgot-password-section">
                <Link href="#" className="forgot-link">Forgot your password?</Link>
              </div>

              <div className="help-text">
                Need help? <Link href="#" className="contact-link">Contact your system administrator</Link>
              </div>
            </Form>
          </Card>

          {/* Footer outside card */}
          <div className="footer-text">
            A Product of eOcean (Pvt.) Limited ©2025 Voice of Customer Portal. All rights reserved.
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
