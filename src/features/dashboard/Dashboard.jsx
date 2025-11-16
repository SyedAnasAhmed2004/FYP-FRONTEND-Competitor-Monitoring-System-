import React from 'react';
import { Row, Col, Card, Typography, Tag, List, Grid } from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  BarChartOutlined,
  ArrowDownOutlined, // Added for the down arrow icon
  MessageOutlined // Icon for the new Title Bar
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const { Title } = Typography;
const { useBreakpoint } = Grid;

// --- CSS STYLES (Merged and refined for AntD/Figma look) ---
const DASHBOARD_STYLES = `
/* --- Global Overrides for Dashboard Layout --- */

.strategic-dashboard-ant {
    background-color: #f8f8f8; /* Light gray background */
}

.strategic-dashboard-ant .page-content {
    padding: 24px;
}

/* Base Card Styling (Shadow and Border) */
.strategic-dashboard-ant .ant-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
    background-color: #fcfcfc; /* Subtle off-white for chart backgrounds */
    border: 1px solid #fee2e2; /* Unified light pink border for all cards */
}

/* --- NEW: Simple Page Title Section (Matching Competitors Page style) --- */
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


/* --- FIX: Chart/List Card Header Stacking --- */
/* The entire card head content is now controlled by the title CSS */
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


/* --- 1. HEADER CARD STYLES (Old Main Dashboard Header - Now below the new bar) --- */

.dashboard-header-card {
    /* Mimics Card appearance */
    background-color: white;
    padding: 24px 30px; 
    border-radius: 12px;
    /* Main Dashboard Header space below it */
    margin-bottom: 40px; 
    
    /* Subtle border matching the design (pink/red from your primary color) */
    border: 2px solid #fee2e2; /* border-red-100 */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    
    /* Layout */
    display: flex;
    justify-content: space-between;
    align-items: center; 
}

/* FIX: Reduce font size to match other section headers */
.header-main-title {
    font-size: 20px !important; 
    font-weight: 800 !important;
    color: #1a1a1a !important; 
    margin: 0 0 4px 0 !important; 
}

.header-subtitle {
    color: #64748b; 
    font-size: 15px;
    margin: 0 !important;
}

.header-status-content {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: #64748b;
    white-space: nowrap; 
}

.last-updated-text {
    margin: 0;
    color: #64748b;
}

/* Styling the 'AI Active' tag */
.ai-active-tag.ant-tag {
    /* Light green background */
    background-color: #dcfce7 !important; /* bg-green-100 */
    color: #057850 !important; /* text-green-800 */
    border: none !important;
    font-weight: 600;
    border-radius: 8px !important;
    padding: 4px 10px !important;
    font-size: 13px;
    height: auto;
}

.ai-active-tag.ant-tag::before {
    content: ""; 
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #10b981; /* bg-green-500 */
    border-radius: 50%;
    margin-right: 6px;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* --- 2. KPI CARDS STYLES (Unchanged) --- */

.kpi-card-row {
    margin-bottom: 40px !important; /* Increased margin bottom for section separation */
}

.kpi-card {
    border-radius: 12px !important;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05) !important;
    transition: all 0.3s ease !important;
    position: relative;
    overflow: hidden;
    height: 100%;
    /* Default background */
    background: white; 
}

/* Specific KPI Card Backgrounds to match Figma */
.kpi-card.red { 
    background: #fef2f2 !important; /* Very light red */
    border-color: #fca5a5 !important; /* Light red border */
}
.kpi-card.amber { 
    background: #fffbeb !important; /* Very light amber */
    border-color: #fcd34d !important; /* Light amber border */
}
.kpi-card.blue { 
    background: #eff6ff !important; /* Very light blue */
    border-color: #93c5fd !important; /* Light blue border */
}
.kpi-card.emerald { 
    background: #ecfdf5 !important; /* Very light green */
    border-color: #a7f3d0 !important; /* Light green border */
}

.kpi-card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important;
}


/* Icon Wrapper Styling (Colored Square) */
.kpi-icon-wrapper {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    font-size: 24px;
}

.kpi-icon-wrapper.red { background-color: #dc2626; } 
.kpi-icon-wrapper.amber { background-color: #d97706; } 
.kpi-icon-wrapper.blue { background-color: #3b82f6; } 
.kpi-icon-wrapper.emerald { background-color: #10b981; } 


/* Text Content */
.kpi-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 0px;
}

.kpi-subtitle {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 12px;
}

.kpi-value {
    font-size: 36px !important;
    font-weight: 800 !important;
    color: #1a1a1a !important;
    margin-bottom: 6px !important;
}

.kpi-change {
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
}

.kpi-change.positive {
    color: #059669; /* text-green-600 */
}
.kpi-change.critical {
    color: #dc2626; /* text-red-600 */
}

/* Progress Bar */
.kpi-progress-bar-wrapper {
    width: 100%;
    height: 6px;
    border-radius: 6px;
    margin-top: 12px;
}
.kpi-progress-bar-wrapper.red-progress { background-color: #fecaca; } 
.kpi-progress-bar-wrapper.amber-progress { background-color: #fde68a; } 
.kpi-progress-bar-wrapper.blue-progress { background-color: #bfdbfe; } 
.kpi-progress-bar-wrapper.emerald-progress { background-color: #a7f3d0; } 

.kpi-progress-bar {
    height: 100%;
    border-radius: 6px;
    /* Specific gradients are handled here */
    background-color: #dc2626;
}


/* --- 3. METRIC CARDS STYLES (Unchanged) --- */

.metric-card-row {
    margin-bottom: 40px !important; /* Increased margin bottom for section separation */
}

/* CRITICAL FIX: Custom class to force 5 columns to take up 100% width, 20% each */
.col-20-width {
    /* Override Ant Design's grid system for this specific 5-column row on large screens */
    flex: 0 0 20% !important; 
    max-width: 20% !important;
}

/* Ensure consistent card height by setting flex on Col content */
.metric-card {
    border-radius: 12px !important; /* More rounded corners */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
    border: 1px solid #fee2e2 !important; /* Pinkish border to match the second image */
    height: 100%;
    background-color: white; /* Explicitly white background */
}

.metric-card .ant-card-body {
    padding: 18px !important;
}

.metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.metric-title {
    font-size: 14px;
    font-weight: 500;
    color: #4b5563; /* text-gray-700 */
    margin: 0;
}

.metric-chart-icon {
    font-size: 16px;
}
.metric-chart-icon.green { color: #059669; }
.metric-chart-icon.red { color: #dc2626; }

.metric-value.ant-typography {
    font-size: 24px !important;
    font-weight: 700 !important;
    color: #1a1a1a !important;
    margin-bottom: 4px !important;
}

.metric-details {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
}

.metric-badge.ant-tag {
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    height: auto;
    line-height: 1;
}

.metric-badge.positive {
    background-color: #ecfdf5 !important; /* bg-green-50 */
    border-color: #a7f3d0 !important; /* border-green-200 */
    color: #059669 !important; /* text-green-700 */
}
.metric-badge.negative {
    background-color: #fef2f2 !important; /* bg-red-50 */
    border-color: #fca5a5 !important; /* border-red-200 */
    color: #dc2626 !important; /* text-red-700 */
}

.metric-abs-change {
    font-size: 12px;
    font-weight: 500;
}
.metric-abs-change.positive { color: #059669; }
.metric-abs-change.negative { color: #dc2626; }


.metric-footer {
    padding-top: 10px;
    border-top: 1px solid #f1f5f9;
    margin-top: 10px;
    font-size: 12px;
}

.metric-footer p {
    display: flex;
    justify-content: space-between;
    color: #64748b;
    margin-bottom: 4px;
}

.metric-footer-value {
    font-weight: 600;
    color: #1a1a1a;
}

/* --- 4. CHART GRID STYLES (Unchanged) --- */
.chart-grid-row {
    margin-bottom: 40px !important; /* Increased margin between chart sections */
}

/* --- 6. RECENT ACTIVITY LIST STYLES --- */

.activity-list-item {
    display: flex;
    align-items: flex-start; /* CRITICAL: Must use flex-start to align dot/icon with top line */
    gap: 12px;
    /* Reduced padding for tighter vertical spacing */
    padding: 12px 0; 
    border-bottom: 1px solid #f1f5f9;
}

.activity-list-item:last-child {
    border-bottom: none;
}

/* FIX: Smaller, better-aligned dot */
.activity-dot {
    width: 6px; 
    height: 6px; 
    border-radius: 50%;
    /* Final alignment adjustment: Adjusted margin-top to bring it down */
    margin-top: 6px; 
    flex-shrink: 0;
}

/* Activity Dot Colors */
.activity-dot.red { background-color: #ef4444; }
.activity-dot.green { background-color: #10b981; }
.activity-dot.amber { background-color: #f59e0b; }
.activity-dot.blue { background-color: #3b82f6; }
.activity-dot.purple { background-color: #8b5cf6; }
.activity-dot.slate { background-color: #64748b; }
.activity-dot.emerald { background-color: #059669; }

.activity-content {
    flex: 1;
    line-height: 1.5;
}

.activity-title {
    font-size: 14px;
    font-weight: 600; /* Bolder as per image 2 */
    color: #1a1a1a;
    /* Reduced margin-bottom for tighter vertical spacing */
    margin-bottom: 2px; 
    line-height: 1.2; /* Tighter line height for better alignment with dot */
}

.activity-meta {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 6px; /* Reduced from 8px for tighter spacing */
}

.activity-tag.ant-tag {
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    height: auto;
    line-height: 1;
}

/* Activity Tag Colors (Unchanged) */
.activity-tag.red { 
    background-color: #fef2f2 !important; 
    border-color: #fca5a5 !important; 
    color: #dc2626 !important; 
}
.activity-tag.green { background-color: #ecfdf5 !important; border-color: #a7f3d0 !important; color: #059669 !important; }
.activity-tag.amber { background-color: #fffbeb !important; border-color: #fcd34d !important; color: #d97706 !important; }
.activity-tag.blue { background-color: #eff6ff !important; border-color: #93c5fd !important; color: #3b82f6 !important; }
.activity-tag.purple { background-color: #f5f3ff !important; border-color: #d8b4fe !important; color: #7c3aed !important; }
.activity-tag.slate { background-color: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #4b5563 !important; }
.activity-tag.emerald { background-color: #ecfdf5 !important; border-color: #a7f3d0 !important; color: #059669 !important; }


.activity-trend-icon {
    font-size: 18px;
    margin-top: 4px;
    flex-shrink: 0;
}

.trend-icon.positive { color: #059669; }
.trend-icon.negative { color: #dc2626; } /* Consistent red for negative trend */
`;


