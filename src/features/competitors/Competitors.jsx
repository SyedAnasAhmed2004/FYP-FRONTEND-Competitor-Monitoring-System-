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
import DataTable from '@components/shared-components/Table';
import AddModal from '@components/shared-components/AddModal';
import {
  fetchCompetitors,
  addCompetitor,
  updateCompetitor,
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
  const [editingCompetitor, setEditingCompetitor] = useState(null);
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
    if (competitor.instagram_url) count++;
    if (competitor.facebook_url) count++;
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
      colorClass: 'red',  
    },
    {
      id: 2,
      icon: IconWorld,
      title: 'Total Platforms',
      value: totalPlatforms.toString(),
      subtitle: 'Being tracked',
      colorClass: 'amber',  
    },
  ];

  // Transform API data to table format
  const competitorsData = competitorsArray.map((competitor, index) => {
    const platforms = [];
    if (competitor.website_base_url) platforms.push('website');
    if (competitor.instagram_url) platforms.push('instagram');
    if (competitor.linkedin_url) platforms.push('linkedin');
    if (competitor.facebook_url) platforms.push('facebook');
    if (competitor.twitter_url) platforms.push('twitter');

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
      rawData: competitor,
    };
  });

  const filteredData = competitorsData.filter((competitor) => {
    const matchesSearch = competitor.company
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesPlatform =
      selectedPlatform === 'All Platforms' ||
      competitor.platforms.includes(selectedPlatform.toLowerCase());

    return matchesSearch && matchesPlatform;
  });

  // Handle view report action
  const handleViewReport = (record) => {
    console.log('View report for:', record);
    // Navigate to report page or open modal
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCompetitor(null);
  };

  const handleEditClick = (record) => {
    setEditingCompetitor(record.rawData);
    setIsModalOpen(true);
  };

  // Handle add / edit competitor
  const handleAddCompetitor = async (competitorData) => {
    try {
      const extractUrl = (url) => {
        if (!url) return null;
        if (Array.isArray(url)) return url[0] || null;
        return url;
      };

      const apiData = {
        name: competitorData.name,
        ...(competitorData.stock_symbol ? { stock_symbol: competitorData.stock_symbol } : {}),
      };

      const websiteUrl = extractUrl(competitorData.platforms?.website);
      const linkedinUrl = extractUrl(competitorData.platforms?.linkedin);
      const twitterUrl = extractUrl(competitorData.platforms?.twitter);
      const facebookUrl = extractUrl(competitorData.platforms?.facebook);
      const instagramUrl = extractUrl(competitorData.platforms?.instagram);

      if (editingCompetitor) {
        // When editing, always send all URL fields so cleared ones are explicitly nulled
        apiData.website_base_url = websiteUrl || null;
        apiData.linkedin_url = linkedinUrl || null;
        apiData.twitter_url = twitterUrl || null;
        apiData.facebook_url = facebookUrl || null;
        apiData.instagram_url = instagramUrl || null;
      } else {
        if (websiteUrl) apiData.website_base_url = websiteUrl;
        if (linkedinUrl) apiData.linkedin_url = linkedinUrl;
        if (twitterUrl) apiData.twitter_url = twitterUrl;
        if (facebookUrl) apiData.facebook_url = facebookUrl;
        if (instagramUrl) apiData.instagram_url = instagramUrl;
      }

      if (editingCompetitor) {
        await dispatch(updateCompetitor({ id: editingCompetitor.id, data: apiData })).unwrap();
        message.success('Competitor updated successfully!');
      } else {
        await dispatch(addCompetitor(apiData)).unwrap();
        message.success('Competitor added successfully!');
      }
      handleModalClose();
    } catch (error) {
      message.error((editingCompetitor ? 'Failed to update' : 'Failed to add') + ' competitor: ' + error);
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
                <Option value="Facebook">Facebook</Option>
                <Option value="Twitter">Twitter</Option>
              </Select>
              
<Button 
                type="primary" 
                className="add-competitor-btn"
                icon={<PlusOutlined />}
                onClick={() => { setEditingCompetitor(null); setIsModalOpen(true); }}
              >
                Add Competitor
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Section */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Col xs={24} sm={12} key={stat.id}>
                <Card className={`kpi-card ${stat.colorClass}`} bordered={false}>
                  <div className={`kpi-icon-wrapper ${stat.colorClass}`}>
                    <Icon size={24} color="white" />
                  </div>
                  <p className="kpi-title">{stat.title}</p>
                  <p className="kpi-subtitle">{stat.subtitle}</p>
                  <h3 className="kpi-value">{stat.value}</h3>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Competitors Table */}
        <div className="competitors-table-wrapper" style={{ marginTop: 24 }}>
          <div className="table-header-section">
            <IconChartBar size={20} className="table-header-icon" />
            <h3 className="table-header-title">Competitors Overview</h3>
          </div>
          
          <DataTable
            data={filteredData}
            loading={loading}
            onViewReport={handleViewReport}
            onDelete={handleDeleteCompetitor}
            onEdit={handleEditClick}
            showActions={true}
          />
        </div>
      </div>

      {/* Add Competitor Modal */}
      <AddModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleAddCompetitor}
        initialData={editingCompetitor}
      />
    </div>
  );
}

export default Competitors;