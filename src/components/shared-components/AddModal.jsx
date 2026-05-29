import React, { useState, useRef } from 'react';
import { Modal, Form, Input, Checkbox, Button, Space, Spin } from 'antd';
import { CloseOutlined, CheckCircleFilled } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { dashboardService } from '../../services/dashboardService';

const AddCompetitorModal = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    website: true,
    instagram: true,
    facebook: true,
    twitter: false,
    linkedin: false,
  });
  const [fmpOptions, setFmpOptions]       = useState([]);
  const [fmpLoading, setFmpLoading]       = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const debounceRef = useRef(null);

  const platforms = [
    { key: 'website',   label: 'Website',   urlPlaceholder: 'Enter website URL'   },
    { key: 'instagram', label: 'Instagram', urlPlaceholder: 'Enter instagram URL' },
    { key: 'facebook',  label: 'Facebook',  urlPlaceholder: 'Enter facebook URL'  },
    { key: 'twitter',   label: 'Twitter',   urlPlaceholder: 'Enter twitter URL'   },
    { key: 'linkedin',  label: 'LinkedIn',  urlPlaceholder: 'Enter linkedin URL'  },
  ];

  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  // Fires on every keystroke in the Name field — searches FMP in background
  const handleNameChange = (e) => {
    const query = e.target.value?.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Reset selected symbol if name changes
    setSelectedSymbol(null);

    if (!query || query.length < 2) {
      setFmpOptions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setFmpLoading(true);
      try {
        const res = await dashboardService.searchSymbol(query, 8);
        if (res.success && res.data) {
          const results = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
          setFmpOptions(results);
        } else {
          setFmpOptions([]);
        }
      } catch {
        setFmpOptions([]);
      } finally {
        setFmpLoading(false);
      }
    }, 400);
  };

  const handleCardClick = (item) => {
    const newVal = selectedSymbol === item.symbol ? null : item.symbol;
    setSelectedSymbol(newVal);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const platformData = {};
      Object.keys(selectedPlatforms).forEach(platform => {
        if (selectedPlatforms[platform] && values[`${platform}Url`]) {
          platformData[platform] = values[`${platform}Url`];
        }
      });

      const competitorData = {
        name: values.competitorName,
        stock_symbol: selectedSymbol || undefined,
        platforms: platformData,
      };

      onSubmit(competitorData);
      handleClose();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setSelectedPlatforms({
      website: true,
      instagram: true,
      facebook: true,
      twitter: false,
      linkedin: false,
    });
    setFmpOptions([]);
    setSelectedSymbol(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closeIcon={<CloseOutlined />}
      title="Add Competitor"
      width={500}
      centered
      className="add-competitor-modal"
      destroyOnClose
      maskClosable={false}
      getContainer={false}
    >
      <Form form={form} layout="vertical" className="add-competitor-form">

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
            onChange={handleNameChange}
          />
        </Form.Item>

        {/* FMP Match — inline suggestion cards */}
        {(fmpLoading || fmpOptions.length > 0) && (
          <div className="fmp-match-section">
            <div className="fmp-match-label">
              {fmpLoading
                ? <><Spin size="small" style={{ marginRight: 6 }} />Searching financial data…</>
                : `Select matching company for financial data ${selectedSymbol ? `— ${selectedSymbol} selected ✓` : '(optional)'}`
              }
            </div>

            {!fmpLoading && (
              <div className="fmp-match-list">
                {fmpOptions.map((item) => {
                  const isSelected = selectedSymbol === item.symbol;
                  return (
                    <div
                      key={item.symbol}
                      className={`fmp-match-card${isSelected ? ' fmp-match-card--active' : ''}`}
                      onClick={() => handleCardClick(item)}
                    >
                      <div className="fmp-match-card-inner">
                        <div className="fmp-match-info">
                          <span className="fmp-match-name">{item.name}</span>
                          <span className="fmp-match-meta">
                            {item.symbol}
                            {(item.exchangeShortName || item.stockExchange) && ` · ${item.exchangeShortName ?? item.stockExchange}`}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircleFilled className="fmp-match-check" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
                    { required: selectedPlatforms[platform.key], message: `Please enter ${platform.label.toLowerCase()} URL` },
                    { type: 'url', message: 'Please enter a valid URL' },
                  ]}
                >
                  <Input placeholder={platform.urlPlaceholder} className="input-custom" />
                </Form.Item>
              )}
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="modal-footer">
          <Space size={12}>
            <Button onClick={handleClose} className="cancel-btn">Cancel</Button>
            <Button type="primary" onClick={handleSubmit} className="submit-btn">Add Competitor</Button>
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
