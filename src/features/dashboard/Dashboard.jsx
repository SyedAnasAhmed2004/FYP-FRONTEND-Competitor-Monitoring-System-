import React from 'react';
import { Row, Col, Card, Typography, Tag, List } from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  BarChartOutlined,
  ArrowDownOutlined,
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

// --- MOCK DATA ---
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
      {/* Simple Title Bar - Same as Competitors Page */}
      <div className="page-title-section">
        <h1>
          <BarChartOutlined className="page-title-icon" />
          Dashboard
        </h1>
      </div>

      {/* Page Content */}
      <div className="page-content">
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
              <div className="dashboard-chart-container">
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
              <div className="dashboard-chart-container">
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
              <div className="dashboard-chart-container-small">
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
              <div className="dashboard-chart-container-small">
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