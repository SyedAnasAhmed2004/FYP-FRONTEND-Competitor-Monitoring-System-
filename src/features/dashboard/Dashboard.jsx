import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Card, Skeleton, Pagination, Select, Tooltip as AntTooltip } from 'antd';
import { RiseOutlined, FallOutlined, BankOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell, ReferenceLine, Legend,
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import { selectCompetitors, fetchCompetitors } from '../competitors/competitorsSlice';
import NewsWidget from './NewsWidget';

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

const InfoButton = ({ text }) => (
  <AntTooltip title={text} placement="topRight" zIndex={9999} overlayInnerStyle={{ maxWidth: 260, fontSize: 12, lineHeight: 1.6 }}>
    <InfoCircleOutlined style={{ color: '#b0bec5', cursor: 'help', fontSize: 13 }} />
  </AntTooltip>
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
  const [feedPage,           setFeedPage]           = useState(1);
  const [feedCompFilter,     setFeedCompFilter]     = useState(null);
  const [feedDays,           setFeedDays]           = useState(null);
  const [feedCategoryFilter, setFeedCategoryFilter] = useState(null);
  const [socialEngagement, setSocialEngagement] = useState(null);
  const [socialVolume,     setSocialVolume]     = useState(null);
  const [topPosts,         setTopPosts]         = useState(null);
  const [activeOpenings,   setActiveOpenings]   = useState(null);
  const [functionBD,       setFunctionBD]       = useState(null);
  const [newVsClosed,      setNewVsClosed]      = useState(null);
  const [seniority,        setSeniority]        = useState(null);
  const [platformComp,     setPlatformComp]     = useState(null);
  const [growthRate,       setGrowthRate]       = useState(null);

  const [typeBDFilter,     setTypeBDFilter]     = useState(null);
  const [sigTrendWeeks,    setSigTrendWeeks]    = useState(12);
  const [sigTrendCompFilter, setSigTrendCompFilter] = useState(null);

  const [loadingOverview,  setLoadingOverview]  = useState(false);
  const [loadingWebsite,   setLoadingWebsite]   = useState(false);
  const [loadingFeed,      setLoadingFeed]      = useState(false);
  const [loadingSocial,    setLoadingSocial]    = useState(false);
  const [loadingHiring,    setLoadingHiring]    = useState(false);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);

  // ── Financial Intelligence (FMP)
  const [selectedFinComp, setSelectedFinComp] = useState(null);
  const [finProfile,      setFinProfile]      = useState(null);
  const [finMarketCap,    setFinMarketCap]     = useState(null);
  const [finIncome,       setFinIncome]        = useState(null);
  const [finGrowth,       setFinGrowth]        = useState(null);
  const [finRatios,       setFinRatios]        = useState(null);
  const [finRating,       setFinRating]        = useState(null);
  const [loadingFin,      setLoadingFin]       = useState(false);

  const dispatch       = useDispatch();
  const allCompetitors = useSelector(selectCompetitors) ?? [];
  const finCompetitors = allCompetitors.filter(c => c.stock_symbol);

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

  useEffect(() => { fetchFeed(feedPage, feedCompFilter, feedDays, feedCategoryFilter); }, [feedPage, feedCompFilter, feedDays, feedCategoryFilter]);

  useEffect(() => {
    dispatch(fetchCompetitors());
  }, []);

  useEffect(() => {
    const doFetch = async () => {
      const res = await dashboardService.getWebsiteTypeBreakdown(typeBDFilter);
      if (res.success) setWebsiteTypeBD(res.data);
    };
    doFetch();
  }, [typeBDFilter]);

  useEffect(() => {
    const doFetch = async () => {
      const res = await dashboardService.getWebsiteSignificanceTrend(sigTrendWeeks, sigTrendCompFilter);
      if (res.success) setWebsiteSigTrend(res.data);
    };
    doFetch();
  }, [sigTrendWeeks, sigTrendCompFilter]);

  useEffect(() => {
    if (finCompetitors.length > 0 && !selectedFinComp) {
      setSelectedFinComp(finCompetitors[0].id);
    }
  }, [finCompetitors.length]);

  useEffect(() => {
    if (selectedFinComp) fetchFinancial(selectedFinComp);
  }, [selectedFinComp]);

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

  const fetchFeed = async (page, competitorId, days, category) => {
    setLoadingFeed(true);
    const res = await dashboardService.getWebsiteFeed(page, 8, competitorId, days, category);
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

  const fetchFinancial = async (id) => {
    setLoadingFin(true);
    setFinProfile(null); setFinMarketCap(null); setFinIncome(null);
    setFinGrowth(null);  setFinRatios(null);    setFinRating(null);
    const [a, b, c, d, e, f] = await Promise.all([
      dashboardService.getFinancialProfile(id),
      dashboardService.getMarketCap(id, 5),
      dashboardService.getIncome(id, 5),
      dashboardService.getGrowth(id),
      dashboardService.getRatios(id),
      dashboardService.getRating(id),
    ]);
    if (a.success && a.data?.available) setFinProfile(a.data);
    if (b.success && b.data?.available) setFinMarketCap(b.data);
    if (c.success && c.data?.available) setFinIncome(c.data);
    if (d.success && d.data?.available) setFinGrowth(d.data);
    if (e.success && e.data?.available) setFinRatios(e.data);
    if (f.success && f.data?.available) setFinRating(f.data);
    setLoadingFin(false);
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

    const filterSelect = (
      <Select
        size="small"
        style={{ width: 148 }}
        value={typeBDFilter ?? 'all'}
        onChange={(v) => setTypeBDFilter(v === 'all' ? null : v)}
        options={[
          { value: 'all', label: 'All Competitors' },
          ...allCompetitors.map(c => ({ value: c.id, label: c.name })),
        ]}
      />
    );

    return (
      <Card
        bordered={false}
        className="chart-card"
        title={<ChartCardHeader title="Change Type Breakdown" subtitle="Distribution of detected modification types" accentColor="#E63946" />}
        extra={filterSelect}
      >
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
                      <Cell key={i} fill={CHANGE_TYPE_COLORS[entry.change_type] ?? COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="d-card-footer">
              <span>{typeBDFilter ? allCompetitors.find(c => c.id === typeBDFilter)?.name ?? 'Filtered' : 'All competitors'}</span>
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

    const sigTrendFilters = (
      <div style={{ display: 'flex', gap: 6 }}>
        <Select
          size="small"
          style={{ width: 96 }}
          value={sigTrendWeeks}
          onChange={(v) => setSigTrendWeeks(v)}
          options={[
            { value: 4,  label: '4 weeks'  },
            { value: 8,  label: '8 weeks'  },
            { value: 12, label: '12 weeks' },
            { value: 24, label: '24 weeks' },
          ]}
        />
        <Select
          size="small"
          style={{ width: 148 }}
          value={sigTrendCompFilter ?? 'all'}
          onChange={(v) => setSigTrendCompFilter(v === 'all' ? null : v)}
          options={[
            { value: 'all', label: 'All Competitors' },
            ...allCompetitors.map(c => ({ value: c.id, label: c.name })),
          ]}
        />
      </div>
    );

    return (
      <Card
        bordered={false}
        className="chart-card"
        title={<ChartCardHeader title="Significance Trend" subtitle={`Significant vs minor changes — last ${sigTrendWeeks} weeks`} accentColor="#E63946" />}
        extra={sigTrendFilters}
      >
        {data.length === 0 ? <EmptyState /> : (
          <div className="d-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="week"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={shortDate}
                  interval={Math.max(0, Math.ceil(data.length / 6) - 1)}
                />
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
  const CATEGORY_TABS = [
    { key: null,           label: 'All'          },
    { key: 'critical',     label: 'Critical'     },
    { key: 'non_critical', label: 'Non-Critical' },
    { key: 'technical',    label: 'Technical'    },
  ];

  const CATEGORY_STYLE = {
    critical:     { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
    non_critical: { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd' },
    technical:    { bg: '#f8fafc', color: '#64748b', border: '#cbd5e1' },
  };

  const renderWebsiteFeed = () => {
    const items = websiteFeed?.results ?? [];

    const handleFeedCompChange     = (v) => { setFeedPage(1); setFeedCompFilter(v === 'all' ? null : v); };
    const handleFeedDaysChange     = (v) => { setFeedPage(1); setFeedDays(v === 'all' ? null : v); };
    const handleFeedCategoryChange = (key) => { setFeedPage(1); setFeedCategoryFilter(key); };

    const feedFilters = (
      <div style={{ display: 'flex', gap: 6 }}>
        <Select
          size="small"
          style={{ width: 112 }}
          value={feedDays ?? 'all'}
          onChange={handleFeedDaysChange}
          options={[
            { value: 'all', label: 'All time'    },
            { value: 7,     label: 'Last 7 days' },
            { value: 14,    label: 'Last 14 days'},
            { value: 30,    label: 'Last 30 days'},
            { value: 60,    label: 'Last 60 days'},
          ]}
        />
        <Select
          size="small"
          style={{ width: 148 }}
          value={feedCompFilter ?? 'all'}
          onChange={handleFeedCompChange}
          options={[
            { value: 'all', label: 'All Competitors' },
            ...allCompetitors.map(c => ({ value: c.id, label: c.name })),
          ]}
        />
      </div>
    );

    return (
      <Card
        bordered={false}
        className="chart-card"
        title={<ChartCardHeader title="Website Change Feed" subtitle="Latest detected changes with AI-generated summaries" accentColor="#E63946" />}
        extra={feedFilters}
      >
        {/* Category filter tabs */}
        <div className="d-feed-category-tabs">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={String(tab.key)}
              className={`d-feed-cat-tab${feedCategoryFilter === tab.key ? ' active' : ''}`}
              onClick={() => handleFeedCategoryChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loadingFeed ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : items.length === 0 ? (
          <EmptyState message="No website changes for the selected filters" />
        ) : (
          <>
            <div className="d-feed-list">
              {items.map((item) => {
                const catStyle = CATEGORY_STYLE[item.change_category] ?? CATEGORY_STYLE.technical;
                const isCritical = item.change_category === 'critical';
                return (
                  <div key={item.id} className={`d-feed-item${isCritical ? ' d-feed-item--critical' : ''}`}>
                    <div className="d-feed-item-left">
                      <div className="d-feed-dot" style={{ background: ctColor(item.change_type) }} />
                    </div>
                    <div className="d-feed-body">
                      <div className="d-feed-top">
                        <span className="d-feed-company">{item.competitor_name}</span>
                        <div className="d-feed-tags">
                          {/* change_type badge */}
                          <span className="d-badge" style={{ background: ctBg(item.change_type), color: ctColor(item.change_type), borderColor: `${ctColor(item.change_type)}30` }}>
                            {item.change_type}
                          </span>
                          {/* change_category badge */}
                          {item.change_category && (
                            <span className="d-badge" style={{ background: catStyle.bg, color: catStyle.color, borderColor: catStyle.border }}>
                              {item.change_category === 'non_critical' ? 'Non-Critical' : item.change_category.charAt(0).toUpperCase() + item.change_category.slice(1)}
                            </span>
                          )}
                          {/* Critical indicator (replaces old is_significant) */}
                          {isCritical && (
                            <span className="d-badge d-badge-sig">Significant</span>
                          )}
                        </div>
                      </div>
                      <div className="d-feed-summary">{item.llm_summary}</div>
                      <div className="d-feed-time">{new Date(item.detected_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="d-pagination">
              <Pagination
                current={feedPage}
                total={websiteFeed?.count ?? 0}
                pageSize={8}
                onChange={(p) => setFeedPage(p)}
                showTotal={(t) => `${t} total changes`}
                size="small"
              />
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
  // RENDER: FINANCIAL — KPI STRIP
  // ══════════════════════════════════════════════════════════════
  const renderFinKPIs = () => {
    if (loadingFin) {
      return (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <Col key={i} xs={24} sm={12} xl={6}>
              <Card bordered={false} style={{ borderRadius: 14 }}>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      );
    }
    const p       = finProfile;
    const income  = finIncome?.series?.slice(-1)[0];
    const ratios  = finRatios?.ratios;
    const kpis = [
      { label: 'Market Cap',   value: fmtNum(p?.market_cap),                                        sub: p?.currency ?? 'USD',                            color: '#E63946', icon: '📈', info: 'Current total market value of the company, calculated as stock price × shares outstanding.' },
      { label: 'Revenue',      value: fmtNum(income?.revenue),                                      sub: income?.date ? `FY ${income.date.slice(0,4)}` : '—', color: '#3b82f6', icon: '💰', info: 'Total sales revenue generated in the most recent fiscal year.' },
      { label: 'Net Income',   value: fmtNum(income?.net_income),                                   sub: income?.date ? `FY ${income.date.slice(0,4)}` : '—', color: (income?.net_income ?? 0) >= 0 ? '#10b981' : '#ef4444', icon: (income?.net_income ?? 0) >= 0 ? '✅' : '🔻', info: 'Net profit after all expenses and taxes in the most recent fiscal year.' },
      { label: 'P/E Ratio',    value: ratios?.price_earnings_ratio != null ? ratios.price_earnings_ratio.toFixed(1) : '—', sub: p?.sector ?? p?.industry ?? '—', color: '#8b5cf6', icon: '📊', info: 'Price-to-Earnings ratio — how much investors pay per unit of profit. Lower generally indicates a cheaper valuation.' },
    ];
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <Col key={i} xs={24} sm={12} xl={6}>
            <div className="d-kpi-card" style={{ borderTop: `3px solid ${k.color}` }}>
              <div className="d-kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="d-kpi-icon-wrap" style={{ background: `${k.color}18` }}>
                  <span className="d-kpi-icon">{k.icon}</span>
                </div>
                <InfoButton text={k.info} />
              </div>
              <div className="d-kpi-number" style={{ color: '#0f172a' }}>{k.value}</div>
              <div className="d-kpi-label">{k.label}</div>
              <div className="d-kpi-desc">{k.sub}</div>
            </div>
          </Col>
        ))}
      </Row>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: FINANCIAL — MARKET CAP AREA CHART
  // ══════════════════════════════════════════════════════════════
  const renderMarketCapChart = () => {
    if (loadingFin) return <CardSkeleton />;
    const series = finMarketCap?.series ?? [];
    const comp   = finCompetitors.find(c => c.id === selectedFinComp);
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Market Cap Over Time" subtitle={`${comp?.stock_symbol ?? ''} · last 5 years (monthly)`} accentColor="#E63946" />}
        extra={<InfoButton text="Historical market capitalisation approximated as monthly closing price × current shares outstanding." />}>
        {series.length === 0 ? <EmptyState message="No market cap history available" /> : (
          <div className="d-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
                <defs>
                  <linearGradient id="mcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#E63946" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E63946" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(d) => d?.slice(0, 7)}
                  interval={Math.max(0, Math.ceil(series.length / 8) - 1)}
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [fmtNum(v), 'Market Cap']}
                  labelFormatter={(d) => d}
                  cursor={{ stroke: '#E63946', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="market_cap"
                  stroke="#E63946"
                  strokeWidth={2.5}
                  fill="url(#mcGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#E63946', stroke: '#fff', strokeWidth: 2 }}
                  name="Market Cap"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: FINANCIAL — HEALTH RATING CARD
  // ══════════════════════════════════════════════════════════════
  const renderFinRating = () => {
    if (loadingFin) return <CardSkeleton rows={6} />;
    const r = finRating;
    const RATING_COLORS = { A: '#10b981', 'B+': '#3b82f6', B: '#6366f1', 'C+': '#f59e0b', C: '#ef4444', 'N/A': '#94a3b8' };
    const color = RATING_COLORS[r?.rating] ?? '#94a3b8';
    const SUB_LABELS = { roe_score: 'ROE', roa_score: 'ROA', debt_to_equity_score: 'Debt/Equity', pe_score: 'P/E Ratio', net_margin_score: 'Net Margin' };
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Financial Health Score" subtitle="Derived from key financial ratios (1–5 scale)" accentColor="#E63946" />}
        extra={<InfoButton text="A composite score (1–5) derived from ROE, ROA, Debt/Equity, P/E Ratio, and Net Margin. A = strongest financial health, C = weakest." />}>
        {!r ? <EmptyState message="No rating data available" /> : (
          <div style={{ padding: '8px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 80, height: 80, borderRadius: '50%',
                background: `${color}18`, border: `3px solid ${color}`,
                fontSize: 32, fontWeight: 800, color,
              }}>
                {r.rating}
              </div>
              <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{r.recommendation}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Overall score: {r.rating_score} / 5</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(r.sub_scores ?? {}).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 96, fontSize: 12, color: '#64748b', flexShrink: 0 }}>{SUB_LABELS[key] ?? key}</span>
                  <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${((val ?? 0) / 5) * 100}%`, height: '100%', background: color, borderRadius: 4 }} />
                  </div>
                  <span style={{ width: 18, fontSize: 12, color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>{val ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: FINANCIAL — REVENUE VS NET INCOME
  // ══════════════════════════════════════════════════════════════
  const renderIncomeChart = () => {
    if (loadingFin) return <CardSkeleton />;
    const data = (finIncome?.series ?? []).map(e => ({ ...e, year: e.date?.slice(0, 4) ?? e.date }));
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Revenue vs Net Income" subtitle="Annual income statement — last 5 years" accentColor="#3b82f6" />}
        extra={<InfoButton text="Annual income statement showing Revenue (total sales), Net Income (profit after tax), and Gross Profit for the last 5 fiscal years." />}>
        {data.length === 0 ? <EmptyState /> : (
          <div className="d-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmtNum} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="revenue"    fill="#3b82f6" name="Revenue"    radius={[4, 4, 0, 0]} />
                <Bar dataKey="net_income" fill="#10b981" name="Net Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gross_profit" fill="#f59e0b" name="Gross Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: FINANCIAL — REVENUE GROWTH RATE
  // ══════════════════════════════════════════════════════════════
  const renderGrowthChart = () => {
    if (loadingFin) return <CardSkeleton />;
    const data = (finGrowth?.series ?? []).map(e => ({ ...e, year: e.date?.slice(0, 4) ?? e.date }));
    return (
      <Card bordered={false} className="chart-card"
        title={<ChartCardHeader title="Revenue Growth Rate" subtitle="Year-over-year growth (%) — last 5 years" accentColor="#8b5cf6" />}
        extra={<InfoButton text="Year-over-year % change in Revenue and Net Income. Bars above 0% indicate growth, below 0% indicate decline." />}>
        {data.length === 0 ? <EmptyState /> : (
          <div className="d-chart-wrap">
            <div style={{ display: 'flex', gap: 16, marginBottom: 6, fontSize: 11, color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, background: '#8b5cf6', borderRadius: 2, display: 'inline-block' }} /> Revenue Growth
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, background: '#10b981', borderRadius: 2, display: 'inline-block' }} /> Net Income Growth
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: 2, display: 'inline-block' }} /> Negative
              </span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, name) => [`${v != null ? v : '—'}%`, name]} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                <Bar dataKey="revenue_growth_pct" name="Revenue Growth" radius={[4, 4, 0, 0]}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={(entry.revenue_growth_pct ?? 0) >= 0 ? '#8b5cf6' : '#ef4444'} />
                  ))}
                </Bar>
                <Bar dataKey="net_income_growth_pct" name="Net Income Growth" radius={[4, 4, 0, 0]}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={(entry.net_income_growth_pct ?? 0) >= 0 ? '#10b981' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: FINANCIAL — RATIO METRIC CARDS

  // ══════════════════════════════════════════════════════════════
  const renderRatiosCards = () => {
    if (loadingFin) {
      return (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ flex: '1 1 160px', minWidth: 140 }}>
              <Card bordered={false} style={{ borderRadius: 14 }}>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </div>
          ))}
        </div>
      );
    }
    const r   = finRatios?.ratios ?? {};
    const pct = (v) => v != null ? `${(v * 100).toFixed(1)}%` : '—';
    const num = (v, d = 2) => v != null ? v.toFixed(d) : '—';
    const metrics = [
      { label: 'Gross Margin',     value: pct(r.gross_profit_margin),  icon: '📦', color: '#3b82f6', info: '% of revenue remaining after cost of goods sold. Higher is better.' },
      { label: 'Net Margin',       value: pct(r.net_profit_margin),    icon: '💵', color: '#10b981', info: '% of revenue that becomes net profit after all expenses and taxes. Higher is better.' },
      { label: 'Return on Equity', value: pct(r.return_on_equity),     icon: '📐', color: '#8b5cf6', info: 'How efficiently the company generates profit from shareholders\' equity. Higher is better.' },
      { label: 'Debt / Equity',    value: num(r.debt_to_equity_ratio), icon: '⚖️',  color: '#f59e0b', info: 'Total debt relative to shareholders\' equity. Higher values mean more financial leverage and risk.' },
      { label: 'Current Ratio',    value: num(r.current_ratio),        icon: '🔵', color: '#06b6d4', info: 'Ability to cover short-term liabilities with short-term assets. Above 1.0 is generally healthy.' },
    ];
    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 140 }}>
            <div className="d-kpi-card" style={{ borderTop: `3px solid ${m.color}` }}>
              <div className="d-kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="d-kpi-icon-wrap" style={{ background: `${m.color}18` }}>
                  <span className="d-kpi-icon">{m.icon}</span>
                </div>
                <InfoButton text={m.info} />
              </div>
              <div className="d-kpi-number" style={{ color: '#0f172a', fontSize: 22 }}>{m.value}</div>
              <div className="d-kpi-label">{m.label}</div>
              {finRatios?.period && <div className="d-kpi-desc">{finRatios.period.slice(0, 4)}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: FINANCIAL — COMPANY PROFILE BANNER
  // ══════════════════════════════════════════════════════════════
  const renderFinProfileBanner = () => {
    if (!finProfile || loadingFin) return null;
    const p = finProfile;
    const pills = [
      p.exchange_full || p.exchange,
      p.sector,
      p.industry,
      p.headquarters,
    ].filter(Boolean);
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
        background: '#fff', borderRadius: 14, marginBottom: 20,
        border: '1px solid #e2e8f0', flexWrap: 'wrap',
      }}>
        {p.logo_url && (
          <img src={p.logo_url} alt={p.competitor_name} style={{ height: 40, width: 40, objectFit: 'contain', borderRadius: 8 }} onError={(e) => { e.target.style.display = 'none'; }} />
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{p.competitor_name}</div>
          {p.ceo && <div style={{ fontSize: 12, color: '#64748b' }}>CEO: {p.ceo}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
          {pills.map((pill, i) => (
            <span key={i} style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              background: '#f1f5f9', color: '#475569',
            }}>{pill}</span>
          ))}
          {p.ipo_date && (
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, background: '#eff6ff', color: '#3b82f6' }}>
              IPO {p.ipo_date.slice(0, 4)}
            </span>
          )}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER: FINANCIAL — SECTION WRAPPER
  // ══════════════════════════════════════════════════════════════
  const renderFinancialSection = () => (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined style={{ color: '#E63946' }} />
            Financial Intelligence
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
            Stock market data &amp; financial health — powered by Yahoo Finance
          </p>
        </div>
        <Select
          value={selectedFinComp}
          onChange={(val) => setSelectedFinComp(val)}
          style={{ width: 240 }}
          placeholder="Select competitor…"
          notFoundContent="No competitors with a stock symbol"
          loading={allCompetitors.length === 0}
        >
          {finCompetitors.map(c => (
            <Select.Option key={c.id} value={c.id}>
              {c.name}&nbsp;
              <span style={{ color: '#94a3b8', fontSize: 11 }}>({c.stock_symbol})</span>
            </Select.Option>
          ))}
        </Select>
      </div>

      {finCompetitors.length === 0 ? (
        <Card bordered={false} className="chart-card" style={{ marginBottom: 32 }}>
          <EmptyState message="No competitors have a stock symbol. Add one via the Competitors page → Add Competitor → Stock Symbol." />
        </Card>
      ) : (
        <>
          {renderFinProfileBanner()}
          {renderFinKPIs()}
          <Row gutter={[20, 20]} className="d-equal-row" style={{ marginBottom: 24 }}>
            <Col xs={24} lg={15} className="d-equal-col">{renderMarketCapChart()}</Col>
            <Col xs={24} lg={9}  className="d-equal-col">{renderFinRating()}</Col>
          </Row>
          <Row gutter={[20, 20]} className="d-equal-row" style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12} className="d-equal-col">{renderIncomeChart()}</Col>
            <Col xs={24} lg={12} className="d-equal-col">{renderGrowthChart()}</Col>
          </Row>
          {renderRatiosCards()}
        </>
      )}
    </>
  );

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

        {/* ══ Competitor News Feed ══ */}
        <div style={{ marginBottom: 32 }}>
          <NewsWidget />
        </div>

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

        {/* ══ Financial Intelligence (FMP) ══ */}
        <div style={{ marginBottom: 32 }}>
          {renderFinancialSection()}
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;