// --- MOCK DATA (Unchanged) ---
const engagementData = [
  { name: 'Jan', our: 2400, competitor1: 2100, competitor2: 1800 },
  { name: 'Feb', our: 2210, competitor1: 2300, competitor2: 1900 },
  { name: 'Mar', our: 2290, competitor1: 2200, competitor2: 2100 },
  { name: 'Apr', our: 2000, competitor1: 2000, competitor2: 1950 },
  { name: 'May', our: 2181, competitor1: 2150, competitor2: 2000 },
  { name: 'Jun', our: 2500, competitor1: 2400, competitor2: 2200 },
];

const stockMarketData = [
  { month: 'Jan', ourCompany: 145.50, techCorp: 128.30, innovateLab: 92.80, futureTech: 167.20, digitalFirst: 78.50 },
  { month: 'Feb', ourCompany: 152.75, techCorp: 135.60, innovateLab: 98.40, futureTech: 171.90, digitalFirst: 82.10 },
  { month: 'Mar', ourCompany: 148.20, techCorp: 142.80, innovateLab: 95.30, futureTech: 165.40, digitalFirst: 79.80 },
  { month: 'Apr', ourCompany: 156.90, techCorp: 138.50, innovateLab: 101.60, futureTech: 173.80, digitalFirst: 85.20 },
  { month: 'May', ourCompany: 163.40, techCorp: 145.20, innovateLab: 107.20, futureTech: 178.50, digitalFirst: 88.90 },
  { month: 'Jun', ourCompany: 171.80, techCorp: 151.90, innovateLab: 112.80, futureTech: 184.30, digitalFirst: 92.40 },
];

