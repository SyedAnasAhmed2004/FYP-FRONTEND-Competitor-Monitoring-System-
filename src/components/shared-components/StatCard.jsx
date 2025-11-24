import React from 'react';
import { Card, Typography } from 'antd';
import PropTypes from 'prop-types';

const { Title, Text } = Typography;

/**
 * Reusable Statistic Card Component
 * Used for displaying key metrics and statistics
 */
const StatCard = ({ 
  icon: IconComponent, 
  title, 
  value, 
  subtitle,
  iconBgColor = '#fee2e2',
  iconColor = '#dc2626'
}) => {
  return (
    <Card className="stat-card" bordered={false}>
      <div className="stat-card-header">
        <div 
          className="stat-card-icon" 
          style={{ 
            backgroundColor: iconBgColor,
            color: iconColor 
          }}
        >
          {IconComponent && <IconComponent size={20} />}
        </div>
        <Text className="stat-card-title">{title}</Text>
      </div>
      
      <div className="stat-card-content">
        <Title level={2} className="stat-card-value">{value}</Title>
        <Text className="stat-card-subtitle">{subtitle}</Text>
      </div>
    </Card>
  );
};

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string.isRequired,
  iconBgColor: PropTypes.string,
  iconColor: PropTypes.string,
};

export default StatCard;
