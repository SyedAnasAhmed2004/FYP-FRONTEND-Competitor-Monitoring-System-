import React from 'react';
import { Row, Col, Card, Typography, List } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

const { Title } = Typography;

function Dashboard() {
  return (
    <div>
      <div className="page-title-section">
        <h1><BarChartOutlined className="page-title-icon" /> Dashboard</h1>
      </div>
      <div className="page-content">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card title="📈 Total Users" bordered={false}>
              <Title level={3} className="card-title-value">1,234</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="💰 Revenue" bordered={false}>
              <Title level={3} className="card-title-value">$56,789</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="🛠️ Projects" bordered={false}>
              <Title level={3} className="card-title-value">12</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="🕒 Active" bordered={false}>
              <Title level={3} className="card-title-value">5</Title>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="dashboard-second-row">
          <Col span={8}>
            <Card title="Card 1 📊" bordered={false}>
              <List>
                <List.Item>Item 1</List.Item>
                <List.Item>Item 2</List.Item>
                <List.Item>Item 3</List.Item>
              </List>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Card 2 📊" bordered={false}>
              <List>
                <List.Item>Item A</List.Item>
                <List.Item>Item B</List.Item>
                <List.Item>Item C</List.Item>
              </List>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Card 3 📊" bordered={false}>
              <List>
                <List.Item>Detail X</List.Item>
                <List.Item>Detail Y</List.Item>
                <List.Item>Detail Z</List.Item>
              </List>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Dashboard;