const weeklyGrowthData = [
  { name: 'Mon', followers: 1240, engagement: 340, posts: 12 },
  { name: 'Tue', followers: 1280, engagement: 380, posts: 15 },
  { name: 'Wed', followers: 1350, engagement: 420, posts: 18 },
  { name: 'Thu', followers: 1420, engagement: 390, posts: 16 },
  { name: 'Fri', followers: 1500, engagement: 480, posts: 22 },
  { name: 'Sat', followers: 1580, engagement: 520, posts: 25 },
  { name: 'Sun', followers: 1650, engagement: 450, posts: 20 },
];

const sentimentAnalysisData = [
  { month: 'Jan', ourCompany: 72, techCorp: 65, innovateLab: 58, industry: 62 },
  { month: 'Feb', ourCompany: 75, techCorp: 67, innovateLab: 61, industry: 64 },
  { month: 'Mar', ourCompany: 78, techCorp: 70, innovateLab: 59, industry: 63 },
  { month: 'Apr', ourCompany: 81, techCorp: 68, innovateLab: 63, industry: 65 },
  { month: 'May', ourCompany: 83, techCorp: 72, innovateLab: 66, industry: 67 },
  { month: 'Jun', ourCompany: 86, techCorp: 74, innovateLab: 68, industry: 69 },
];

