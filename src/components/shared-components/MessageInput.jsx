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
  selectedCompetitor = 'Honda',
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
        >
          <Select.Option value="Honda">Honda</Select.Option>
          <Select.Option value="Suzuki">Suzuki</Select.Option>
          <Select.Option value="Kia">Kia</Select.Option>
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
  selectedCompetitor: PropTypes.string,
  onCompetitorChange: PropTypes.func,
};

export default ChatInput;
