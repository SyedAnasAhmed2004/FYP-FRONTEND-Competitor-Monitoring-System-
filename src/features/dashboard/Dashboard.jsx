import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Skeleton, Pagination } from 'antd';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';

// ── Palette ────────────────────────────────────────────────────────
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
const PLATFORM_COLORS    = { linkedin: '#0a66c2', twitter: '#1d9bf0', instagram: '#e1306c', facebook: '#1877f2' };
const CHANGE_TYPE_COLORS = { modified: '#3b82f6', added: '#10b981', removed: '#ef4444' };

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  color: '#f1f5f9',
  fontSize: '13px',
};

// ── Formatters ─────────────────────────────────────────────────────
const fmtNum = (n) => {
  if (n == null) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
};
const shortDate = (iso) => iso?.slice(5) ?? '';

// ── Reusable sub-components ────────────────────────────────────────
const ChartCardHeader = ({ title, subtitle, accentColor }) => (
  <div className="cc-header">
    {accentColor && <div className="cc-header-accent" style={{ background: accentColor }} />}
    <div>
      <div className="cc-title">{title}</div>
      <div className="cc-subtitle">{subtitle}</div>
    </div>
  </div>
);

const EmptyState = ({ message = 'No data available yet' }) => (
  <div className="d-empty">
    <div className="d-empty-icon">◌</div>
    <div>{message}</div>
  </div>
);

const CardSkeleton = ({ rows = 5 }) => (
  <Card bordered={false} className="chart-card">
    <Skeleton active paragraph={{ rows }} />
  </Card>
);

// ── Change-type helpers ────────────────────────────────────────────
const ctColor = (t) => t === 'added' ? '#10b981' : t === 'removed' ? '#ef4444' : '#3b82f6';
const ctBg    = (t) => t === 'added' ? '#ecfdf5' : t === 'removed' ? '#fef2f2' : '#eff6ff';

// Platform badge config
const PLATFORM_BG = {
  linkedin:  { bg: '#e8f4fc', color: '#0a66c2' },
  twitter:   { bg: '#e8f4fc', color: '#1d9bf0' },
  instagram: { bg: '#fce8f0', color: '#e1306c' },
  facebook:  { bg: '#e8edf9', color: '#1877f2' },
};