const competitorStockStats = [
  {  
    company: 'Our Company',  
    price: 171.80,  
    change: 18.20,  
    changePercent: 11.85,  
    marketCap: '245.3B',
    volume: '12.4M',
    trend: 'up'  
  },
  {  
    company: 'TechCorp',  
    price: 151.90,  
    change: 23.60,  
    changePercent: 18.40,  
    marketCap: '198.7B',
    volume: '15.2M',
    trend: 'up'  
  },
  {  
    company: 'InnovateLab',  
    price: 112.80,  
    change: 20.00,  
    changePercent: 21.55,  
    marketCap: '87.5B',
    volume: '8.9M',
    trend: 'up'  
  },
  {  
    company: 'FutureTech',  
    price: 184.30,  
    change: 17.10,  
    changePercent: 10.23,  
    marketCap: '312.8B',
    volume: '18.7M',
    trend: 'up'  
  },
  {  
    company: 'DigitalFirst',  
    price: 92.40,  
    change: 13.90,  
    changePercent: 17.71,  
    marketCap: '52.1B',
    volume: '6.3M',
    trend: 'up'  
  },
];

const recentActivities = [
    { text: 'TechCorp launched new AI product', time: 'Detected 15 minutes ago', priority: 'High Priority', tag: 'Competitive Threat', trend: 'down', color: 'red' },
    { text: 'Market share increased by 1.2%', time: 'Updated 1 hour ago', priority: 'Positive Trend', tag: 'Market Position', trend: 'up', color: 'green' },
    { text: 'InnovateLab pricing strategy change', time: 'Detected 2 hours ago', priority: 'Medium Priority', tag: 'Pricing Alert', trend: 'down', color: 'amber' },
    { text: 'New competitor entered market', time: 'Detected 3 hours ago', priority: 'Monitor', tag: 'New Entrant', trend: 'down', color: 'blue' },
    { text: 'Patent filing detected by FutureTech', time: 'Detected 5 hours ago', priority: 'Strategic Intel', tag: 'IP Intelligence', trend: 'down', color: 'purple' },
    { text: 'Customer sentiment analysis complete', time: 'Completed 6 hours ago', priority: 'Report Ready', tag: 'Analytics', trend: 'up', color: 'slate' },
    { text: 'Q2 performance report generated', time: 'Generated 7 hours ago', priority: 'Ready to View', tag: 'Report', trend: 'up', color: 'emerald' },
];

