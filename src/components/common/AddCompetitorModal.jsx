import React, { useState } from 'react';
import { Modal, Form, Input, Checkbox, Button, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * Reusable Add Competitor Modal Component
 * Used for adding new competitors with platform monitoring options
 */
const AddCompetitorModal = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    website: true,
    instagram: true,
    facebook: true,
    twitter: false,
    linkedin: false,
  });

  // Platform configuration
  const platforms = [
    { key: 'website', label: 'Website', urlPlaceholder: 'Enter website URL' },
    { key: 'instagram', label: 'Instagram', urlPlaceholder: 'Enter instagram URL' },
    { key: 'facebook', label: 'Facebook', urlPlaceholder: 'Enter facebook URL' },
    { key: 'twitter', label: 'Twitter', urlPlaceholder: 'Enter twitter URL' },
    { key: 'linkedin', label: 'LinkedIn', urlPlaceholder: 'Enter linkedin URL' },
  ];

  // Handle platform checkbox change
  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Filter only selected platforms with URLs
      const platformData = {};
      Object.keys(selectedPlatforms).forEach(platform => {
        if (selectedPlatforms[platform] && values[`${platform}Url`]) {
          platformData[platform] = values[`${platform}Url`];
        }
      });

      const competitorData = {
        name: values.competitorName,
        platforms: platformData,
      };

      onSubmit(competitorData);
      handleClose();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    form.resetFields();
    setSelectedPlatforms({
      website: true,
      instagram: true,
      facebook: true,
      twitter: false,
      linkedin: false,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closeIcon={<CloseOutlined />}
      width={500}
      centered
      className="add-competitor-modal"
      destroyOnClose
      maskClosable={false}
      getContainer={false}
    >
      <div className="modal-header">
        <h2 className="modal-title">Add Competitor</h2>
      </div>

      <Form
        form={form}
        layout="vertical"
        className="add-competitor-form"
      >
        {/* Competitor Name */}
        <Form.Item
          label="Competitor Name"
          name="competitorName"
          rules={[{ required: true, message: 'Please enter competitor name' }]}
          className="form-item-custom"
        >
          <Input 
            placeholder="Enter competitor name" 
            className="input-custom"
          />
        </Form.Item>

        {/* Platforms Section */}
        <div className="platforms-section">
          <h3 className="section-title">Platforms to Monitor</h3>
          
          {platforms.map((platform) => (
            <div key={platform.key} className="platform-item">
              <Checkbox
                checked={selectedPlatforms[platform.key]}
                onChange={() => handlePlatformToggle(platform.key)}
                className="platform-checkbox"
              >
                <span className="platform-label">{platform.label}</span>
              </Checkbox>
              
              {selectedPlatforms[platform.key] && (
                <Form.Item
                  name={`${platform.key}Url`}
                  className="platform-url-input"
                  rules={[
                    { 
                      required: selectedPlatforms[platform.key], 
                      message: `Please enter ${platform.label.toLowerCase()} URL` 
                    },
                    { type: 'url', message: 'Please enter a valid URL' }
                  ]}
                >
                  <Input 
                    placeholder={platform.urlPlaceholder}
                    className="input-custom"
                  />
                </Form.Item>
              )}
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="modal-footer">
          <Space size={12}>
            <Button 
              onClick={handleClose}
              className="cancel-btn"
            >
              Cancel
            </Button>
            <Button 
              type="primary"
              onClick={handleSubmit}
              className="submit-btn"
            >
              Add Competitor
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

AddCompetitorModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddCompetitorModal;
