import React, { useState, useRef, useEffect } from 'react';
import { Modal, Form, Input, Checkbox, Button, Space, Select, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { dashboardService } from '../../services/dashboardService';

const { Option } = Select;

const AddCompetitorModal = ({ open, onClose, onSubmit, initialData = null }) => {
  const [form] = Form.useForm();
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    website: true,
    instagram: true,
    facebook: true,
    linkedin: false,
  });
  const [fmpOptions, setFmpOptions] = useState([]);
  const [fmpLoading, setFmpLoading] = useState(false);
  const debounceRef = useRef(null);

  const platforms = [
    { key: 'website',   label: 'Website',   urlPlaceholder: 'Enter website URL',   comingSoon: false },
    { key: 'instagram', label: 'Instagram', urlPlaceholder: 'Enter instagram URL', comingSoon: false },
    { key: 'facebook',  label: 'Facebook',  urlPlaceholder: 'Enter facebook URL',  comingSoon: false },
    { key: 'linkedin',  label: 'LinkedIn',  urlPlaceholder: 'Enter linkedin URL',  comingSoon: false },
    { key: 'twitter',   label: 'Twitter',   urlPlaceholder: 'Enter twitter URL',   comingSoon: true  },
  ];

  const isEditMode = !!initialData;

  useEffect(() => {
    if (open && initialData) {
      setSelectedPlatforms({
        website: !!initialData.website_base_url,
        instagram: !!initialData.instagram_url,
        facebook: !!initialData.facebook_url,
        linkedin: !!initialData.linkedin_url,
      });
      form.setFieldsValue({
        competitorName: initialData.name,
        fmpSymbol: initialData.stock_symbol || undefined,
        websiteUrl: initialData.website_base_url || undefined,
        instagramUrl: initialData.instagram_url || undefined,
        facebookUrl: initialData.facebook_url || undefined,
        twitterUrl: initialData.twitter_url || undefined,
        linkedinUrl: initialData.linkedin_url || undefined,
      });
    }
  }, [open, initialData]);

  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  // Called every time the name field changes — fetches FMP results in background
  const handleNameChange = (e) => {
    const query = e.target.value?.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 2) {
      setFmpOptions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setFmpLoading(true);
      try {
        const res = await dashboardService.searchSymbol(query, 10);
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
        stock_symbol: values.fmpSymbol || undefined,
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
      linkedin: false,
    });
    setFmpOptions([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closeIcon={<CloseOutlined />}
      title={isEditMode ? 'Edit Competitor' : 'Add Competitor'}
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

        {/* FMP Symbol */}
        <Form.Item
          label="FMP Symbol (optional)"
          name="fmpSymbol"
          className="form-item-custom"
        >
          <Select
            placeholder="Open to select matching company from FMP"
            allowClear
            showSearch={false}
            notFoundContent={fmpLoading ? <Spin size="small" /> : 'Type a name above to load options'}
            className="input-custom"
            popupMatchSelectWidth
          >
            {fmpOptions.map((item) => (
              <Option key={item.symbol} value={item.symbol}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>{item.name}</span>
                  <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 8 }}>
                    {item.symbol} · {item.exchangeShortName ?? item.stockExchange ?? ''}
                  </span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Platforms Section */}
        <div className="platforms-section">
          <h3 className="section-title">Platforms to Monitor</h3>

          {platforms.map((platform) => (
            <div key={platform.key} className="platform-item">
              {platform.comingSoon ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5 }}>
                  <Checkbox disabled className="platform-checkbox">
                    <span className="platform-label">{platform.label}</span>
                  </Checkbox>
                  <span style={{ fontSize: 11, background: '#f1f5f9', color: '#64748b', padding: '1px 7px', borderRadius: 4, fontWeight: 500 }}>
                    Coming Soon
                  </span>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="modal-footer">
          <Space size={12}>
            <Button onClick={handleClose} className="cancel-btn">Cancel</Button>
            <Button type="primary" onClick={handleSubmit} className="submit-btn">{isEditMode ? 'Save Changes' : 'Add Competitor'}</Button>
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
  initialData: PropTypes.object,
};

export default AddCompetitorModal;