function DashboardPage() {
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  // const screens = useBreakpoint(); // Removed unused variable

  // Helper component for KPI card content structure
  const KPICardContent = ({ title, subtitle, value, change, changeClass, progressBarClass, progressBarWidth, icon, iconColor, valueSize = 1 }) => (
    <Card className={`kpi-card ${iconColor}`} bordered={false}>
      <div className={`kpi-icon-wrapper ${iconColor}`}>
        <span className="kpi-icon-placeholder">{icon}</span>
      </div>
      <p className="kpi-title">{title}</p>
      <p className="kpi-subtitle">{subtitle}</p>
      <Title level={valueSize} className="kpi-value">{value}</Title>
      <div className={`kpi-change ${changeClass}`}>
        {change}
      </div>
      {progressBarWidth && (
        <div className={`kpi-progress-bar-wrapper ${progressBarClass}`}>
          <div className="kpi-progress-bar" style={{ width: progressBarWidth }}></div>
        </div>
      )}
    </Card>
  );

  // Helper component for Metric card content structure
  const MetricCardContent = ({ stock }) => {
    const trendIcon = stock.trend === 'up' ? <RiseOutlined className="metric-chart-icon green" /> : <FallOutlined className="metric-chart-icon red" />;
    const trendClass = stock.trend === 'up' ? 'positive' : 'negative';

    return (
      <Card className="metric-card" bordered={false}>
        <div className="metric-header">
          <p className="metric-title">{stock.company}</p>
          {trendIcon}
        </div>
        <Title level={2} className="metric-value">${stock.price.toFixed(2)}</Title>
        <div className="metric-details">
          <Tag className={`metric-badge ${trendClass}`}>
            {stock.trend === 'up' ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </Tag>
          <span className={`metric-abs-change ${trendClass}`}>
            ${stock.change.toFixed(2)}
          </span>
        </div>
        <div className="metric-footer">
          <p>Market Cap <span className="metric-footer-value"> ${stock.marketCap}</span></p>
          <p>Volume <span className="metric-footer-value"> {stock.volume}</span></p>
        </div>
      </Card>
    );
  };


  return (
    <div className="strategic-dashboard-ant">
        {/* Inject Styles to resolve compilation error */}
        <style>{DASHBOARD_STYLES}</style> 
        
      <div className="page-content">
        
        {/* --- NEW: Simple Page Title Section (Matching Competitors Page style) --- */}
        <div className="page-title-section">
          <h1>
            <BarChartOutlined className="page-title-icon" />
            Dashboard
          </h1>
        </div>
        
        {/* --- 1. REINSERTED: Strategic Intelligence Dashboard Header Card --- */}
        <div className="dashboard-header-card">
          <div className="header-text-content">
            <h1 className="header-main-title">Strategic Intelligence Dashboard</h1>
            <p className="header-subtitle">AI-powered competitive intelligence and real-time market insights</p>
          </div>
          
          <div className="header-status-content">
            <p className="last-updated-text">Last updated: {currentTime}</p>
            <Tag className="ai-active-tag">AI Active</Tag>
          </div>
        </div>


        {/* --- 2. EXECUTIVE SUMMARY STATS (KPI CARDS) --- */}
        <Row gutter={[24, 24]} className="kpi-card-row">
          <Col xs={24} sm={12} lg={6}>
            <KPICardContent 
              title="Market Intelligence" 
              subtitle="Strategic Insights Generated" 
              value="2,847"
              change="+23.5% this week"
              changeClass="positive"
              icon="🧠" 
              iconColor="red"
              progressBarWidth="78%"
              progressBarClass="red-progress"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KPICardContent 
              title="Critical Events" 
              subtitle="High Priority Alerts" 
              value="12"
              change="3 need immediate action"
              changeClass="critical"
              icon="⚡" 
              iconColor="amber"
              progressBarWidth="25%"
              progressBarClass="amber-progress"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KPICardContent 
              title="Competitive Position" 
              subtitle="Market Share Advantage" 
              value="+4.2%"
              change="vs. closest competitor"
              changeClass="positive"
              icon="🎯" 
              iconColor="blue"
              progressBarWidth="67%"
              progressBarClass="blue-progress"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KPICardContent 
              title="Data Coverage" 
              subtitle="Active Intelligence Sources" 
              value="347"
              change="98.3% uptime"
              changeClass="positive"
              icon="📡" 
              iconColor="emerald"
              progressBarWidth="98%"
              progressBarClass="emerald-progress"
            />
          </Col>
        </Row>

        {/* --- 3. STOCK MARKET STATS CARDS (Fixed to 5 columns in one row) --- */}
        <Row gutter={[24, 24]} className="metric-card-row">
          {competitorStockStats.map((stock, index) => (
            /* Apply the custom CSS class on large screens to force 20% width */
            <Col key={index} xs={24} sm={12} lg={4} className="col-20-width"> 
              <MetricCardContent stock={stock} />
            </Col>
          ))}
        </Row>

        {/* --- 4. MAIN ANALYTICS GRID (Charts) --- */}
        <Row gutter={[24, 24]} className="chart-grid-row">
          
          {/* Strategic Intelligence Trends (Area Chart) */}
          <Col xs={24} lg={12}>
            <Card
              className="chart-card" // This now has the unified border
              title={
                  <div className="chart-header-title-container">
                      <span className="chart-header-title">Strategic Intelligence Trends</span>
                      <p className="chart-subtitle-stacked">AI-detected competitor movements and market positioning over time</p>
                  </div>
              }
              bordered={false}
            >
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="our" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.1} name="Our Performance" />
                    <Area type="monotone" dataKey="competitor1" stackId="2" stroke="#059669" fill="#059669" fillOpacity={0.1} name="TechCorp" />
                    <Area type="monotone" dataKey="competitor2" stackId="3" stroke="#d97706" fill="#d97706" fillOpacity={0.1} name="InnovateLab" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Competitor Stock Market Performance (Line Chart) */}
          <Col xs={24} lg={12}>
            <Card
              className="chart-card" // This now has the unified border
              title={
                  <div className="chart-header-title-container">
                      <span className="chart-header-title">Competitor Stock Market Performance</span>
                      <p className="chart-subtitle-stacked">Real-time stock price tracking across competitive landscape</p>
                  </div>
              }
              bordered={false}
            >
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockMarketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" domain={['auto', 'auto']} tickFormatter={(value) => `$${value}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(value) => `$${value}`} />
                    <Line type="monotone" dataKey="ourCompany" stroke="#dc2626" strokeWidth={3} name="Our Company" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="techCorp" stroke="#059669" strokeWidth={2} name="TechCorp" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="innovateLab" stroke="#d97706" strokeWidth={2} name="InnovateLab" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="futureTech" stroke="#7c3aed" strokeWidth={2} name="FutureTech" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="digitalFirst" stroke="#3b82f6" strokeWidth={2} name="DigitalFirst" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* --- 5. CHARTS GRID (Weekly Growth & Sentiment) --- */}
        <Row gutter={[24, 24]} className="chart-grid-row">
          
          {/* Weekly Growth Metrics (Bar Chart) */}
          <Col xs={24} lg={12}>
            <Card
              className="chart-card" // This now has the unified border
              title={
                  <div className="chart-header-title-container">
                      <span className="chart-header-title">Weekly Growth Metrics</span>
                      <p className="chart-subtitle-stacked">Follower and engagement growth trends</p>
                  </div>
              }
              bordered={false}
            >
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="followers" fill="#dc2626" name="Followers" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="engagement" fill="#059669" name="Engagement" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Market Sentiment Analysis (Line Chart) */}
          <Col xs={24} lg={12}>
            <Card
              className="chart-card" // This now has the unified border
              title={
                  <div className="chart-header-title-container">
                      <span className="chart-header-title">Market Sentiment Analysis</span>
                      <p className="chart-subtitle-stacked">Brand perception and sentiment scores comparison</p>
                  </div>
              }
              bordered={false}
            >
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sentimentAnalysisData}>
                    <CartesianGrid strokeDashDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[50, 90]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(value) => `${value}%`} />
                    <Line type="monotone" dataKey="ourCompany" stroke="#dc2626" strokeWidth={3} name="Our Company" dot={{ r: 4, fill: '#dc2626' }} />
                    <Line type="monotone" dataKey="techCorp" stroke="#059669" strokeWidth={2} name="TechCorp" dot={{ r: 3, fill: '#059669' }} />
                    <Line type="monotone" dataKey="innovateLab" stroke="#d97706" strokeWidth={2} name="InnovateLab" dot={{ r: 3, fill: '#d97706' }} />
                    <Line type="monotone" dataKey="industry" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" name="Industry Avg" dot={{ r: 3, fill: '#64748b' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* --- 6. RECENT ACTIVITY LIST --- */}
        <Card
          className="chart-card" // This now has the unified border
          title={
              // FIX: Combine Title and Subtitle in the title prop to force stacking
              <div className="chart-header-title-container">
                  <span className="chart-header-title">Recent Activity</span>
                  <p className="chart-subtitle-stacked">Latest competitive intelligence updates and strategic alerts</p>
              </div>
          }
          bordered={false}
          // Removed the `extra` prop entirely since content is now in `title`
        >
          <List
            itemLayout="horizontal"
            dataSource={recentActivities}
            renderItem={(item) => (
              <div className="activity-list-item">
                <div className={`activity-dot ${item.color}`}></div>
                <div className="activity-content">
                  <p className="activity-title">{item.text}</p>
                  <p className="activity-meta">{item.time} &bull; {item.priority}</p>
                  <Tag className={`activity-tag ${item.color}`}>{item.tag}</Tag>
                </div>
                <div className="activity-trend-icon">
                  {item.trend === 'up' ? (
                    <RiseOutlined className="trend-icon positive" />
                  ) : (
                    // Down arrow icon for negative trend
                    <ArrowDownOutlined className="trend-icon negative" /> 
                  )}
                </div>
              </div>
            )}
          />
        </Card>

      </div>
    </div>
  );
}

export default DashboardPage;