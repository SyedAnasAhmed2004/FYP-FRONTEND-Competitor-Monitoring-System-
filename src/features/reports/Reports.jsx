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

// --- CSS STYLES (Embedded) ---
const REPORTS_STYLES = `
/* Global Page Layout */
.reports-page-ant {
    background-color: #f8f8f8;
    min-height: 100vh;
}

.reports-page-ant .page-content {
    padding: 24px;
    margin: 0; /* Ensures full width utilization */
}

/* Base Card Styles */
.reports-page-ant .ant-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 1px solid #fee2e2; /* Light pink border */
    transition: box-shadow 0.3s ease;
}

/* IMPORTANT FIX: Reduce card body padding for cards with custom header/titles */
.reports-page-ant .card-no-padding-top .ant-card-body {
    padding-top: 15px !important; /* Reduced from 24px */
}

.reports-page-ant .ant-card-head {
    border-bottom: 1px solid #f1f5f9;
}

.reports-page-ant .ant-card-body {
    padding: 24px;
}

/* --- NEW: Simple Page Title Section (Dashboard/Reports look) --- */
.page-title-section {
    background-color: white;
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
    margin: -24px -24px 20px -24px; /* Pulls into the page content area edges */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.page-title-section h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    display: flex;
    align-items: center;
}

.page-title-icon {
    font-size: 28px;
    margin-right: 10px;
    color: #1a1a1a;
}
/* --- END NEW STYLES --- */


/* --- FIX: Chart/List Card Header Stacking (For general titles like Filter Reports) --- */
.strategic-dashboard-ant .chart-card .ant-card-head {
    border-bottom: 1px solid #f1f5f9;
    padding: 20px 24px 16px;
    display: block;  
}

.strategic-dashboard-ant .chart-card .ant-card-head-title {
    padding: 0;
    /* Use flex column to stack content inside the title container */
    display: flex;  
    flex-direction: column;
    align-items: flex-start;
}

.chart-header-title {
    font-size: 18px !important;
    font-weight: 600 !important;
    color: #1a1a1a !important;
    margin-bottom: 4px; /* Space between title and subtitle */
}

.chart-subtitle-stacked {
    font-size: 14px;  
    color: #64748b;
    font-weight: 400;
    margin: 0;
}


/* --- 1. REPORTS & ALERTS HEADER CARD (Synchronized with Dashboard Header) --- */
.dashboard-header-card {
    /* CRITICAL: Matches Dashboard Card Border/Shadow/Sizing */
    background-color: white;
    /* REDUCED PADDING to match the perceived smaller height of the Dashboard card */
    padding: 3px 5px;  
    border-radius: 12px;
    margin-bottom: 40px;  
    
    border: 2px solid #fee2e2; /* CRITICAL: Border color match */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-card-content {
    display: flex;
    justify-content: space-between;
    align-items: center; /* Vertically aligns title block with buttons/tag */
    flex-wrap: wrap;
    gap: 15px;
}

.header-title-main {
    font-size: 20px !important; /* Matches Dashboard title font size */
    font-weight: 800 !important;
    color: #1a1a1a !important;  
    /* Reduced margin below title */
    margin: 0 0 4px 0 !important;  
    line-height: 1.2;
}

.header-subtitle-main {
    font-size: 15px;
    color: #64748b;
    margin: 0 !important;
    line-height: 1.2;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
}

/* Critical Alerts Badge Button */
.critical-alerts-badge.ant-tag {
    background-color: #fef2f2 !important; /* bg-red-50 */
    color: #dc2626 !important; /* text-red-700 */
    border: 1px solid #fca5a5 !important; /* border-red-200 */
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 14px;
    height: auto;
    cursor: default;
}

/* Generate Report Button (Primary/Red) */
.ant-btn.generate-report-btn {
    background-color: #dc2626 !important; /* Red */
    border-color: #dc2626 !important;
    color: white;
    font-weight: 600;
    padding: 6px 12px;
    height: auto;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.ant-btn.generate-report-btn:hover {
    background-color: #b91c1c !important; /* Darker Red */
}


/* --- 2. TABS STYLES --- */
.reports-tabs .ant-tabs-nav-list {
    background-color: #f1f5f9; /* Muted background */
    border-radius: 12px;
    padding: 4px;
}

.reports-tabs .ant-tabs-tab {
    padding: 8px 18px;
    margin: 0;
    border-radius: 8px;
    transition: all 0.2s ease;
    font-weight: 500;
    color: #64748b; /* Muted text */
}

.reports-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #dc2626 !important; /* Active Red */
}

.reports-tabs .ant-tabs-ink-bar {
    background-color: transparent !important;
}

.reports-tabs .ant-tabs-tab-active {
    background-color: white !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    color: #dc2626;
    border: none;
}

.reports-tabs .ant-tabs-tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
}


/* --- 3. FILTER CARD STYLES --- */
.filter-card .ant-card-head-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
}

.filter-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;
}

.filter-label {
    font-weight: 500;
    color: #1a1a1a;
}

/* Style AntD Selects and Inputs */
.filter-controls .ant-select,
.filter-controls .ant-picker,
.filter-controls .ant-input-affix-wrapper {
    min-width: 120px;
    border-radius: 8px !important;
    border-color: #e2e8f0 !important;
}

.search-input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 250px;
}

/* --- 4. REPORTS LIST STYLES --- */

.reports-list-card .ant-card-head {
    border-bottom: none;
    padding-bottom: 0;
}
.reports-list-card .ant-card-head-title {
    font-size: 18px;
    font-weight: 600;
}
.reports-list-card .ant-card-extra {
    font-size: 14px;
    color: #64748b;
}

/* FIX: Top margin for titles in AVAILABLE REPORTS and LIVE ALERTS */
.reports-list-title-custom,
.alerts-list-title-custom {
    margin-top: 0 !important; /* Critical: Removes default margin-top from Typography.Title */
}

.reports-list-card .ant-card-body {
    /* Set a custom padding for the report list card body */
    padding: 15px 24px 24px !important;  
}


.report-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    /* CRITICAL: Add margin-bottom here for spacing between list items */
    margin-bottom: 15px; 
    transition: background-color 0.2s;
    background-color: white;
}

.report-list-item:hover {
    background-color: #f7f7f7;
}

.report-info {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-grow: 1;
}

.report-icon {
    font-size: 32px;
    color: #dc2626; /* Primary red color */
    flex-shrink: 0;
}

.report-details {
    display: flex;
    flex-direction: column;
}

.report-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.report-title-text {
    font-weight: 600;
    font-size: 16px;
    color: #1a1a1a;
}

.report-meta-text {
    font-size: 13px;
    color: #64748b;
    margin-top: 2px;
}

/* Report Type Badges */
.ant-tag.report-type-badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 12px;
    height: auto;
}
.report-type-executive { background-color: #f3e8ff; color: #7c3aed; border: none; }
.report-type-competitive { background-color: #fee2e2; color: #dc2626; border: none; }
.report-type-market { background-color: #dbeafe; color: #3b82f6; border: none; }
.report-type-custom { background-color: #d1fae5; color: #059669; border: none; }

/* Report Status Badges */
.report-status-ready { background-color: #d1fae5; color: #059669; border: none; }
.report-status-generating { background-color: #fef9c3; color: #d97706; border: none; }
.report-status-scheduled { background-color: #dbeafe; color: #3b82f6; border: none; }


/* Action Buttons */
.report-actions {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
}

.ant-btn.preview-btn {
    background-color: white;
    border-color: #e2e8f0;
    color: #4b5563; /* Dark gray text */
    font-weight: 600;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    height: 38px;
}
.ant-btn.preview-btn:hover {
    background-color: #f7f7f7;
    border-color: #d1d5db;
    color: #1a1a1a;
}

.ant-btn.download-btn {
    background-color: #dc2626 !important;
    border-color: #dc2626 !important;
    color: white;
    font-weight: 600;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    height: 38px;
}
.ant-btn.download-btn:hover {
    background-color: #b91c1c !important;
}

/* --- 5. ALERTS LIST STYLES --- */
.alert-list-item {
    padding: 15px 20px;
    border: 1px solid;
    border-radius: 10px;
    margin-bottom: 15px;
    background-color: white;
}

/* Alert Colors & Fonts */
.alert-type-critical {  
    border-color: #fca5a5 !important;  
    background-color: #fef2f2 !important;  
    color: #dc2626; /* Critical text color */
}  
.alert-type-warning {  
    border-color: #fcd34d !important;  
    background-color: #fffbeb !important;  
    color: #d97706; /* Warning text color */
}  
.alert-type-info {  
    border-color: #93c5fd !important;  
    background-color: #eff6ff !important;  
    color: #3b82f6; /* Info text color */
}

.alert-list-item .alert-title-text,
.alert-list-item .alert-description {
    color: inherit; /* Inherit color from alert type */
}


.alert-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.alert-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.alert-title-text {
    font-size: 16px;
    font-weight: 600;
    color: inherit; /* Inherit color from parent (.alert-type-X) */
}

.alert-description {
    font-size: 14px;
    color: inherit; /* Inherit color from parent (.alert-type-X) */
    margin-bottom: 10px;
}

.alert-meta {
    font-size: 12px;
    color: inherit; /* Inherit color from parent (.alert-type-X) */
    margin-top: 5px;
}

/* Alert Type Badges */
.ant-tag.alert-type-badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 12px;
    height: auto;
}
.alert-type-badge.critical { background-color: #fca5a5; color: #dc2626; border: none; }
.alert-type-badge.warning { background-color: #fcd34d; color: #d97706; border: none; }
.alert-type-badge.info { background-color: #93c5fd; color: #3b82f6; border: none; }

/* --- "View Details" button for alerts (Neutral Secondary Look) --- */
.ant-btn.alert-view-details-btn {
    background-color: white !important;
    border-color: #e2e8f0 !important;
    color: #4b5563 !important; /* Dark Gray Text */
    font-weight: 600;
    border-radius: 8px;
    padding: 4px 12px;
    height: 38px;
}
.ant-btn.alert-view-details-btn:hover {
    background-color: #f7f7f7 !important;
    border-color: #d1d5db !important;
    color: #1a1a1a !important;
}

/* --- Quick Report Template "Generate" button --- */
.ant-btn.quick-generate-btn {
    background-color: white !important;
    border-color: #dc2626 !important;
    color: #dc2626 !important;
    font-weight: 600;
    border-radius: 8px;
    padding: 4px 12px;
    height: 38px;
}
.ant-btn.quick-generate-btn:hover {
    background-color: #fef2f2 !important;
    border-color: #dc2626 !important;
    color: #dc2626 !important;
}

/* FIX: Specific style for Quick Report Template titles in Form tab */
.quick-templates-card .ant-card-body {
    padding-top: 15px !important; /* Reduced from 24px */
}

.quick-templates-card .ant-typography {
    margin-top: 0 !important;
}

/* --- 6. GENERATE FORM STYLES --- */
.generate-form .ant-form-item-label > label {
    font-weight: 600;
    color: #1a1a1a;
}

.generate-form .ant-input,
.generate-form .ant-select-selector,
.generate-form .ant-picker {
    border-radius: 8px !important;
    border-color: #e2e8f0 !important;
}

/* MODIFICATION: To keep text inline with checkbox and stack vertically */
.generate-form .ant-checkbox-group-item {
    margin-right: 0 !important; 
    padding: 4px 0; 
    line-height: 22px;
    width: 100%;
}

.generate-form .ant-checkbox-wrapper {
    margin-left: 0 !important; 
}


/* Custom styling for the header inside the card body */
.generate-form-header-title {
    margin-top: 0 !important;
    margin-bottom: 4px !important;
}

/* Custom style for inline Tag in Report Type Select (now removed as per request, but keeping placeholder style) */
.select-with-tag-wrapper .ant-select-selection-item {
    padding-right: 12px !important; /* Reset padding */
}

/* New style for the full-width generate button */
.generate-report-btn-full {
    width: 100%;
    text-align: center;
    justify-content: center;
}

/* NEW/MODIFIED STYLE FOR QUICK REPORT TEMPLATES */
/* Applies a larger bottom margin specifically to the Quick Report Template list items */
.quick-templates-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    /* INCREASED GAP: Adds a decent amount of vertical space between blocks */
    margin-bottom: 28px !important; 
    background-color: white;
    transition: box-shadow 0.3s ease;
}

.quick-templates-list-item:last-child {
    margin-bottom: 0 !important;
}

/* Adjustments for nested typography in Quick Templates */
.quick-templates-list-item .report-title-text {
    margin-bottom: 2px;
    display: block;
}
.quick-templates-list-item .report-meta-text {
    margin-top: 2px;
}
`;


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
            <Title level={4} className="reports-list-title-custom" style={{ marginBottom: 4, padding: '0 24px' }}>Available Reports</Title>
            <Text type="secondary" style={{ display: 'block', padding: '0 24px 20px' }}>
                Generated strategic intelligence reports with source citations
            </Text>
            
            <div style={{ padding: '0 24px' }}>
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
            <Title level={4} className="alerts-list-title-custom" style={{ marginBottom: 4 }}>Live Intelligence Alerts</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
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
                    <Title level={4} className="generate-form-header-title" style={{ marginTop: 0 }}>
                        <RiseOutlined /> Generate Custom Report
                    </Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
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
                            tooltip={{ title: 'Required field', icon: <span style={{ color: 'red' }}>*</span> }}
                            rules={[{ required: true, message: 'Please enter a report title' }]}
                        >
                            <Input placeholder="e.g., Q4 Competitive Analysis" />
                        </Form.Item>
                        
                        {/* 2. Report Type (Cleaned up: removed inline red tag) */}
                        <Form.Item name="type" label="Report Type">
                            <div style={{ position: 'relative' }} className="select-with-tag-wrapper">
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
                                style={{ width: '100%' }} 
                                placeholder={['Start date', 'End date']} 
                                allowClear={false}
                                format="MMMM D, YYYY"
                                // This is a hack to get the RangePicker to display the placeholder like the image
                                renderExtraFooter={() => <div style={{ height: 0, padding: 0, margin: 0 }} />}
                            />
                        </Form.Item>

                        {/* 4. Include Sections - MODIFIED JSX: The inline style here combined with the corrected CSS is the solution */}
                        <Form.Item label="Include Sections" name="sections">
                            <Checkbox.Group 
                                // This forces the primary wrappers (.ant-checkbox-group-item) to stack vertically
                                style={{ width: '100%', display: 'flex', flexDirection: 'column' }} 
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
                            className="generate-report-btn generate-report-btn-full" 
                            style={{ marginTop: 24 }}
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
                    <Title level={4} style={{ marginBottom: 4, marginTop: 0 }}>Quick Report Templates</Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
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
                                    <Text className="report-meta-text" style={{ marginTop: 4, color: '#dc2626' }}>
                                        Generation time: <span style={{ color: '#dc2626' }}>{template.time}</span>
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
            {/* Inject Styles */}
            <style>{REPORTS_STYLES}</style>
            
            <div className="page-content">
                
                {/* NEW: Simple Page Title Section (Matching Dashboard Page style) */}
                <div className="page-title-section">
                    <h1>
                        <FileTextOutlined className="page-title-icon" />
                        Reports
                    </h1>
                </div>

                {/* --- 1. Top Header Card (Reports & Alerts) --- */}
                <Card className="dashboard-header-card" bordered={false}>
                    <div className="header-card-content">
                        <div>
                            <Title level={2} className="header-title-main">Reports & Alerts</Title>
                            <p className="header-subtitle-main">
                                Executive-ready insights and real-time intelligence notifications
                            </p>
                        </div>
                        <div className="header-actions">
                            <Tag className="critical-alerts-badge">
                                <BellOutlined style={{ marginRight: 5 }} />
                                {criticalAlertCount} Critical Alerts
                            </Tag>
                            {/* Button to quickly switch to generate tab if not already there */}
                            <Button className="generate-report-btn" onClick={() => setActiveTab('generate')}>
                                <FileTextOutlined />
                                Generate Report
                            </Button>
                        </div>
                    </div>
                </Card>

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
                        <Row gutter={[30, 30]} style={{ marginTop: 20 }}>
                            {/* Filters */}
                            <Col xs={24}>
                                <Card className="filter-card" title={<Title level={4}><FilterOutlined style={{ color: '#dc2626', marginRight: 8 }} /> Filter Reports</Title>} bordered={false}>
                                    <div className="filter-controls">
                                        <Space size={20} wrap>
                                            <span className="filter-label">Type:</span>
                                            <Select defaultValue={filterType} style={{ width: 140 }} onChange={setFilterType} className="report-select">
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