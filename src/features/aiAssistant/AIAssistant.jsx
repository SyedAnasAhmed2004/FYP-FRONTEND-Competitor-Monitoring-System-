import React, { useEffect, useRef } from 'react';
import { Row, Col, Card, Typography, Avatar, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { IconMessageChatbot } from '@tabler/icons-react';
import Message from '@components/shared-components/Message';
import MessageInput from '@components/shared-components/MessageInput';
import { fetchCompetitors as fetchCompetitorsThunk, selectCompetitors, selectCompetitorsLoading } from '@features/competitors/competitorsSlice';
import {
  addUserMessage,
  selectMessages,
  selectSuggestions,
  selectIsTyping,
  selectLoading,
  selectCurrentCompetitor,
  setCurrentCompetitor,
  setIsTyping,
  setLoading,
  startAIMessage,
  appendToLastAIMessage,
  finalizeAIMessage,
  setAIMessageError,
} from './aiAssistantSlice';
import { performStreamingRAGQuery } from '../../services/ragService';

const { Title, Text } = Typography;

function AIAssistant() {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  // Read competitors from the shared Redux store
  const competitors = useSelector(selectCompetitors);
  const fetchingCompetitors = useSelector(selectCompetitorsLoading);

  // Select data from Redux store
  const messages = useSelector(selectMessages);
  const suggestions = useSelector(selectSuggestions);
  const isTyping = useSelector(selectIsTyping);
  const loading = useSelector(selectLoading);
  const currentCompetitor = useSelector(selectCurrentCompetitor);

  // Fetch competitors if not already in store, then set default competitor
  useEffect(() => {
    if (competitors.length === 0) {
      dispatch(fetchCompetitorsThunk());
    }
  }, []);

  // Once competitors are loaded, set first one as default if still on Honda default
  useEffect(() => {
    if (competitors.length > 0 && currentCompetitor === 'Honda') {
      dispatch(setCurrentCompetitor(competitors[0].name));
    }
  }, [competitors]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle sending message — streams tokens as they arrive
  const handleSendMessage = async (message) => {
    dispatch(addUserMessage(message));
    dispatch(setIsTyping(true));
    dispatch(setLoading(true));

    let messageStarted = false;

    await performStreamingRAGQuery(
      message,
      20,
      currentCompetitor || 'all',
      (chunk) => {
        if (!messageStarted) {
          messageStarted = true;
          dispatch(startAIMessage());
        }
        dispatch(appendToLastAIMessage(chunk));
      },
      () => dispatch(finalizeAIMessage()),
      (err) => dispatch(setAIMessageError(err)),
    );

    // Stream ended without any chunks (e.g. network error before first token)
    if (!messageStarted) {
      dispatch(setAIMessageError('No response received. Please try again.'));
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  // Handle competitor change
  const handleCompetitorChange = (value) => {
    dispatch(setCurrentCompetitor(value));
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
            <Tag className="ai-active-tag">online</Tag>
          </div>
        </Card>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {/* Chat Area — full width */}
          <Col xs={24}>
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
                  <Message
                    key={msg.id}
                    message={msg.message}
                    sender={msg.sender}
                    timestamp={msg.timestamp}
                    suggestions={msg.suggestions}
                    sources={msg.sources}
                    metadata={msg.metadata}
                    isError={msg.isError}
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
              <MessageInput
                onSend={handleSendMessage}
                placeholder="Ask about market trends, competitors, strategic insights..."
                loading={loading}
                autoFocus
                showCompetitorDropdown={true}
                competitors={competitors}
                fetchingCompetitors={fetchingCompetitors}
                selectedCompetitor={currentCompetitor}
                onCompetitorChange={handleCompetitorChange}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AIAssistant;