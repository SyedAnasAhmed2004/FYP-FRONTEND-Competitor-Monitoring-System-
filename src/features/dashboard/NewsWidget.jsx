import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Skeleton, Pagination, Select } from 'antd';
import { SearchOutlined, LinkOutlined, ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { selectCompetitors } from '../competitors/competitorsSlice';
import { dashboardService } from '../../services/dashboardService';

// ── Constants ────────────────────────────────────────────────────
const PALETTE = [
  '#E63946', '#3b82f6', '#10b981', '#f59e0b',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16',
  '#ef4444', '#0ea5e9', '#a855f7', '#22c55e',
];

const DAY_OPTIONS = [
  { value: 3,  label: 'Last 3 days'  },
  { value: 6,  label: 'Last 6 days'  },
  { value: 14, label: 'Last 14 days' },
  { value: 30, label: 'Last 30 days' },
];

// ── Helpers ──────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ── Sub-components ───────────────────────────────────────────────
function ArticleSkeleton() {
  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
      <Skeleton active title={{ width: '30%' }} paragraph={{ rows: 1, width: '80%' }} />
    </div>
  );
}

function EmptyNews({ query }) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 24px' }}>
      <div style={{ fontSize: 42, marginBottom: 12, lineHeight: 1 }}>📭</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
        No articles found
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>
        {query
          ? `No results for "${query}" — try a different keyword or extend the date range`
          : 'No news in this period — try extending the date range'}
      </div>
    </div>
  );
}

// ── Main Widget ──────────────────────────────────────────────────
function NewsWidget() {
  const [articles,   setArticles]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [days,       setDays]       = useState(6);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(false);
  const [compFilter, setCompFilter] = useState(null);
  const [search,     setSearch]     = useState('');
  const [inputVal,   setInputVal]   = useState('');

  const allCompetitors = useSelector(selectCompetitors) ?? [];
  const colorMap = useRef({});
  const debounceRef = useRef(null);

  const getColor = (name) => {
    if (!name) return PALETTE[0];
    if (!colorMap.current[name]) {
      const idx = Object.keys(colorMap.current).length;
      colorMap.current[name] = PALETTE[idx % PALETTE.length];
    }
    return colorMap.current[name];
  };

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await dashboardService.getNewsFeed(days, page, search, compFilter);
      if (res.success) {
        const arts = res.data.articles ?? [];
        arts.forEach(a => getColor(a.competitor_name));
        setArticles(arts);
        setTotal(res.data.total ?? 0);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [days, page, search, compFilter]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleSearchInput = (e) => {
    setInputVal(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); setSearch(e.target.value); }, 400);
  };

  const handleDaysChange    = (v) => { setPage(1); setDays(v); };
  const handleCompChange    = (v) => { setPage(1); setCompFilter(v === 'all' ? null : v); };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
      border: '1px solid #e2e8f0',
    }}>

      {/* ── Light Header ─────────────────────────────────────── */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9' }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div className="cc-header" style={{ flex: 1, minWidth: 0 }}>
            <div className="cc-header-accent" style={{ background: '#E63946' }} />
            <div>
              <div className="cc-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Competitor News Feed
                {total > 0 && (
                  <span style={{
                    background: '#E63946', color: '#fff',
                    borderRadius: 20, padding: '1px 8px',
                    fontSize: 11, fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(230,57,70,0.35)',
                  }}>
                    {total}
                  </span>
                )}
              </div>
              <div className="cc-subtitle">Google News · real-time headlines</div>
            </div>
          </div>

          {/* Filter controls */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Select
              value={days}
              onChange={handleDaysChange}
              size="small"
              style={{ width: 120 }}
              options={DAY_OPTIONS}
            />
            <Select
              value={compFilter ?? 'all'}
              onChange={handleCompChange}
              size="small"
              style={{ width: 155 }}
              options={[
                { value: 'all', label: 'All Competitors' },
                ...allCompetitors.map(c => ({
                  value: c.id,
                  label: (
                    <span>
                      <span style={{
                        display: 'inline-block', width: 8, height: 8,
                        borderRadius: '50%', background: getColor(c.name),
                        marginRight: 6, verticalAlign: 'middle',
                      }} />
                      {c.name}
                    </span>
                  ),
                })),
              ]}
            />
          </div>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', marginTop: 12 }}>
          <SearchOutlined style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13, zIndex: 1,
          }} />
          <input
            value={inputVal}
            onChange={handleSearchInput}
            placeholder="Search headlines or sources…"
            style={{
              width: '100%', boxSizing: 'border-box',
              paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8, color: '#1e293b',
              fontSize: 12, outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#E63946'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
          />
        </div>

        {/* Live indicator strip */}
        {!loading && total > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#10b981',
              boxShadow: '0 0 0 2px rgba(16,185,129,0.3)',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ color: '#94a3b8', fontSize: 11 }}>
              {total} articles · last {days} days
            </span>
          </div>
        )}
      </div>

      {/* ── Article List ─────────────────────────────────────── */}
      <div>
        {loading ? (
          [...Array(6)].map((_, i) => <ArticleSkeleton key={i} />)
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '52px 24px', color: '#94a3b8', fontSize: 13 }}>
            Failed to load news. Please try again later.
          </div>
        ) : articles.length === 0 ? (
          <EmptyNews query={search} />
        ) : (
          articles.map((article, i) => {
            const color = getColor(article.competitor_name);
            const isLast = i === articles.length - 1;
            return (
              <ArticleRow
                key={`${article.url ?? i}-${i}`}
                article={article}
                color={color}
                isLast={isLast}
              />
            );
          })
        )}
      </div>

      {/* ── Footer / Pagination ──────────────────────────────── */}
      {!loading && total > 20 && (
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <Pagination
            current={page}
            total={total}
            pageSize={20}
            onChange={(p) => setPage(p)}
            showTotal={(t) => `${t} total`}
            size="small"
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}

// ── Article Row (extracted for cleanliness) ──────────────────────
function ArticleRow({ article, color, isLast }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        gap: 0,
        borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
        background: hovered ? '#fafbfc' : 'transparent',
        transition: 'background 0.15s',
        position: 'relative',
      }}
    >
      {/* Left color bar */}
      <div style={{
        width: 3,
        background: hovered ? color : `${color}60`,
        flexShrink: 0,
        transition: 'background 0.15s',
      }} />

      {/* Content */}
      <div style={{ flex: 1, padding: '13px 20px 13px 16px', minWidth: 0 }}>
        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: `${color}14`, color,
            border: `1px solid ${color}25`,
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: color, display: 'inline-block',
            }} />
            {article.competitor_name}
          </span>

          {article.source && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 11, color: '#64748b',
            }}>
              <GlobalOutlined style={{ fontSize: 10 }} />
              {article.source}
            </span>
          )}

          <span style={{
            marginLeft: 'auto',
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap',
          }}>
            <ClockCircleOutlined style={{ fontSize: 10 }} />
            {timeAgo(article.published_at)}
          </span>
        </div>

        {/* Headline */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.45,
            color: hovered ? color : '#1e293b',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {article.title}
        </a>

        {/* Date */}
        <div style={{
          marginTop: 4,
          fontSize: 11,
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          {fmtDate(article.published_at)}
          <LinkOutlined style={{ fontSize: 9, opacity: 0.5 }} />
          <span style={{ opacity: 0.7 }}>click to read full article</span>
        </div>
      </div>
    </div>
  );
}

export default NewsWidget;
