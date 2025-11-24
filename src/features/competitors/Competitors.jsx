import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Button, Typography, Input, Select, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { 
  IconTarget, 
  IconWorld, 
  IconTrendingUp,
  IconUsersGroup,
  IconChartBar
} from '@tabler/icons-react';
import StatCard from '@components/shared-components/StatCard';
import DataTable from '@components/shared-components/Table';
import AddModal from '@components/shared-components/AddModal';
import {
  fetchCompetitors,
  addCompetitor,
  deleteCompetitor,
  selectCompetitors,
  selectCompetitorsLoading,
  selectCompetitorsError,
} from './competitorsSlice';

const { Text } = Typography;
const { Option } = Select;

function Competitors() {
  const dispatch = useDispatch();
  const competitors = useSelector(selectCompetitors);
  const loading = useSelector(selectCompetitorsLoading);
  const error = useSelector(selectCompetitorsError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');

  // Fetch competitors on component mount
  useEffect(() => {
    console.log('🔄 Fetching competitors...');
    dispatch(fetchCompetitors())
      .unwrap()
      .then((data) => {
        console.log('✅ Competitors fetched successfully:', data);
      })
      .catch((error) => {
        console.error('❌ Failed to fetch competitors:', error);
      });
  }, [dispatch]);

  // Show error message if API call fails
  useEffect(() => {
    if (error) {
      message.error(`Failed to load competitors: ${error}`);
      console.error('Competitors error:', error);
    }
  }, [error]);

  // Ensure competitors is always an array
  const competitorsArray = Array.isArray(competitors) ? competitors : [];

  // Calculate stats from real data
  const totalCompetitors = competitorsArray.length;
  
  // Count total platforms (each competitor can have multiple)
  const totalPlatforms = competitorsArray.reduce((total, competitor) => {
    let count = 0;
    if (competitor.website_base_url) count++;
    if (competitor.linkedin_url) count++;
    if (competitor.facebook_url) count++;
    if (competitor.instagram_url) count++;
    if (competitor.twitter_url) count++;
    return total + count;
  }, 0);

  // Stats data (calculated from API data)
  const stats = [
    {
      id: 1,
      icon: IconTarget,
      title: 'Total Competitors',
      value: totalCompetitors.toString(),
      subtitle: 'Actively monitoring',
      iconBgColor: '#fee2e2',
      iconColor: '#dc2626',
    },
    {
      id: 2,
      icon: IconWorld,
      title: 'Total Platforms',
      value: totalPlatforms.toString(),
      subtitle: 'Being tracked',
      iconBgColor: '#dbeafe',
      iconColor: '#2563eb',
    },
    {
      id: 3,
      icon: IconTrendingUp,
      title: 'Avg. Engagement',
      value: 'N/A',
      subtitle: 'Coming soon',
      iconBgColor: '#dcfce7',
      iconColor: '#16a34a',
    },
  ];

  // Transform API data to table format
  const competitorsData = competitorsArray.map((competitor, index) => {
    const platforms = [];
    if (competitor.website_base_url) platforms.push('website');
    if (competitor.instagram_url) platforms.push('instagram');
    if (competitor.linkedin_url) platforms.push('linkedin');
    if (competitor.twitter_url) platforms.push('twitter');
    if (competitor.facebook_url) platforms.push('facebook');

    // Generate avatar letter and color
    const avatarLetter = competitor.name ? competitor.name.charAt(0).toUpperCase() : 'C';
    const colors = ['#E63946', '#F77F00', '#06AED5', '#8338EC', '#FB5607', '#3A86FF'];
    const avatarColor = colors[index % colors.length];

    return {
      id: competitor.id,
      company: competitor.name,
      avatarLetter,
      avatarColor,
      platforms,
      followers: 'N/A', // This data will come from scraping
      engagement: 0, // This data will come from scraping
      posts: 0, // This data will come from scraping
      rawData: competitor, // Keep original data for editing
    };
  });

  // Handle view report action
  const handleViewReport = (record) => {
    console.log('View report for:', record);
    // Navigate to report page or open modal
  };

  // Handle add competitor
  const handleAddCompetitor = async (competitorData) => {
    try {
      console.log('Received competitor data:', competitorData);

      // Transform platform data to match API format
      // Only include fields that have valid URLs
      const apiData = {
        name: competitorData.name,
      };

      // Helper function to ensure we get a string, not an array
      const extractUrl = (url) => {
        if (!url) return null;
        if (Array.isArray(url)) return url[0] || null;
        return url;
      };

      // Only add URL fields if they exist and are not empty
      const websiteUrl = extractUrl(competitorData.platforms?.website);
      if (websiteUrl) {
        apiData.website_base_url = websiteUrl;
      }
      
      const linkedinUrl = extractUrl(competitorData.platforms?.linkedin);
      if (linkedinUrl) {
        apiData.linkedin_url = linkedinUrl;
      }
      
      const facebookUrl = extractUrl(competitorData.platforms?.facebook);
      if (facebookUrl) {
        apiData.facebook_url = facebookUrl;
      }
      
      const instagramUrl = extractUrl(competitorData.platforms?.instagram);
      if (instagramUrl) {
        apiData.instagram_url = instagramUrl;
      }
      
      const twitterUrl = extractUrl(competitorData.platforms?.twitter);
      if (twitterUrl) {
        apiData.twitter_url = twitterUrl;
      }

      console.log('Sending to API:', apiData);

      await dispatch(addCompetitor(apiData)).unwrap();
      message.success('Competitor added successfully!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Add competitor error:', error);
      message.error('Failed to add competitor: ' + error);
    }
  };

  // Handle delete competitor
  const handleDeleteCompetitor = async (competitorId) => {
    try {
      await dispatch(deleteCompetitor(competitorId)).unwrap();
      message.success('Competitor deleted successfully!');
    } catch (error) {
      message.error('Failed to delete competitor: ' + error);
    }
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
          
          <DataTable 
            data={competitorsData}
            loading={loading}
            onViewReport={handleViewReport}
            onDelete={handleDeleteCompetitor}
            showActions={true}
          />
        </div>
      </div>

      {/* Add Competitor Modal */}
      <AddModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCompetitor}
      />
    </div>
  );
}

export default Competitors;