import React, { useState } from 'react';
import {
    Row, Col, Card, Typography, Tag, List, Grid,
    Form, Input, Button, Select, DatePicker, Tabs, Popover, Space, Spin, Checkbox
} from 'antd';
import {
    FileTextOutlined,
    DownloadOutlined,
    FilterOutlined,
    CalendarOutlined,
    BellOutlined,
    RiseOutlined,
    SearchOutlined,
    EyeOutlined,
    ArrowDownOutlined,
    ScheduleOutlined,
    LoadingOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import dayjs from 'dayjs'; // Import dayjs for DatePicker defaults

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// --- Mock Data Types (Converted from TypeScript interfaces for .jsx compatibility) ---

/**
 * @typedef {object} Report
 * @property {string} id
 * @property {string} title
 * @property {'executive' | 'competitive' | 'market' | 'custom'} type
 * @property {string} generated
 * @property {string} period
 * @property {'ready' | 'generating' | 'scheduled'} status
 * @property {string} size
 */

/**
 * @typedef {object} Alert
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'critical' | 'warning' | 'info'} type
 * @property {string} timestamp
 * @property {string} source
 */

// Mock Data
const mockReports = [
    { id: '1', title: 'Q4 Strategic Intelligence Executive Brief', type: 'executive', generated: '1 hour ago', period: 'Last 90 days', status: 'ready', size: '4.2 MB' },
    { id: '2', title: 'Competitive Landscape Analysis - Tech Sector', type: 'competitive', generated: '3 hours ago', period: 'Last 30 days', status: 'ready', size: '6.1 MB' },
    { id: '3', title: 'Market Penetration Strategy Assessment', type: 'market', generated: '5 hours ago', period: 'Last 14 days', status: 'ready', size: '3.8 MB' },
    { id: '4', title: 'AI-Driven Customer Behavior Analysis', type: 'custom', generated: '12 hours ago', period: 'Last 60 days', status: 'ready', size: '5.4 MB' },
    { id: '5', title: 'Emerging Technologies Impact Report', type: 'market', generated: 'Generating...', period: 'Last 180 days', status: 'generating', size: '-' },
    { id: '6', title: 'Weekly Intelligence Digest', type: 'executive', generated: 'Scheduled for Monday', period: 'Next 7 days', status: 'scheduled', size: '-' },
    { id: '7', title: 'Patent Filing & Innovation Tracker', type: 'competitive', generated: '1 day ago', period: 'Last 30 days', status: 'ready', size: '2.9 MB' },
    { id: '8', title: 'Social Sentiment & Brand Perception Analysis', type: 'market', generated: '6 hours ago', period: 'Last 21 days', status: 'ready', size: '4.7 MB' },
];

const mockAlerts = [
    { id: '1', title: 'Major Acquisition Announcement', description: 'TechCorp completed $2.3B acquisition of CloudScale Inc., expanding their enterprise AI capabilities by 340% and entering 12 new market segments', type: 'critical', timestamp: '45 minutes ago', source: 'SEC Filing' },
    { id: '2', title: 'Disruptive Technology Patent Filed', description: 'InnovateLab filed breakthrough patent for "Quantum-Enhanced Machine Learning Architecture" - potential game-changer for processing speed', type: 'critical', timestamp: '2 hours ago', source: 'USPTO Database' },
    { id: '3', title: 'Aggressive Pricing Strategy Launched', description: 'FutureTech reduced enterprise pricing by 40% while introducing new premium features - strategic move to capture market share', type: 'warning', timestamp: '4 hours ago', source: 'Pricing Intelligence' },
    { id: '4', title: 'Key Executive Transition', description: 'DigitalFirst appointed former Google VP of AI as new CTO, signaling major shift toward AI-first strategy', type: 'warning', timestamp: '8 hours ago', source: 'LinkedIn' },
    { id: '5', title: 'Strategic Partnership Formed', description: 'NexTech and Microsoft announced joint venture for enterprise automation solutions, combining AI and cloud infrastructure', type: 'info', timestamp: '12 hours ago', source: 'Press Release' },
    { id: '6', title: 'Regulatory Compliance Update', description: 'New EU AI Act requirements affecting competitor product roadmaps - opportunities for compliant solutions', type: 'info', timestamp: '1 day ago', source: 'Regulatory Monitor' },
    { id: '7', title: 'Market Expansion Detected', description: 'Three competitors simultaneously entered Southeast Asian markets, indicating high-potential region for expansion', type: 'warning', timestamp: '1 day ago', source: 'Market Analysis' },
    { id: '8', title: 'Customer Churn Analysis', description: 'AI detected 15% increase in competitor customer complaints related to service quality - potential opportunity for customer acquisition', type: 'info', timestamp: '2 days ago', source: 'Social Media Intelligence' },
];

// Component
function Reports() {
    // Set default active tab to 'generate' to show the modified form immediately
    const [activeTab, setActiveTab] = useState('generate'); 
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterType, setFilterType] = useState('all');
    const [filterPeriod, setFilterPeriod] = useState('30d');
    const [reports] = useState(mockReports);
    const [alerts] = useState(mockAlerts);
    const [form] = Form.useForm();
    
    const criticalAlertCount = alerts.filter(a => a.type === 'critical').length;

    // Helper functions (kept simple as Redux logic is external)
    const getReportTypeColor = (type) => {
        switch (type) {
            case 'executive': return 'report-type-executive';
            case 'competitive': return 'report-type-competitive';
            case 'market': return 'report-type-market';
            case 'custom': return 'report-type-custom';
            default: return '';
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'ready': return 'report-status-ready';
            case 'generating': return 'report-status-generating';
            case 'scheduled': return 'report-status-scheduled';
            default: return '';
        }
    }

    const getAlertClass = (type) => {
        switch (type) {
            case 'critical': return 'alert-type-critical';
            case 'warning': return 'alert-type-warning';
            case 'info': return 'alert-type-info';
            default: return '';
        }
    }
    const getAlertBadgeClass = (type) => {
        switch (type) {
            case 'critical': return 'critical';
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return '';
        }
    }

    const handleGenerateReport = (values) => {
        console.log('Generating report with config:', values);
        // In a real app, dispatch generateReport thunk here
    };

    const handleDownloadReport = (reportId, title) => {
        console.log(`Downloading report ${reportId}: ${title}`);
        // In a real app, dispatch exportReport thunk here
    };

    const handlePreviewReport = (reportId) => {
        console.log(`Previewing report ${reportId}`);
    };
    
    // List of sections to include, matching the image content
    const reportSections = [
        'Executive Summary',
        'Competitor Activity',
        'Market Trends',
        'Social Sentiment',
        'Financial Analysis',
        'Strategic Recommendations'
    ];

    // --- Render Functions for Tabs ---

    const renderReportsList = () => (
        // Added reports-list-card class for custom body padding in CSS
        <Card className="reports-list-card" bordered={false}>
            {/* FIX: Added className to remove default margin-top from Typography.Title */}
            <Title level={4} className="reports-list-title-custom reports-inline-mb-4 reports-inline-padding-24">Available Reports</Title>
            <Text type="secondary" className="reports-inline-display-block reports-inline-pb-20">
                Generated strategic intelligence reports with source citations
            </Text>
            
            <div className="reports-inline-padding-24">
                {reports.map((report) => (
                    <div key={report.id} className="report-list-item">
                        <div className="report-info">
                            <FileTextOutlined className="report-icon" />
                            <div className="report-details">
                                <div className="report-title-row">
                                    <Text className="report-title-text">{report.title}</Text>
                                    <Tag className={`report-type-badge ${getReportTypeColor(report.type)}`}>
                                        {report.type}
                                    </Tag>
                                    <Tag className={`report-type-badge ${getStatusColor(report.status)}`}>
                                        {report.status === 'ready' ? 'ready' : report.status === 'generating' ? 'generating' : 'scheduled'}
                                    </Tag>
                                </div>
                                <Text className="report-meta-text">
                                    Generated {report.generated} &bull; {report.period} &bull; {report.size}
                                </Text>
                            </div>
                        </div>
                        
                        <div className="report-actions">
                            <Button  
                                size="small"
                                className="preview-btn"
                                onClick={() => handlePreviewReport(report.id)}
                                icon={<EyeOutlined />}
                            >
                                Preview
                            </Button>
                            {report.status === 'ready' && (
                                <Button
                                    size="small"
                                    className="download-btn"
                                    onClick={() => handleDownloadReport(report.id, report.title)}
                                    icon={<DownloadOutlined />}
                                >
                                    Download
                                </Button>
                            )}
                            {report.status === 'generating' && (
                                <Button
                                    size="small"
                                    disabled
                                    className="download-btn"
                                    icon={<LoadingOutlined />}
                                >
                                    Generating...
                                </Button>
                            )}
                            {report.status === 'scheduled' && (
                                <Button
                                    size="small"
                                    disabled
                                    className="download-btn"
                                    icon={<ScheduleOutlined />}
                                >
                                    Scheduled
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );

    const renderLiveAlerts = () => (
        // Added card-no-padding-top class for custom body padding in CSS
        <Card className="alerts-list-card card-no-padding-top" bordered={false}>
            {/* FIX: Added className to remove default margin-top from Typography.Title */}
            <Title level={4} className="alerts-list-title-custom reports-inline-mb-4">Live Intelligence Alerts</Title>
            <Text type="secondary" className="reports-inline-display-block reports-inline-mb-20">
                Real-time notifications about competitor activities and market changes
            </Text>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <div key={alert.id} className={`alert-list-item ${getAlertClass(alert.type)}`}>
                                <div className="alert-header">
                                    <div className="alert-title-row">
                                        <Text className="alert-title-text">{alert.title}</Text>
                                        <Tag className={`alert-type-badge ${getAlertBadgeClass(alert.type)}`}>
                                            {alert.type}
                                        </Tag>
                                    </div>
                                    <Button size="small" className="alert-view-details-btn">View Details</Button>
                                </div>
                                <p className="alert-description">{alert.description}</p>
                                <div className="alert-meta">
                                    <Text>{alert.timestamp}</Text> &bull; <Text>Source: {alert.source}</Text>
                                </div>
                            </div>
                        ))}
                    </div>
                </Col>
            </Row>
        </Card>
    );

    const renderGenerateForm = () => (
        <Row gutter={[30, 30]}>
            <Col xs={24} lg={12}>
                <Card bordered={false} className="card-no-padding-top"> 
                    
                    {/* START: In-body Header - MATCHING Quick Report Templates */}
                    <Title level={4} className="alerts-list-title-custom reports-inline-mt-0">
                        <RiseOutlined /> Generate Custom Report
                    </Title>
                    <Text type="secondary" className="reports-inline-display-block reports-inline-mb-20">
                        Create tailored strategic intelligence reports
                    </Text>
                    {/* END: In-body Header */}
                    
                    <Form 
                        form={form} 
                        layout="vertical" 
                        onFinish={handleGenerateReport} 
                        className="generate-form"
                        initialValues={{
                            title: 'Q4 Competitive Analysis - Technology Sector',
                            type: 'competitive',
                            // Default date range (10/17/2025 to 11/17/2025, since today is 11/17/2025)
                            dateRange: [dayjs('2025-10-17'), dayjs('2025-11-17')],
                            // Set initial selection to match the visual in the image
                            sections: ['Executive Summary', 'Competitor Activity', 'Market Trends', 'Social Sentiment', 'Financial Analysis', 'Strategic Recommendations']
                        }}
                    >
                        
                        {/* 1. Report Title (Required field with red asterisk) */}
                        <Form.Item 
                            name="title" 
                            label="Report Title" 
                            required 
                            tooltip={{ title: 'Required field', icon: <span className="reports-inline-color-red">*</span> }}
                            rules={[{ required: true, message: 'Please enter a report title' }]}
                        >
                            <Input placeholder="e.g., Q4 Competitive Analysis" />
                        </Form.Item>
                        
                        {/* 2. Report Type (Cleaned up: removed inline red tag) */}
                        <Form.Item name="type" label="Report Type">
                            <div className="select-with-tag-wrapper reports-inline-position-relative">
                                <Select>
                                    <Option value="executive">Executive Summary</Option>
                                    <Option value="competitive">Competitive Analysis</Option>
                                    <Option value="market">Market Intelligence</Option>
                                    <Option value="custom">Custom Report</Option>
                                </Select>
                                {/* Removed the inline-select-tag class/element to remove the red box */}
                            </div>
                        </Form.Item>
                        
                        {/* 3. Date Range (Using RangePicker) */}
                        <Form.Item label="Date Range" name="dateRange">
                            <DatePicker.RangePicker 
                                className="reports-inline-width-full"
                                placeholder={['Start date', 'End date']} 
                                allowClear={false}
                                format="MMMM D, YYYY"
                                // This is a hack to get the RangePicker to display the placeholder like the image
                                renderExtraFooter={() => <div className="reports-inline-datepicker-footer" />}
                            />
                        </Form.Item>

                        {/* 4. Include Sections - MODIFIED JSX: The inline style here combined with the corrected CSS is the solution */}
                        <Form.Item label="Include Sections" name="sections">
                            <Checkbox.Group 
                                // This forces the primary wrappers (.ant-checkbox-group-item) to stack vertically
                                className="reports-inline-width-full reports-inline-flex-column"
                            >
                                {reportSections.map((section) => (
                                    <Checkbox 
                                        key={section} 
                                        value={section} 
                                    >
                                        {section}
                                    </Checkbox>
                                ))}
                            </Checkbox.Group>
                        </Form.Item>

                        {/* 5. Generate Button (Now full width) */}
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            className="generate-report-btn generate-report-btn-full reports-inline-mt-24"
                        >
                            <RiseOutlined /> Generate Report
                        </Button>
                    </Form>
                </Card>
            </Col>
            
            <Col xs={24} lg={12}>
                {/* Added quick-templates-card class for custom body padding in CSS */}
                <Card 
                    className="quick-templates-card"
                    bordered={false}
                >
                    {/* START: In-body Header */}
                    {/* FIX: Added style to remove default margin-top from Title */}
                    <Title level={4} className="alerts-list-title-custom reports-inline-mb-4 reports-inline-mt-0">Quick Report Templates</Title>
                    <Text type="secondary" className="reports-inline-display-block reports-inline-mb-20">
                        Pre-configured report templates for common use cases
                    </Text>
                    {/* END: In-body Header */}
                    
                    {/* REMOVED: className="space-y-4" from the div below */}
                    <div> 
                        {[
                            { name: 'Weekly Competitive Brief', description: 'Key competitor movements and market changes', time: '~2 minutes' },
                            { name: 'Executive Dashboard Update', description: 'High-level summary for leadership team', time: '~3 minutes' },
                            { name: 'Product Launch Impact Analysis', description: 'Comprehensive analysis of new product launches', time: '~5 minutes' },
                            { name: 'Market Sentiment Report', description: 'Social media and news sentiment analysis', time: '~4 minutes' },
                        ].map((template, index) => (
                            // ADDED: quick-templates-list-item class for controlled vertical margin
                            <div 
                                key={index} 
                                className="quick-templates-list-item" 
                            >
                                <div className="report-details">
                                    {/* Used Text component instead of div for flexibility */}
                                    <Text className="report-title-text" strong>{template.name}</Text>
                                    <Text className="report-meta-text">{template.description}</Text>
                                    <Text className="report-meta-text reports-inline-mt-4 reports-inline-color-red">
                                        Generation time: <span className="reports-inline-color-red">{template.time}</span>
                                    </Text>
                                </div>
                                <Button size="small" className="quick-generate-btn" onClick={() => console.log('Generating quick report:', template.name)}>Generate</Button>
                            </div>
                        ))}
                    </div>
                </Card>
            </Col>
        </Row>
    );

    
    return (
        <div className="reports-page-ant">
            {/* Simple Title Bar - Same as Dashboard/Competitors Page */}
            <div className="page-title-section">
                <h1>
                    <FileTextOutlined className="page-title-icon" />
                    Reports
                </h1>
            </div>

            {/* Page Content */}
            <div className="page-content">
                {/* --- 1. Top Header Card (Reports & Alerts) --- */}
                <div className="dashboard-header-card">
                    <div className="header-text-content">
                        <h1 className="header-main-title">Reports & Alerts</h1>
                        <p className="header-subtitle">Executive-ready insights and real-time intelligence notifications</p>
                    </div>
                    
                    <div className="header-status-content">
                        <Tag className="critical-alerts-badge">
                            <BellOutlined className="reports-inline-mr-5" />
                            {criticalAlertCount} Critical Alerts
                        </Tag>
                        <Button className="generate-report-btn" onClick={() => setActiveTab('generate')}>
                            <FileTextOutlined />
                            Generate Report
                        </Button>
                    </div>
                </div>

                {/* --- 2. Main Tabs --- */}
                <Tabs 
                    defaultActiveKey="generate" // Keep default to 'generate' for demonstration
                    activeKey={activeTab}
                    onChange={setActiveTab} 
                    className="reports-tabs"
                    tabBarGutter={10}
                >
                    <TabPane 
                        tab={<><FileTextOutlined /> Reports</>} 
                        key="reports"
                    >
                        <Row gutter={[30, 30]} className="reports-inline-mt-20">
                            {/* Filters */}
                            <Col xs={24}>
                                <Card className="filter-card" title={<Title level={4}><FilterOutlined className="reports-inline-color-red reports-inline-mr-8" /> Filter Reports</Title>} bordered={false}>
                                    <div className="filter-controls">
                                        <Space size={20} wrap>
                                            <span className="filter-label">Type:</span>
                                            <Select defaultValue={filterType} className="report-select reports-inline-width-140" onChange={setFilterType}>
                                                <Option value="all">All Types</Option>
                                                <Option value="executive">Executive</Option>
                                                <Option value="competitive">Competitive</Option>
                                                <Option value="market">Market</Option>
                                                <Option value="custom">Custom</Option>
                                            </Select>
                                            
                                            <span className="filter-label">Period:</span>
                                            <Select defaultValue={filterPeriod} style={{ width: 120 }} onChange={setFilterPeriod} className="report-select">
                                                <Option value="7d">Last 7 days</Option>
                                                <Option value="30d">Last 30 days</Option>
                                                <Option value="90d">Last 90 days</Option>
                                                <Option value="1y">Last year</Option>
                                            </Select>

                                            <div className="search-input-wrapper">
                                                <SearchOutlined style={{ color: '#64748b' }} />
                                                <Input placeholder="Search reports..." style={{ minWidth: 200, maxWidth: 300 }} bordered={false} />
                                            </div>
                                        </Space>
                                    </div>
                                </Card>
                            </Col>

                            {/* Reports List */}
                            <Col xs={24}>
                                {renderReportsList()}
                            </Col>
                        </Row>
                    </TabPane>
                    
                    <TabPane 
                        tab={<><BellOutlined /> Live Alerts</>} 
                        key="alerts"
                    >
                        <div style={{ marginTop: 20 }}>
                            {renderLiveAlerts()}
                        </div>
                    </TabPane>
                    
                    <TabPane 
                        tab={<><RiseOutlined /> Generate</>} 
                        key="generate"
                    >
                        <div style={{ marginTop: 20 }}>
                            {renderGenerateForm()}
                        </div>
                    </TabPane>

                </Tabs>
                
            </div>
        </div>
    );
}

export default Reports;