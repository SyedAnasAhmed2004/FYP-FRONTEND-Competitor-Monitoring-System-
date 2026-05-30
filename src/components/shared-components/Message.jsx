import React from 'react';
import { Card, Typography, Tag, Avatar } from 'antd';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Text } = Typography;

/**
 * Generic reusable chat message component
 * Can be used for any chat interface (AI Assistant, Customer Support, etc.)
 */
const ChatMessage = ({
  message,
  sender,
  timestamp,
  avatar,
  suggestions = [],
  onSuggestionClick,
  isError = false,
}) => {
  const isBot = sender === 'bot' || sender === 'ai';

  return (
    <div className={`chat-message ${isBot ? 'chat-message-bot' : 'chat-message-user'}`}>
      <div className="chat-message-avatar">
        <Avatar
          size={40}
          icon={isBot ? <RobotOutlined /> : <UserOutlined />}
          src={avatar}
          className={isBot ? 'avatar-bot' : 'avatar-user'}
        />
      </div>

      <div className="chat-message-content">
        <Card
          className={`message-card ${isBot ? 'message-card-bot' : 'message-card-user'}`}
          bordered={false}
          style={isError ? { borderLeft: '3px solid #ef4444', background: '#fef2f2' } : {}}
        >
          <Text className="message-text" style={isError ? { color: '#dc2626' } : {}}>{message}</Text>
          
          {timestamp && (
            <div className="message-timestamp">
              <Text type="secondary" className="timestamp-text">
                {new Date(timestamp).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </div>
          )}
        </Card>
        
        {suggestions && suggestions.length > 0 && (
          <div className="message-suggestions">
            {suggestions.map((suggestion, index) => (
              <Tag
                key={index}
                className="suggestion-tag"
                onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
              >
                {suggestion}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.string.isRequired,
  sender: PropTypes.oneOf(['bot', 'ai', 'user']).isRequired,
  timestamp: PropTypes.string,
  avatar: PropTypes.string,
  suggestions: PropTypes.arrayOf(PropTypes.string),
  onSuggestionClick: PropTypes.func,
};

export default ChatMessage;
