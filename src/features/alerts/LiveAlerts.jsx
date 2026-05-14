import React, { useState, useEffect } from 'react';
import {
  Card, Button, Select, Tag, Typography, Spin,
  Modal, Form, Input, Switch, Space, Divider,
} from 'antd';
import { BellOutlined, SettingOutlined, FilterOutlined, LinkOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import {
  fetchAlerts,
  fetchAlertPreference,
  saveAlertPreference,
  selectAlerts,
  selectAlertsLoading,
  selectAlertPreference,
  selectPreferenceLoading,
  selectPreferenceUpdating,
} from './alertsSlice';
import notify from '@utils/notify';

const { Text, Title } = Typography;
const { Option } = Select;

const ALERT_TYPE_CONFIG = {
  website_change:  { textColor: '#C53030', bg: '#FFF5F5', border: '#FED7D7', badgeBg: '#FED7D7', label: 'Website Change' },
  new_page:        { textColor: '#276749', bg: '#F0FFF4', border: '#C6F6D5', badgeBg: '#C6F6D5', label: 'New Page' },
  new_job:         { textColor: '#2B6CB0', bg: '#EBF8FF', border: '#BEE3F8', badgeBg: '#BEE3F8', label: 'New Job' },
  follower_change: { textColor: '#553C9A', bg: '#FAF5FF', border: '#E9D8FD', badgeBg: '#E9D8FD', label: 'Follower Change' },
};

const TYPE_OPTIONS = [
  { label: 'All Types',         value: 'all' },
  { label: 'Website Changes',   value: 'website_changes' },
  { label: 'New Pages',         value: 'new_pages' },
  { label: 'New Jobs',          value: 'new_jobs' },
  { label: 'Follower Changes',  value: 'follower_change' },
];

const DAY_OPTIONS = [
  { label: 'Last 7 Days',  value: 7 },
  { label: 'Last 14 Days', value: 14 },
  { label: 'Last 30 Days', value: 30 },
];

const TOGGLE_FIELDS = [
  {
    key: 'notify_website_changes',
    label: 'Website Changes',
    desc: 'Alert for significant HTML updates on competitor sites.',
  },
  {
    key: 'notify_new_pages',
    label: 'New Pages',
    desc: 'Alert for new URLs detected on competitor websites',
  },
  {
    key: 'notify_new_jobs',
    label: 'New Jobs',
    desc: 'Alert for new job postings detected on LinkedIn',
  },
  {
    key: 'notify_follower_change',
    label: 'Follower Changes',
    desc: 'Alert for ≥ 5% change in LinkedIn followers or employees',
  },
];

// ── Alert Detail Modal ────────────────────────────────────────────────────────
function AlertDetailModal({ alert, onClose }) {
  if (!alert) return null;
  const cfg = ALERT_TYPE_CONFIG[alert.type] || {
    textColor: '#374151', bg: '#F9FAFB', border: '#E5E7EB', badgeBg: '#E5E7EB', label: alert.type,
  };
  const meta = alert.meta || {};
  const timeAgo = alert.timestamp
    ? formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })
    : '';

  const renderMeta = () => {
    switch (alert.type) {
      case 'website_change':
        return (
          <div>
            {meta.url && (
              <div style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Page URL</Text>
                <div style={{ marginTop: 4 }}>
                  <a href={meta.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: cfg.textColor, wordBreak: 'break-all' }}>
                    <LinkOutlined style={{ marginRight: 4 }} />{meta.url}
                  </a>
                </div>
              </div>
            )}
            {meta.change_type && (
              <div style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Change Type</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag style={{ background: cfg.badgeBg, color: cfg.textColor, border: 'none', fontWeight: 600 }}>{meta.change_type}</Tag>
                </div>
              </div>
            )}
            {meta.added_lines != null && (
              <div style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lines Changed</Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 13, color: '#111827' }}>{meta.added_lines}</Text>
                </div>
              </div>
            )}
          </div>
        );

      case 'new_page':
        return (
          <div>
            {meta.url && (
              <div style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Page URL</Text>
                <div style={{ marginTop: 4 }}>
                  <a href={meta.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: cfg.textColor, wordBreak: 'break-all' }}>
                    <LinkOutlined style={{ marginRight: 4 }} />{meta.url}
                  </a>
                </div>
              </div>
            )}
          </div>
        );

      case 'new_job':
        return (
          <div>
            {meta.job_title && (
              <div style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Job Title</Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{meta.job_title}</Text>
                </div>
              </div>
            )}
            {meta.location && (
              <div style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 13, color: '#111827' }}>{meta.location}</Text>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
              {meta.seniority && (
                <div>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seniority</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag style={{ background: cfg.badgeBg, color: cfg.textColor, border: 'none', fontWeight: 600 }}>{meta.seniority}</Tag>
                  </div>
                </div>
              )}
              {meta.employment_type && (
                <div>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employment Type</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag style={{ background: cfg.badgeBg, color: cfg.textColor, border: 'none', fontWeight: 600 }}>{meta.employment_type}</Tag>
                  </div>
                </div>
              )}
            </div>
            {meta.job_url && (
              <div style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Job Listing</Text>
                <div style={{ marginTop: 4 }}>
                  <a href={meta.job_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: cfg.textColor, wordBreak: 'break-all' }}>
                    <LinkOutlined style={{ marginRight: 4 }} />View on LinkedIn
                  </a>
                </div>
              </div>
            )}
          </div>
        );

      case 'follower_change':
        return (
          <div>
            {(meta.follower_count_old != null || meta.follower_count_new != null) && (
              <div style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Followers</Text>
                <div style={{ marginTop: 6, display: 'flex', gap: 24 }}>
                  {meta.follower_count_old != null && (
                    <div>
                      <Text style={{ fontSize: 11, color: '#9ca3af' }}>Previous</Text>
                      <div><Text style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{meta.follower_count_old?.toLocaleString()}</Text></div>
                    </div>
                  )}
                  {meta.follower_count_new != null && (
                    <div>
                      <Text style={{ fontSize: 11, color: '#9ca3af' }}>Current</Text>
                      <div><Text style={{ fontSize: 16, fontWeight: 700, color: cfg.textColor }}>{meta.follower_count_new?.toLocaleString()}</Text></div>
                    </div>
                  )}
                  {meta.follower_pct != null && (
                    <div>
                      <Text style={{ fontSize: 11, color: '#9ca3af' }}>Change</Text>
                      <div>
                        <Tag style={{ background: cfg.badgeBg, color: cfg.textColor, border: 'none', fontWeight: 700, fontSize: 13 }}>
                          {meta.follower_pct > 0 ? '+' : ''}{meta.follower_pct}%
                        </Tag>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {(meta.employee_count_old != null || meta.employee_count_new != null) && (
              <div style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employees</Text>
                <div style={{ marginTop: 6, display: 'flex', gap: 24 }}>
                  {meta.employee_count_old != null && (
                    <div>
                      <Text style={{ fontSize: 11, color: '#9ca3af' }}>Previous</Text>
                      <div><Text style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{meta.employee_count_old?.toLocaleString()}</Text></div>
                    </div>
                  )}
                  {meta.employee_count_new != null && (
                    <div>
                      <Text style={{ fontSize: 11, color: '#9ca3af' }}>Current</Text>
                      <div><Text style={{ fontSize: 16, fontWeight: 700, color: cfg.textColor }}>{meta.employee_count_new?.toLocaleString()}</Text></div>
                    </div>
                  )}
                  {meta.employee_pct != null && (
                    <div>
                      <Text style={{ fontSize: 11, color: '#9ca3af' }}>Change</Text>
                      <div>
                        <Tag style={{ background: cfg.badgeBg, color: cfg.textColor, border: 'none', fontWeight: 700, fontSize: 13 }}>
                          {meta.employee_pct > 0 ? '+' : ''}{meta.employee_pct}%
                        </Tag>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return Object.keys(meta).length > 0 ? (
          <pre style={{ fontSize: 12, color: '#374151', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(meta, null, 2)}
          </pre>
        ) : (
          <Text type="secondary">No additional details available.</Text>
        );
    }
  };

  return (
    <Modal
      open={!!alert}
      onCancel={onClose}
      footer={<Button onClick={onClose} style={{ height: 36 }}>Close</Button>}
      width={480}
      centered
      destroyOnClose
      maskClosable
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{alert.title}</span>
          <Tag style={{ background: cfg.badgeBg, color: cfg.textColor, border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
            {cfg.label}
          </Tag>
        </div>
      }
      styles={{
        mask: { backdropFilter: 'blur(2px)', background: 'rgba(0,0,0,0.45)' },
        content: { borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', padding: 0 },
        header: { padding: '24px 28px 0', borderBottom: 'none', marginBottom: 0 },
        body: { padding: '16px 28px 24px' },
        footer: { padding: '0 28px 24px', borderTop: 'none' },
      }}
    >
      <Text style={{ fontSize: 13, color: cfg.textColor, display: 'block', marginBottom: 16 }}>
        {alert.description}
      </Text>

      {Object.keys(meta).length > 0 && (
        <>
          <Divider style={{ margin: '0 0 16px 0' }} />
          {renderMeta()}
        </>
      )}

      <Text style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginTop: 8 }}>
        {timeAgo}{alert.competitor ? ` • Source: ${alert.competitor}` : ''}
      </Text>
    </Modal>
  );
}

// ── Alert Card ────────────────────────────────────────────────────────────────
function AlertCard({ alert, onViewDetails }) {
  const cfg = ALERT_TYPE_CONFIG[alert.type] || {
    textColor: '#374151', bg: '#F9FAFB', border: '#E5E7EB', badgeBg: '#E5E7EB', label: alert.type,
  };
  const timeAgo = alert.timestamp
    ? formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })
    : '';

  return (
    <div
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 8,
        padding: '16px 20px',
        marginBottom: 12,
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontWeight: 600, fontSize: 15, color: cfg.textColor }}>{alert.title}</Text>
          <Tag
            style={{
              background: cfg.badgeBg,
              color: cfg.textColor,
              border: 'none',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {cfg.label}
          </Tag>
        </div>
        <Button
          size="small"
          onClick={() => onViewDetails(alert)}
          style={{ borderRadius: 6, fontWeight: 400, fontSize: 13, color: '#374151' }}
        >
          View Details
        </Button>
      </div>

      {/* Description */}
      <Text style={{ fontSize: 13, color: cfg.textColor, display: 'block', marginBottom: 6 }}>
        {alert.description}
      </Text>

      {/* Meta row */}
      <Text style={{ fontSize: 12, color: '#6b7280' }}>
        {timeAgo}
        {alert.competitor ? ` • Source: ${alert.competitor}` : ''}
      </Text>
    </div>
  );
}

// ── Manage Alerts Modal ───────────────────────────────────────────────────────
function ManageAlertsModal({ open, onClose }) {
  const dispatch = useAppDispatch();
  const preference = useAppSelector(selectAlertPreference);
  const preferenceLoading = useAppSelector(selectPreferenceLoading);
  const preferenceUpdating = useAppSelector(selectPreferenceUpdating);

  const [form] = Form.useForm();

  useEffect(() => {
    if (open) dispatch(fetchAlertPreference());
  }, [open, dispatch]);

  useEffect(() => {
    if (preference) {
      form.setFieldsValue({
        alert_email:              preference.alert_email || '',
        notify_website_changes:   preference.notify_website_changes ?? false,
        notify_new_pages:         preference.notify_new_pages ?? false,
        notify_new_jobs:          preference.notify_new_jobs ?? false,
        notify_follower_change:   preference.notify_follower_change ?? false,
      });
    }
  }, [preference, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(saveAlertPreference(values)).unwrap();
      notify.success('Alert preferences saved successfully');
      onClose();
    } catch (error) {
      if (typeof error === 'string') notify.error(error);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      title={
        <span style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
          <SettingOutlined style={{ marginRight: 8, color: '#E63946' }} />
          Manage Alert Preferences
        </span>
      }
      destroyOnClose
      maskClosable={false}
      styles={{
        mask: { backdropFilter: 'blur(2px)', background: 'rgba(0,0,0,0.45)' },
        content: { borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto', padding: 0 },
        header: { padding: '28px 28px 0', borderBottom: 'none', marginBottom: 0 },
        body: { padding: '24px 28px 28px' },
      }}
    >
      {preferenceLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item label="Alert Email" name="alert_email" style={{ marginBottom: 8 }} labelCol={{ style: { fontWeight: 600, fontSize: 14 } }}>
            <Input placeholder="Enter email for notifications (optional)" className="alert-email-input" style={{ fontSize: 14, fontWeight: 400, borderColor: '#dc2626' }} />
          </Form.Item>

          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16, color: '#dc2626', textAlign: 'right' }}>
            Leave blank to receive alerts in-app only.
          </Text>

          <Divider style={{ margin: '0 0 4px 0' }} />

          {TOGGLE_FIELDS.map((field, idx) => (
            <div key={field.key}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                }}
              >
                <div style={{ flex: 1, paddingRight: 24 }}>
                  <Text style={{ fontWeight: 600, fontSize: 14, color: '#111827', display: 'block' }}>
                    {field.label}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {field.desc}
                  </Text>
                </div>
                <Form.Item name={field.key} valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
              {idx < TOGGLE_FIELDS.length - 1 && <Divider style={{ margin: 0 }} />}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={onClose} style={{ height: 38 }}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={preferenceUpdating}
              style={{ background: '#E63946', borderColor: '#E63946', height: 38 }}
            >
              Save Preferences
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
}

// ── Main LiveAlerts component ─────────────────────────────────────────────────
function LiveAlerts() {
  const dispatch = useAppDispatch();
  const alerts = useAppSelector(selectAlerts);
  const alertsLoading = useAppSelector(selectAlertsLoading);

  const [days, setDays] = useState(7);
  const [type, setType] = useState('all');
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    dispatch(fetchAlerts({ days, type }));
  }, [dispatch, days, type]);

  return (
    <div>
      <div className="page-title-section">
        <h1>
          <BellOutlined className="page-title-icon" /> Live Alerts
        </h1>
      </div>

      <div className="page-content">
        {/* Header Card */}
        <Card
          bordered={false}
          style={{ borderRadius: 12, marginBottom: 24, border: '2px solid #fee2e2' }}
        >
          <div className="header-card-content">
            <div>
              <h1 className="header-title-main">Live Alerts</h1>
              <p className="header-subtitle-main">
                Real-time notifications about competitor activities and market changes
              </p>
            </div>
            <div className="header-actions">
              <Button
                type="primary"
                icon={<SettingOutlined />}
                onClick={() => setManageOpen(true)}
                style={{
                  background: '#dc2626',
                  borderColor: '#dc2626',
                  height: 'auto',
                  padding: '6px 12px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'white',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Manage Alerts
              </Button>
            </div>
          </div>
        </Card>

        {/* Filter Card */}
        <Card
          className="filter-card"
          title={
            <Title level={4}>
              <FilterOutlined className="reports-inline-color-red reports-inline-mr-8" />
              Filter Alerts
            </Title>
          }
          bordered={false}
          style={{ marginBottom: 24 }}
        >
          <div className="filter-controls">
            <Space size={20} wrap>
              <span className="filter-label">Type:</span>
              <Select value={type} className="report-select reports-inline-width-140" onChange={setType}>
                {TYPE_OPTIONS.map((o) => (
                  <Option key={o.value} value={o.value}>{o.label}</Option>
                ))}
              </Select>
              <span className="filter-label">Period:</span>
              <Select value={days} className="report-select" style={{ width: 120 }} onChange={setDays}>
                {DAY_OPTIONS.map((o) => (
                  <Option key={o.value} value={o.value}>{o.label}</Option>
                ))}
              </Select>
            </Space>
          </div>
        </Card>

        {/* Alerts List */}
        <Card
          bordered={false}
          style={{ borderRadius: 12, border: '2px solid #fee2e2' }}
          styles={{ body: { padding: '24px' } }}
        >
          <div style={{ marginBottom: 20 }}>
            <Title level={4} className="alerts-list-title-custom" style={{ margin: '0 0 4px 0' }}>
              Live Intelligence Alerts
            </Title>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 400 }}>
              Real-time notifications about competitor activities and market changes
            </Text>
          </div>
          {alertsLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
            </div>
          ) : alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <BellOutlined style={{ fontSize: 40, color: '#D1D5DB', marginBottom: 12, display: 'block' }} />
              <Text type="secondary">No alerts found for the selected filters.</Text>
            </div>
          ) : (
            <div>
              {alerts.map((alert, idx) => (
                <AlertCard key={idx} alert={alert} onViewDetails={setSelectedAlert} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <ManageAlertsModal open={manageOpen} onClose={() => setManageOpen(false)} />
      <AlertDetailModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  );
}

export default LiveAlerts;
