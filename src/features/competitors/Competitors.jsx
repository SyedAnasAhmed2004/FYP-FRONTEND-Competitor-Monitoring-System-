import React, { useState } from 'react';
import { Row, Col, Card, Button, Typography, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { 
  IconTarget, 
  IconWorld, 
  IconTrendingUp,
  IconUsersGroup,
  IconChartBar
} from '@tabler/icons-react';
import StatCard from '@components/common/StatCard';
import CompetitorsTable from '@components/common/CompetitorsTable';
import AddCompetitorModal from '@components/common/AddCompetitorModal';

const { Text } = Typography;
const { Option } = Select;

function Competitors() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');

  // Stats data
  const stats = [
    {
      id: 1,
      icon: IconTarget,
      title: 'Total Competitors',
      value: '6',
      subtitle: 'Actively monitoring',
      iconBgColor: '#fee2e2',
      iconColor: '#dc2626',
    },
    {
      id: 2,
      icon: IconWorld,
      title: 'Total Platforms',
      value: '22',
      subtitle: 'Being tracked',
      iconBgColor: '#dbeafe',
      iconColor: '#2563eb',
    },
    {
      id: 3,
      icon: IconTrendingUp,
      title: 'Avg. Engagement',
      value: '7.0%',
      subtitle: 'Across all competitors',
      iconBgColor: '#dcfce7',
      iconColor: '#16a34a',
    },
  ];

  // Sample competitors data
  const competitorsData = [
    {
      id: 1,
      company: 'TechCorp Global',
      avatarLetter: 'T',
      avatarColor: '#E63946',
      platforms: ['website', 'instagram', 'linkedin', 'twitter'],
      followers: '124.5K',
      engagement: 7.2,
      posts: 156,
    },
    {
      id: 2,
      company: 'InnovateLab Solutions',
      avatarLetter: 'I',
      avatarColor: '#E63946',
      platforms: ['website', 'twitter', 'facebook', 'linkedin'],
      followers: '89.2K',
      engagement: 9.1,
      posts: 203,
    },
    {
      id: 3,
      company: 'FutureTech Industries',
      avatarLetter: 'F',
      avatarColor: '#E63946',
      platforms: ['website', 'instagram', 'twitter', 'linkedin'],
      followers: '187.6K',
      engagement: 5.8,
      posts: 312,
    },
    {
      id: 4,
      company: 'DigitalFirst Enterprise',
      avatarLetter: 'D',
      avatarColor: '#E63946',
      platforms: ['website', 'linkedin', 'twitter'],
      followers: '67.8K',
      engagement: 6.4,
      posts: 89,
    },
    {
      id: 5,
      company: 'NexTech Dynamics',
      avatarLetter: 'N',
      avatarColor: '#E63946',
      platforms: ['website', 'instagram', 'linkedin', 'facebook'],
      followers: '145.3K',
      engagement: 8.7,
      posts: 267,
    },
    {
      id: 6,
      company: 'CloudScale Systems',
      avatarLetter: 'C',
      avatarColor: '#E63946',
      platforms: ['website', 'twitter', 'linkedin'],
      followers: '94.5K',
      engagement: 4.9,
      posts: 178,
    },
  ];

  // Handle view report action
  const handleViewReport = (record) => {
    console.log('View report for:', record);
    // Navigate to report page or open modal
  };

  // Handle add competitor
  const handleAddCompetitor = (competitorData) => {
    console.log('New competitor data:', competitorData);
    // Add logic to save competitor data
    // You can dispatch to Redux or call API here
  };

  return (
    <div>
      {/* Simple Title Bar - Same as Dashboard */}
      <div className="page-title-section">
        <h1>
          <IconUsersGroup size={24} className="page-title-icon-custom" /> 
          Competitors
        </h1>
      </div>

      {/* Page Content */}
      <div className="page-content">
        {/* Header Card with Actions */}
        <Card className="competitors-header-card" bordered={false}>
          <div className="competitors-header-content" style={{ flexDirection: 'column', gap: 16 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              width: '100%'
            }}>
              <div className="competitors-header-text">
                <h2 className="competitors-header-title">Competitor Intelligence</h2>
                <Text className="competitors-header-subtitle">
                  Monitor and analyze your competitors across all digital platforms
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
                placeholder="Search competitors..."
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
                value={selectedPlatform}
                onChange={setSelectedPlatform}
                style={{ width: 180, borderRadius: 8 }}
                className="input-custom"
              >
                <Option value="All Platforms">All Platforms</Option>
                <Option value="Website">Website</Option>
                <Option value="Instagram">Instagram</Option>
                <Option value="LinkedIn">LinkedIn</Option>
                <Option value="Twitter">Twitter</Option>
                <Option value="Facebook">Facebook</Option>
              </Select>
              
              <Button 
                className="ai-discovery-btn"
                icon={<IconTarget size={16} />}
              >
                AI Discovery
              </Button>
              
              <Button 
                type="primary" 
                className="add-competitor-btn"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                Add Competitor
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Section */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {stats.map((stat) => (
            <Col xs={24} sm={12} lg={8} key={stat.id}>
              <StatCard
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                iconBgColor={stat.iconBgColor}
                iconColor={stat.iconColor}
              />
            </Col>
          ))}
        </Row>

        {/* Competitors Table */}
        <div className="competitors-table-wrapper" style={{ marginTop: 24 }}>
          <div className="table-header-section">
            <IconChartBar size={20} className="table-header-icon" />
            <h3 className="table-header-title">Competitors Overview</h3>
          </div>
          
          <CompetitorsTable 
            data={competitorsData}
            onViewReport={handleViewReport}
            showActions={true}
          />
        </div>
      </div>

      {/* Add Competitor Modal */}
      <AddCompetitorModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCompetitor}
      />
    </div>
  );
}

export default Competitors;