// ══════════════════════════════════════════════════════════════════
function DashboardPage() {
  const [currentTime, setCurrentTime] = useState('--:--:--');

  const [overview,         setOverview]         = useState(null);
  const [websiteTypeBD,    setWebsiteTypeBD]    = useState(null);
  const [websiteSigTrend,  setWebsiteSigTrend]  = useState(null);
  const [websitePerComp,   setWebsitePerComp]   = useState(null);
  const [websiteFeed,      setWebsiteFeed]      = useState(null);
  const [feedPage,         setFeedPage]         = useState(1);
  const [socialEngagement, setSocialEngagement] = useState(null);
  const [socialVolume,     setSocialVolume]     = useState(null);
  const [topPosts,         setTopPosts]         = useState(null);
  const [activeOpenings,   setActiveOpenings]   = useState(null);
  const [functionBD,       setFunctionBD]       = useState(null);
  const [newVsClosed,      setNewVsClosed]      = useState(null);
  const [seniority,        setSeniority]        = useState(null);
  const [platformComp,     setPlatformComp]     = useState(null);
  const [growthRate,       setGrowthRate]       = useState(null);

  const [loadingOverview,  setLoadingOverview]  = useState(false);
  const [loadingWebsite,   setLoadingWebsite]   = useState(false);
  const [loadingFeed,      setLoadingFeed]      = useState(false);
  const [loadingSocial,    setLoadingSocial]    = useState(false);
  const [loadingHiring,    setLoadingHiring]    = useState(false);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);

  useEffect(() => {
    const tick = () =>
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchOverview(); fetchWebsite(); fetchSocial();
    fetchHiring(); fetchSnapshots();
  }, []);

  useEffect(() => { fetchFeed(feedPage); }, [feedPage]);

  const fetchOverview = async () => {
    setLoadingOverview(true);
    const res = await dashboardService.getOverview();
    if (res.success) setOverview(res.data);
    setLoadingOverview(false);
  };

  const fetchWebsite = async () => {
    setLoadingWebsite(true);
    const [a, b, c] = await Promise.all([
      dashboardService.getWebsiteTypeBreakdown(),
      dashboardService.getWebsiteSignificanceTrend(),
      dashboardService.getWebsitePerCompetitor(),
    ]);
    if (a.success) setWebsiteTypeBD(a.data);
    if (b.success) setWebsiteSigTrend(b.data);
    if (c.success) setWebsitePerComp(c.data);
    setLoadingWebsite(false);
  };

  const fetchFeed = async (page) => {
    setLoadingFeed(true);
    const res = await dashboardService.getWebsiteFeed(page, 8);
    if (res.success) setWebsiteFeed(res.data);
    setLoadingFeed(false);
  };

  const fetchSocial = async () => {
    setLoadingSocial(true);
    const [a, b, c] = await Promise.all([
      dashboardService.getSocialEngagement(),
      dashboardService.getSocialVolumeTrend(),
      dashboardService.getTopPosts(),
    ]);
    if (a.success) setSocialEngagement(a.data);
    if (b.success) setSocialVolume(b.data);
    if (c.success) setTopPosts(c.data);
    setLoadingSocial(false);
  };

  const fetchHiring = async () => {
    setLoadingHiring(true);
    const [a, b, c, d] = await Promise.all([
      dashboardService.getActiveOpenings(),
      dashboardService.getFunctionBreakdown(),
      dashboardService.getNewVsClosed(),
      dashboardService.getSeniority(),
    ]);
    if (a.success) setActiveOpenings(a.data);
    if (b.success) setFunctionBD(b.data);
    if (c.success) setNewVsClosed(c.data);
    if (d.success) setSeniority(d.data);
    setLoadingHiring(false);
  };

  const fetchSnapshots = async () => {
    setLoadingSnapshots(true);
    const [a, b] = await Promise.all([
      dashboardService.getPlatformComparison(),
      dashboardService.getGrowthRate(),
    ]);
    if (a.success) setPlatformComp(a.data);
    if (b.success) setGrowthRate(b.data);
    setLoadingSnapshots(false);
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: KPI CARDS
  // ══════════════════════════════════════════════════════════════
  const renderKPIs = () => {
    if (loadingOverview) {
      return (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[...Array(6)].map((_, i) => (
            <Col key={i} xs={24} sm={12} xl={4}>
              <Card bordered={false} style={{ borderRadius: 14 }}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      );
    }
    const ov = overview ?? {};
    const kpis = [
      { title: 'Competitors',         subtitle: 'Actively monitored',      value: ov.total_competitors,       icon: '🏢', color: '#E63946', note: 'Full coverage active',      trend: '+2',   trendUp: true  },
      { title: 'Web Changes',         subtitle: 'Detected last 30 days',   value: ov.web_changes_30d,         icon: '🌐', color: '#c0202e', note: `${ov.significant_changes_30d ?? 0} significant`, trend: '+18%', trendUp: true  },
      { title: 'Significant Changes', subtitle: 'High-impact detections',  value: ov.significant_changes_30d, icon: '⚡', color: '#e11d48', note: 'Flagged for review',         trend: '+4',   trendUp: true  },
      { title: 'Active Job Postings', subtitle: 'Open positions tracked',  value: ov.active_job_postings,     icon: '💼', color: '#f43f5e', note: 'Live hiring signals',        trend: '+12%', trendUp: true  },
      { title: 'Social Posts',        subtitle: 'Published last 30 days',  value: ov.social_posts_30d,        icon: '📱', color: '#be123c', note: 'All platforms combined',    trend: '-5%',  trendUp: false },
      { title: 'Trend Alerts',        subtitle: 'High-confidence signals', value: ov.high_confidence_alerts,  icon: '🎯', color: '#fb7185', note: 'Actionable intelligence',   trend: '+1',   trendUp: true  },
    ];

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <Col key={i} xs={24} sm={12} xl={4}>
            <div className="d-kpi-card" style={{ borderTop: `3px solid ${k.color}` }}>
              <div className="d-kpi-top">
                <div className="d-kpi-icon-wrap" style={{ background: `${k.color}18` }}>
                  <span className="d-kpi-icon">{k.icon}</span>
                </div>
                <span className={`d-kpi-trend ${k.trendUp ? 'up' : 'down'}`}>
                  {k.trendUp ? '▲' : '▼'} {k.trend}
                </span>
              </div>
              <div className="d-kpi-number" style={{ color: '#0f172a' }}>{fmtNum(k.value)}</div>
              <div className="d-kpi-label">{k.title}</div>
              <div className="d-kpi-desc">{k.subtitle}</div>
              <div className="d-kpi-divider" />
              <div className="d-kpi-note" style={{ color: k.color }}>{k.note}</div>
            </div>
          </Col>
        ))}
      </Row>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: WEBSITE — CHANGE TYPE BREAKDOWN
  // ══════════════════════════════════════════════════════════════
  const renderWebsiteTypeBD = () => {
    if (loadingWebsite) return <CardSkeleton />;
    const data = websiteTypeBD?.breakdown ?? [];
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Change Type Breakdown" subtitle="Distribution of detected modification types" accentColor="#E63946" />}>
        {data.length === 0 ? <EmptyState /> : (
          <>
            <div className="d-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="change_type" type="category" stroke="#94a3b8" fontSize={12} width={68} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Count">
                    {data.map((entry, i) => (
                      <rect key={i} fill={CHANGE_TYPE_COLORS[entry.change_type] ?? COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="d-card-footer">
              <span>Total detected</span>
              <strong>{websiteTypeBD?.total?.toLocaleString()} changes</strong>
            </div>
          </>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: WEBSITE — SIGNIFICANCE TREND
  // ══════════════════════════════════════════════════════════════
  const renderWebsiteSigTrend = () => {
    if (loadingWebsite) return <CardSkeleton />;
    const data = websiteSigTrend?.series ?? [];
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Significance Trend" subtitle="Significant vs minor changes over 12 weeks" accentColor="#E63946" />}>
        {data.length === 0 ? <EmptyState /> : (
          <div className="d-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={shortDate} interval={2} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => `Week of ${v}`} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="significant" stackId="s" fill="#E63946" name="Significant" />
                <Bar dataKey="minor" stackId="s" fill="#bfdbfe" name="Minor" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: WEBSITE — PER COMPETITOR
  // ══════════════════════════════════════════════════════════════
  const renderWebsitePerComp = () => {
    if (loadingWebsite) return <CardSkeleton />;
    const data = websitePerComp?.competitors ?? [];
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Changes by Competitor" subtitle="Total vs significant changes — last 30 days" accentColor="#E63946" />}>
        {data.length === 0 ? <EmptyState /> : (
          <div className="d-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={72} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="total_changes"       fill="#3b82f6" name="Total"       radius={[0, 4, 4, 0]} />
                <Bar dataKey="significant_changes" fill="#E63946" name="Significant" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: WEBSITE — CHANGE FEED
  // ══════════════════════════════════════════════════════════════
  const renderWebsiteFeed = () => {
    const items = websiteFeed?.results ?? [];
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Website Change Feed" subtitle="Latest detected changes with AI-generated summaries" accentColor="#E63946" />}>
        {loadingFeed ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : items.length === 0 ? (
          <EmptyState message="No website changes detected yet" />
        ) : (
          <>
            <div className="d-feed-list">
              {items.map((item) => (
                <div key={item.id} className="d-feed-item">
                  <div className="d-feed-item-left">
                    <div className="d-feed-dot" style={{ background: ctColor(item.change_type) }} />
                  </div>
                  <div className="d-feed-body">
                    <div className="d-feed-top">
                      <span className="d-feed-company">{item.competitor_name}</span>
                      <div className="d-feed-tags">
                        <span className="d-badge" style={{ background: ctBg(item.change_type), color: ctColor(item.change_type), borderColor: `${ctColor(item.change_type)}30` }}>
                          {item.change_type}
                        </span>
                        {item.is_significant && (
                          <span className="d-badge d-badge-sig">Significant</span>
                        )}
                      </div>
                    </div>
                    <div className="d-feed-summary">{item.llm_summary}</div>
                    <div className="d-feed-time">{new Date(item.detected_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="d-pagination">
              <Pagination current={feedPage} total={websiteFeed?.count ?? 0} pageSize={8}
                onChange={setFeedPage} showTotal={(t) => `${t} total changes`} size="small" />
            </div>
          </>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: SOCIAL — ENGAGEMENT
  // ══════════════════════════════════════════════════════════════
  const renderSocialEngagement = () => {
    if (loadingSocial) return <CardSkeleton />;
    const data = socialEngagement?.competitors ?? [];
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Social Engagement" subtitle="Total likes, comments & shares per competitor (30d)" accentColor="#E63946" />}>
        {data.length === 0 ? <EmptyState /> : (
          <div className="d-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmtNum} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="total_likes"    stackId="eng" fill="#3b82f6" name="Likes" />
                <Bar dataKey="total_comments" stackId="eng" fill="#8b5cf6" name="Comments" />
                <Bar dataKey="total_shares"   stackId="eng" fill="#f59e0b" name="Shares" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: SOCIAL — VOLUME TREND
  // ══════════════════════════════════════════════════════════════
  const renderSocialVolume = () => {
    if (loadingSocial) return <CardSkeleton />;
    const raw = socialVolume?.series ?? [];
    const weeks = [...new Set(raw.map((d) => d.week))].sort();
    const platforms = [...new Set(raw.map((d) => d.platform))];
    const chartData = weeks.map((w) => {
      const obj = { week: shortDate(w) };
      raw.filter((d) => d.week === w).forEach((d) => { obj[d.platform] = d.count; });
      return obj;
    });

    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Social Post Volume" subtitle="Post count by platform over the last 12 weeks" accentColor="#E63946" />}>
        {chartData.length === 0 ? <EmptyState /> : (
          <div className="d-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#e2e8f0' }} />
                {platforms.map((p, i) => (
                  <Line key={p} type="monotone" dataKey={p}
                    stroke={PLATFORM_COLORS[p] ?? COLORS[i % COLORS.length]}
                    strokeWidth={2.5} dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                    name={p.charAt(0).toUpperCase() + p.slice(1)} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: SOCIAL — TOP POSTS
  // ══════════════════════════════════════════════════════════════
  const renderTopPosts = () => {
    if (loadingSocial) return <CardSkeleton rows={7} />;
    const posts = topPosts?.posts ?? [];
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Top Social Posts" subtitle="Highest-engagement competitor posts this month" accentColor="#E63946" />}>
        {posts.length === 0 ? <EmptyState message="No posts found" /> : (
          <div className="d-posts-list">
            {posts.map((p, idx) => {
              const plt = PLATFORM_BG[p.platform] ?? { bg: '#f1f5f9', color: '#64748b' };
              return (
                <div key={p.id} className="d-post-item">
                  <div className="d-post-rank">#{idx + 1}</div>
                  <div className="d-post-body">
                    <div className="d-post-top">
                      <span className="d-post-company">{p.competitor_name}</span>
                      <span className="d-post-author">by {p.author_name}</span>
                      <span className="d-post-platform" style={{ background: plt.bg, color: plt.color }}>
                        {p.platform}
                      </span>
                    </div>
                    <div className="d-post-date">{new Date(p.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <div className="d-post-stats">
                    <div className="d-post-stat">
                      <span className="d-post-stat-val">{fmtNum(p.num_likes)}</span>
                      <span className="d-post-stat-lbl">Likes</span>
                    </div>
                    <div className="d-post-stat">
                      <span className="d-post-stat-val">{fmtNum(p.num_comments)}</span>
                      <span className="d-post-stat-lbl">Comments</span>
                    </div>
                    <div className="d-post-stat">
                      <span className="d-post-stat-val">{fmtNum(p.num_shares)}</span>
                      <span className="d-post-stat-lbl">Shares</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: HIRING — ACTIVE OPENINGS
  // ══════════════════════════════════════════════════════════════
  const renderActiveOpenings = () => {
    if (loadingHiring) return <CardSkeleton />;
    const data = activeOpenings?.competitors ?? [];
    const max = Math.max(...data.map((d) => d.active_openings), 1);
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Active Job Openings" subtitle="Current open positions by competitor" accentColor="#E63946" />}>
        {data.length === 0 ? <EmptyState /> : (
          <>
            <div className="d-bar-list">
              {data.map((item, i) => (
                <div key={i} className="d-bar-row">
                  <div className="d-bar-label">{item.name}</div>
                  <div className="d-bar-track">
                    <div className="d-bar-fill" style={{ width: `${(item.active_openings / max) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <div className="d-bar-val">{item.active_openings}</div>
                </div>
              ))}
            </div>
            <div className="d-card-footer">
              <span>Total active positions</span>
              <strong>{activeOpenings?.total_active?.toLocaleString()}</strong>
            </div>
          </>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: HIRING — FUNCTION BREAKDOWN
  // ══════════════════════════════════════════════════════════════
  const renderFunctionBD = () => {
    if (loadingHiring) return <CardSkeleton />;
    const data = functionBD?.breakdown ?? [];
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Hiring by Function" subtitle="Open roles distributed by job function" accentColor="#E63946" />}>
        {data.length === 0 ? <EmptyState /> : (
          <div className="d-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="job_function" type="category" stroke="#94a3b8" fontSize={11} width={88} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="count" name="Openings" radius={[0, 6, 6, 0]}>
                  {data.map((_, i) => <rect key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: HIRING — SIGNALS + SENIORITY
  // ══════════════════════════════════════════════════════════════
  const renderHiringSignals = () => {
    if (loadingHiring) return <CardSkeleton rows={7} />;
    const sig = newVsClosed;
    const sen = seniority?.breakdown ?? [];
    const maxCount = sen[0]?.count ?? 1;
    const SIGNAL_COLORS = { growing: '#10b981', stable: '#3b82f6', consolidating: '#ef4444' };
    const sigColor = SIGNAL_COLORS[sig?.signal] ?? '#64748b';
    const sigIcon  = sig?.signal === 'growing' ? '📈' : sig?.signal === 'stable' ? '➡️' : '📉';

    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Hiring Signals" subtitle="Market direction & seniority distribution" accentColor="#E63946" />}>
        {sig && (
          <div className="d-signal-box" style={{ borderColor: `${sigColor}40`, background: `${sigColor}08` }}>
            <div className="d-signal-icon">{sigIcon}</div>
            <div className="d-signal-body">
              <div className="d-signal-label" style={{ color: sigColor }}>{sig.signal?.toUpperCase()} MARKET</div>
              <div className="d-signal-stats">
                <span><strong>{sig.new_jobs}</strong> new</span>
                <span>·</span>
                <span><strong>{sig.closed_jobs}</strong> closed</span>
                <span>·</span>
                <span>ratio <strong>{sig.ratio}×</strong></span>
              </div>
            </div>
          </div>
        )}
        <div className="d-seniority-list">
          {sen.map((item, i) => (
            <div key={i} className="d-seniority-row">
              <span className="d-seniority-lbl">{item.seniority_level}</span>
              <div className="d-seniority-track">
                <div className="d-seniority-fill" style={{ width: `${(item.count / maxCount) * 100}%`, background: COLORS[i % COLORS.length] }} />
              </div>
              <span className="d-seniority-cnt">{item.count}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: FOLLOWER — PLATFORM COMPARISON
  // ══════════════════════════════════════════════════════════════
  const renderPlatformComp = () => {
    if (loadingSnapshots) return <CardSkeleton />;
    const competitors = platformComp?.competitors ?? [];
    const chartData = competitors.map((c) => ({
      name: c.name, linkedin: c.platforms?.linkedin ?? 0, twitter: c.platforms?.twitter ?? 0,
    }));
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Follower Platform Comparison" subtitle="LinkedIn vs Twitter followers per competitor" accentColor="#E63946" />}>
        {chartData.length === 0 ? <EmptyState /> : (
          <div className="d-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmtNum} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="linkedin" fill={PLATFORM_COLORS.linkedin} name="LinkedIn" radius={[4, 4, 0, 0]} />
                <Bar dataKey="twitter"  fill={PLATFORM_COLORS.twitter}  name="Twitter"  radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: FOLLOWER — GROWTH RATE
  // ══════════════════════════════════════════════════════════════
  const renderGrowthRate = () => {
    if (loadingSnapshots) return <CardSkeleton rows={7} />;
    const competitors = growthRate?.competitors ?? [];
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Follower Growth Rate"
          subtitle={`Month-over-month on ${growthRate?.platform ?? 'LinkedIn'}`} accentColor="#E63946" />}>
        {competitors.length === 0 ? <EmptyState message="No follower snapshot data" /> : (
          <div className="d-growth-list">
            {competitors.map((c, i) => {
              const up = c.direction === 'up';
              return (
                <div key={i} className="d-growth-row">
                  <div className="d-growth-info">
                    <span className="d-growth-name">{c.name}</span>
                    <span className="d-growth-followers">{fmtNum(c.current_followers)} followers</span>
                  </div>
                  <div className="d-growth-bar-wrap">
                    <div className="d-growth-track">
                      <div className="d-growth-fill" style={{ width: `${Math.min(Math.abs(c.growth_pct) * 10, 100)}%`, background: up ? '#10b981' : '#ef4444' }} />
                    </div>
                  </div>
                  <div className={`d-growth-pct ${up ? 'up' : 'down'}`}>
                    {up ? <RiseOutlined /> : <FallOutlined />}
                    {up ? '+' : ''}{c.growth_pct?.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // MAIN RETURN
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="strategic-dashboard-ant">
      <div className="page-title-section">
        <h1><span className="page-title-icon">📊</span> Dashboard</h1>
      </div>

      <div className="page-content">

        {/* ── Hero Banner ── */}
        <div className="d-hero-banner">
          <div className="d-hero-grid-bg" />
          <div className="d-hero-glow" />
          <div className="d-hero-content">
            <div>
              <h1 className="d-hero-title">Strategic Intelligence Dashboard</h1>
              <p className="d-hero-subtitle">AI-powered competitive intelligence and real-time market insights</p>
            </div>
            <div className="d-hero-right">
              <div className="d-hero-time">{currentTime}</div>
              <div className="d-ai-badge">
                <span className="d-ai-pulse" />
                AI Active
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        {renderKPIs()}

        {/* ══ Website Change Intelligence ══ */}
        <Row gutter={[20, 20]} className="d-equal-row" style={{ marginBottom: 24 }}>
          <Col xs={24} lg={8} className="d-equal-col">{renderWebsiteTypeBD()}</Col>
          <Col xs={24} lg={8} className="d-equal-col">{renderWebsiteSigTrend()}</Col>
          <Col xs={24} lg={8} className="d-equal-col">{renderWebsitePerComp()}</Col>
        </Row>
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24}>{renderWebsiteFeed()}</Col>
        </Row>

        {/* ══ Social Media Intelligence ══ */}
        <Row gutter={[20, 20]} className="d-equal-row" style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12} className="d-equal-col">{renderSocialEngagement()}</Col>
          <Col xs={24} lg={12} className="d-equal-col">{renderSocialVolume()}</Col>
        </Row>
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24}>{renderTopPosts()}</Col>
        </Row>

        {/* ══ Hiring Intelligence ══ */}
        <Row gutter={[20, 20]} className="d-equal-row" style={{ marginBottom: 32 }}>
          <Col xs={24} lg={8} className="d-equal-col">{renderActiveOpenings()}</Col>
          <Col xs={24} lg={8} className="d-equal-col">{renderFunctionBD()}</Col>
          <Col xs={24} lg={8} className="d-equal-col">{renderHiringSignals()}</Col>
        </Row>

        {/* ══ Follower Analytics ══ */}
        <Row gutter={[20, 20]} className="d-equal-row" style={{ marginBottom: 32 }}>
          <Col xs={24} lg={12} className="d-equal-col">{renderPlatformComp()}</Col>
          <Col xs={24} lg={12} className="d-equal-col">{renderGrowthRate()}</Col>
        </Row>

      </div>
    </div>
  );
}

export default DashboardPage;
