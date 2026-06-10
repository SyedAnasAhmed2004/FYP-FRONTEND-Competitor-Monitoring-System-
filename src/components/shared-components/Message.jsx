import React from 'react';
import { Card, Typography, Tag, Avatar } from 'antd';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

const { Text } = Typography;

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
          {isBot ? (
            <div className="message-text" style={{ whiteSpace: 'normal', ...(isError ? { color: '#dc2626' } : {}) }}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                  ol: ({ children }) => <ol style={{ margin: '4px 0', paddingLeft: '24px' }}>{children}</ol>,
                  ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: '24px' }}>{children}</ul>,
                  li: ({ children }) => <li style={{ margin: '6px 0', paddingLeft: '4px' }}>{children}</li>,
                  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                  a: ({ href, children }) => <span style={{ color: '#94a3b8' }}>{children} ({href})</span>,
                }}
              >
                {message}
              </ReactMarkdown>
            </div>
          ) : (
            <Text className="message-text">{message}</Text>
          )}

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
