import React from 'react';
import { Card, Typography, Button } from 'antd';
import PropTypes from 'prop-types';

const { Text, Title } = Typography;

/**
 * Generic reusable quick action card component
 * Can be used for displaying quick actions, shortcuts, or feature cards
 */
const QuickActionCard = ({ 
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  iconColor = '#E63946',
  iconBgColor = 'rgba(230, 57, 70, 0.1)'
}) => {
  return (
    <Card className="quick-action-card" bordered={false}>
      <div className="quick-action-icon" style={{ backgroundColor: iconBgColor }}>
        {Icon && <Icon style={{ fontSize: 24, color: iconColor }} />}
      </div>
      
      <Title level={5} className="quick-action-title">
        {title}
      </Title>
      
      <Text type="secondary" className="quick-action-description">
        {description}
      </Text>
      
      {actionText && onAction && (
        <Button 
          type="link" 
          className="quick-action-button"
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </Card>
  );
};

QuickActionCard.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  iconColor: PropTypes.string,
  iconBgColor: PropTypes.string,
};

export default QuickActionCard;
