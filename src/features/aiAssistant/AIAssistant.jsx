import React, { useEffect, useRef } from 'react';
import { Row, Col, Card, Typography, Avatar, Badge } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { 
  RiseOutlined, 
  WarningOutlined, 
  AimOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import { IconMessageChatbot } from '@tabler/icons-react';
import ChatMessage from '@components/common/ChatMessage';
import ChatInput from '@components/common/ChatInput';
import QuickActionCard from '@components/common/QuickActionCard';
import {
  sendMessage,
  addUserMessage,
  selectMessages,
  selectQuickQueries,
  selectSuggestions,
  selectIsTyping,
  selectLoading,
} from './aiAssistantSlice';

const { Title, Text } = Typography;

// Icon mapping
const iconMap = {
  TrendingUpOutlined: RiseOutlined,
  WarningOutlined: WarningOutlined,
  AimOutlined: AimOutlined,
  ClockCircleOutlined: ClockCircleOutlined,
};

function AIAssistant() {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  
  // Select data from Redux store
  const messages = useSelector(selectMessages);
  const quickQueries = useSelector(selectQuickQueries);
  const suggestions = useSelector(selectSuggestions);
  const isTyping = useSelector(selectIsTyping);
  const loading = useSelector(selectLoading);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle sending message
  const handleSendMessage = (message) => {
    // Add user message immediately (optimistic update)
    dispatch(addUserMessage(message));
    // Send to AI
    dispatch(sendMessage(message));
  };

  // Handle quick query click
  const handleQuickQuery = (action) => {
    handleSendMessage(action);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <div>
      {/* Standard Page Title Section */}
      <div className="page-title-section">
        <h1><IconMessageChatbot size={24} className="page-title-icon-custom" /> AI Assistant</h1>
      </div>

      {/* Main Page Content */}
      <div className="page-content">
        {/* AI Assistant Header Card */}
        <Card className="ai-assistant-info-card" bordered={false}>
          <div className="ai-info-content">
            <Avatar size={48} className="ai-info-avatar">
              🤖
            </Avatar>
            <div className="ai-info-text">
              <Title level={4} className="ai-info-title">AI Strategic Assistant</Title>
              <Text className="ai-info-subtitle">
                Get instant insights from your strategic intelligence data
              </Text>
            </div>
            <Badge 
              status="success" 
              text="Online"
              className="ai-info-status"
            />
          </div>
        </Card>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {/* Left Sidebar - Quick Queries */}
          <Col xs={24} lg={6}>
            <Card className="quick-queries-card" title="Quick Queries" bordered={false}>
              <Text type="secondary" className="queries-subtitle">
                Start with these common strategic questions
              </Text>
              
              <div className="quick-queries-list">
                {quickQueries.map((query) => {
                  const IconComponent = iconMap[query.icon];
                  return (
                    <QuickActionCard
                      key={query.id}
                      icon={IconComponent}
                      title={query.title}
                      description={query.description}
                      actionText={query.action}
                      onAction={() => handleQuickQuery(query.action)}
                    />
                  );
                })}
              </div>
            </Card>
          </Col>

          {/* Main Chat Area */}
          <Col xs={24} lg={18}>
            <Card className="chat-container-card" bordered={false}>
              <div className="chat-header-section">
                <Title level={4} className="chat-section-title">
                  Strategic Intelligence Chat
                </Title>
                <Text type="secondary">Ask questions about your competitive landscape</Text>
              </div>

              {/* Messages Area */}
              <div className="chat-messages-area">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg.message}
                    sender={msg.sender}
                    timestamp={msg.timestamp}
                    suggestions={msg.suggestions}
                    onSuggestionClick={handleSuggestionClick}
                  />
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="typing-indicator">
                    <Avatar size={40} className="avatar-bot">
                      🤖
                    </Avatar>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <ChatInput
                onSend={handleSendMessage}
                placeholder="Ask about market trends, competitors, strategic insights..."
                loading={loading}
                autoFocus
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AIAssistant;