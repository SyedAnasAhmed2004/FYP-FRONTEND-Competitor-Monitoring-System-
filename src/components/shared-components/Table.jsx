import React from 'react';
import { Table, Avatar, Progress, Button, Dropdown } from 'antd';
import { MoreOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  IconWorld, 
  IconBrandInstagram, 
  IconBrandLinkedin, 
  IconBrandTwitter,
  IconBrandFacebook 
} from '@tabler/icons-react';
import PropTypes from 'prop-types';

/**
 * Reusable Competitors Table Component
 * Displays competitor data with platforms, followers, engagement, and posts
 */
const CompetitorsTable = ({ 
  data = [], 
  loading = false, 
  onViewReport,
  onDelete,
  showActions = true 
}) => {
  
  // Platform icon mapping
  const platformIcons = {
    website: { icon: IconWorld, color: '#3b82f6' },
    instagram: { icon: IconBrandInstagram, color: '#E4405F' },
    linkedin: { icon: IconBrandLinkedin, color: '#0A66C2' },
    twitter: { icon: IconBrandTwitter, color: '#1DA1F2' },
    facebook: { icon: IconBrandFacebook, color: '#1877F2' },
  };

  // Render platform tags
  const renderPlatforms = (platforms) => {
    return (
      <div className="platform-tags-container">
        {platforms.map((platform) => {
          const platformConfig = platformIcons[platform.toLowerCase()];
          if (!platformConfig) return null;
          
          const IconComponent = platformConfig.icon;
          return (
            <span 
              key={platform} 
              className="platform-tag"
            >
              <IconComponent size={14} />
              <span className="platform-name">{platform}</span>
            </span>
          );
        })}
      </div>
    );
  };

  // Get platform icon for menu
  const getPlatformIcon = (platform) => {
    const platformConfig = platformIcons[platform.toLowerCase()];
    if (!platformConfig) return <IconWorld size={14} />;
    const IconComponent = platformConfig.icon;
    return <IconComponent size={14} />;
  };

  // Actions dropdown menu
  const getActionsMenu = (record) => ({
    items: [
      // Platform links
      ...(record.platforms || []).map((platform) => ({
        key: `open-${platform}`,
        label: `Open ${platform}`,
        icon: getPlatformIcon(platform),
        onClick: () => {
          // Get the platform URL from rawData
          const urlMap = {
            website: record.rawData?.website_base_url,
            linkedin: record.rawData?.linkedin_url,
            facebook: record.rawData?.facebook_url,
            instagram: record.rawData?.instagram_url,
            twitter: record.rawData?.twitter_url,
          };
          const url = urlMap[platform];
          if (url) {
            window.open(url, '_blank');
          }
        },
      })),
      // Divider
      {
        type: 'divider',
      },
      // Delete option
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          if (onDelete) {
            onDelete(record.id);
          }
        },
      },
    ],
  });

  // Table columns
  const columns = [
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      width: 280,
      render: (text, record) => (
        <div className="company-cell">
          <Avatar 
            size={40} 
            className="company-avatar"
            style={{ 
              backgroundColor: record.avatarColor || '#E63946',
              fontWeight: 600,
              fontSize: 16
            }}
          >
            {record.avatarLetter}
          </Avatar>
          <span className="company-name">{text}</span>
        </div>
      ),
    },
    {
      title: 'Platforms',
      dataIndex: 'platforms',
      key: 'platforms',
      render: (platforms) => renderPlatforms(platforms),
    },
    {
      title: 'Followers',
      dataIndex: 'followers',
      key: 'followers',
      width: 130,
      render: (followers) => (
        <span className="followers-text">{followers}</span>
      ),
    },
    {
      title: 'Engagement',
      dataIndex: 'engagement',
      key: 'engagement',
      width: 150,
      render: (engagement) => (
        <div className="engagement-cell">
          <span className="engagement-percentage">{engagement}%</span>
          <Progress 
            percent={engagement} 
            showInfo={false}
            strokeColor="#E63946"
            trailColor="#fee2e2"
            size="small"
            className="engagement-progress"
          />
        </div>
      ),
    },
    {
      title: 'Posts',
      dataIndex: 'posts',
      key: 'posts',
      width: 100,
      render: (posts) => (
        <span className="posts-text">{posts}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
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
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
        showTotal: (total) => `Total ${total} competitors`,
      }}
      className="competitors-table"
      rowKey="id"
    />
  );
};

CompetitorsTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    company: PropTypes.string.isRequired,
    avatarLetter: PropTypes.string.isRequired,
    avatarColor: PropTypes.string,
    platforms: PropTypes.arrayOf(PropTypes.string),
    followers: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    engagement: PropTypes.number,
    posts: PropTypes.number,
    rawData: PropTypes.object,
  })),
  loading: PropTypes.bool,
  onViewReport: PropTypes.func,
  onDelete: PropTypes.func,
  showActions: PropTypes.bool,
};

export default CompetitorsTable;
