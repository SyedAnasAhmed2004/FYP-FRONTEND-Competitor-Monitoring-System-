import React, { useState } from 'react';
import { Input, Button, Select } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { TextArea } = Input;

/**
 * Generic reusable chat input component
 * Can be used for any chat interface with customizable placeholder and submit behavior
 */
const ChatInput = ({ 
  onSend, 
  placeholder = "Type your message...",
  disabled = false,
  loading = false,
  maxLength = 1000,
  autoFocus = false,
  showCompetitorDropdown = false,
  competitors = [],
  selectedCompetitor = null,
  onCompetitorChange = () => {}
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim() && !loading) {
      onSend(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      {showCompetitorDropdown && (
        <Select
          value={selectedCompetitor}
          onChange={onCompetitorChange}
          style={{ width: 200, height: 48 }}
          disabled={loading}
          loading={competitors.length === 0}
          placeholder="Select competitor"
        >
          {competitors.map((c) => (
            <Select.Option key={c.id} value={c.name}>
              {c.name}
            </Select.Option>
          ))}
        </Select>
      )}
      <TextArea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled || loading}
        autoSize={{ minRows: 1, maxRows: 4 }}
        maxLength={maxLength}
        className="chat-input-field"
        autoFocus={autoFocus}
        style={{ flex: 1, minHeight: 48 }}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSend}
        disabled={!inputValue.trim() || disabled}
        loading={loading}
        className="chat-send-button"
        size="large"
      />
    </div>
  );
};

ChatInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  maxLength: PropTypes.number,
  autoFocus: PropTypes.bool,
  showCompetitorDropdown: PropTypes.bool,
  competitors: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number, name: PropTypes.string })),
  selectedCompetitor: PropTypes.string,
  onCompetitorChange: PropTypes.func,
};

export default ChatInput;
