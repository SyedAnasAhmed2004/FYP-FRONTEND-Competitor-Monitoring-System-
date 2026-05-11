import { api } from '../config/api';

const BASE = '/api/dashboard';

export const dashboardService = {
  // ── Overview ──────────────────────────────────────────────────────
  getOverview:      () => api.get(`${BASE}/overview/`),
  getScrapingHealth: () => api.get(`${BASE}/scraping-health/`),

  // ── Symbol search ─────────────────────────────────────────────────
  searchSymbol: (name, limit = 10) =>
    api.get(`${BASE}/search-symbol/?name=${encodeURIComponent(name)}&limit=${limit}`),

  // ── Financial Profile ─────────────────────────────────────────────
  getFinancialProfile:  (id)          => api.get(`${BASE}/financial-profile/${id}/profile/`),
  getMarketCap:         (id, years=5) => api.get(`${BASE}/financial-profile/${id}/market-cap/?years=${years}`),
  getEmployeeCount:     (id)          => api.get(`${BASE}/financial-profile/${id}/employee-count/`),
  getExecutives:        (id)          => api.get(`${BASE}/financial-profile/${id}/executives/`),

  // ── Financial Health ──────────────────────────────────────────────
  getIncome:             (id, years=5) => api.get(`${BASE}/financial-health/${id}/income/?years=${years}`),
  getGrowth:             (id)          => api.get(`${BASE}/financial-health/${id}/growth/`),
  getRatios:             (id)          => api.get(`${BASE}/financial-health/${id}/ratios/`),
  getRating:             (id)          => api.get(`${BASE}/financial-health/${id}/rating/`),
  getRevenuePerEmployee: (id)          => api.get(`${BASE}/financial-health/${id}/revenue-per-employee/`),

  // ── Website Changes ───────────────────────────────────────────────
  getWebsiteHeatmap: (days = 90, competitorId = null) => {
    let url = `${BASE}/website-changes/heatmap/?days=${days}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    return api.get(url);
  },
  getWebsiteTypeBreakdown: (competitorId = null) => {
    const url = competitorId
      ? `${BASE}/website-changes/type-breakdown/?competitor_id=${competitorId}`
      : `${BASE}/website-changes/type-breakdown/`;
    return api.get(url);
  },
  getWebsiteSignificanceTrend: (weeks = 12, competitorId = null) => {
    let url = `${BASE}/website-changes/significance-trend/?weeks=${weeks}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    return api.get(url);
  },
  getWebsitePerCompetitor: (days = 30) =>
    api.get(`${BASE}/website-changes/per-competitor/?days=${days}`),
  getWebsiteFeed: (page = 1, limit = 8, competitorId = null) => {
    let url = `${BASE}/website-changes/feed/?page=${page}&limit=${limit}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    return api.get(url);
  },
  getWebsiteVelocity: (days = 60, competitorId = null) => {
    let url = `${BASE}/website-changes/velocity/?days=${days}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    return api.get(url);
  },

  // ── Social Posts ──────────────────────────────────────────────────
  getSocialEngagement: (days = 30) =>
    api.get(`${BASE}/social-posts/engagement/?days=${days}`),
  getSocialVolumeTrend: (weeks = 12, competitorId = null) => {
    let url = `${BASE}/social-posts/volume-trend/?weeks=${weeks}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    return api.get(url);
  },
  getSocialTypeDistribution: (competitorId = null) => {
    const url = competitorId
      ? `${BASE}/social-posts/type-distribution/?competitor_id=${competitorId}`
      : `${BASE}/social-posts/type-distribution/`;
    return api.get(url);
  },
  getTopPosts: (days = 30, limit = 8, competitorId = null) => {
    let url = `${BASE}/social-posts/top-posts/?days=${days}&limit=${limit}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    return api.get(url);
  },
  getSocialFrequencyHeatmap: (competitorId = null) => {
    const url = competitorId
      ? `${BASE}/social-posts/frequency-heatmap/?competitor_id=${competitorId}`
      : `${BASE}/social-posts/frequency-heatmap/`;
    return api.get(url);
  },
  getSocialAuthors: (competitorId = null, limit = 10) => {
    let url = `${BASE}/social-posts/authors/?limit=${limit}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    return api.get(url);
  },

  // ── Snapshots ─────────────────────────────────────────────────────
  getFollowerGrowth: (competitorId = null, platform = 'linkedin', months = 6) => {
    let url = `${BASE}/snapshots/follower-growth/?platform=${platform}&months=${months}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    return api.get(url);
  },
  getGrowthRate:            (platform = 'linkedin') => api.get(`${BASE}/snapshots/growth-rate/?platform=${platform}`),
  getPlatformComparison:    ()                       => api.get(`${BASE}/snapshots/platform-comparison/`),
  getFollowerEmployeeRatio: ()                       => api.get(`${BASE}/snapshots/follower-employee-ratio/`),

  // ── News ──────────────────────────────────────────────────────────
  getNewsCorrelation: (id, days = 60) =>
    api.get(`${BASE}/news/${id}/correlation/?days=${days}`),

  // ── Hiring ────────────────────────────────────────────────────────
  getActiveOpenings: () => api.get(`${BASE}/hiring/active-openings/`),
  getHiringTrend: (weeks = 12, competitorId = null) => {
    let url = `${BASE}/hiring/trend/?weeks=${weeks}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    return api.get(url);
  },
  getFunctionBreakdown: (competitorId = null) => {
    const url = competitorId
      ? `${BASE}/hiring/function-breakdown/?competitor_id=${competitorId}`
      : `${BASE}/hiring/function-breakdown/`;
    return api.get(url);
  },
  getSeniority: (competitorId = null) => {
    const url = competitorId
      ? `${BASE}/hiring/seniority/?competitor_id=${competitorId}`
      : `${BASE}/hiring/seniority/`;
    return api.get(url);
  },
  getHiringLocations: (competitorId = null, limit = 10) => {
    let url = `${BASE}/hiring/locations/?limit=${limit}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    return api.get(url);
  },
  getNewVsClosed: (months = 3) =>
    api.get(`${BASE}/hiring/new-vs-closed/?months=${months}`),
  getEmploymentType: (competitorId = null) => {
    const url = competitorId
      ? `${BASE}/hiring/employment-type/?competitor_id=${competitorId}`
      : `${BASE}/hiring/employment-type/`;
    return api.get(url);
  },

  // ── Trends ────────────────────────────────────────────────────────
  getTrendDirectionSummary: ()                        => api.get(`${BASE}/trends/direction-summary/`),
  getTrendAlerts:           ()                        => api.get(`${BASE}/trends/alerts/`),
  getTrendCoverage:         ()                        => api.get(`${BASE}/trends/coverage/`),
  getTrendConfidenceTable:  (minConfidence = 0.0)     => api.get(`${BASE}/trends/confidence-table/?min_confidence=${minConfidence}`),
  getTrendMetricSeries: (competitorId = null, metricType = null, months = 6) => {
    let url = `${BASE}/trends/metric-series/?months=${months}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    if (metricType)   url += `&metric_type=${metricType}`;
    return api.get(url);
  },
};
