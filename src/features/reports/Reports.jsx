import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Row, Col, Card, Typography, Tag, Input, Select,
    Button, Space, Spin, Modal as AntModal, message, Tooltip,
} from 'antd';
import {
    FileTextOutlined,
    DownloadOutlined,
    FilterOutlined,
    SearchOutlined,
    EyeOutlined,
    LoadingOutlined,
    CheckCircleFilled,
    CheckOutlined,
    CloseOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import {
    fetchCompetitors as fetchCompetitorsThunk,
    selectCompetitors,
    selectCompetitorsLoading,
} from '../competitors/competitorsSlice';
import { generateReport, getReport, listReports, downloadReportPdf } from '../../services/reportService';

const { Title, Text } = Typography;
const { Option } = Select;

// ── Mock data kept for the Reports list and Alerts tabs ──────────────────────
const mockReports = [
    { id: '1', title: 'Q4 Strategic Intelligence Executive Brief', type: 'executive', generated: '1 hour ago', period: 'Last 90 days', status: 'ready', size: '4.2 MB' },
    { id: '2', title: 'Competitive Landscape Analysis - Tech Sector', type: 'competitive', generated: '3 hours ago', period: 'Last 30 days', status: 'ready', size: '6.1 MB' },
    { id: '3', title: 'Market Penetration Strategy Assessment', type: 'market', generated: '5 hours ago', period: 'Last 14 days', status: 'ready', size: '3.8 MB' },
    { id: '4', title: 'AI-Driven Customer Behavior Analysis', type: 'custom', generated: '12 hours ago', period: 'Last 60 days', status: 'ready', size: '5.4 MB' },
    { id: '5', title: 'Emerging Technologies Impact Report', type: 'market', generated: 'Generating...', period: 'Last 180 days', status: 'generating', size: '-' },
    { id: '7', title: 'Patent Filing & Innovation Tracker', type: 'competitive', generated: '1 day ago', period: 'Last 30 days', status: 'ready', size: '2.9 MB' },
    { id: '8', title: 'Social Sentiment & Brand Perception Analysis', type: 'market', generated: '6 hours ago', period: 'Last 21 days', status: 'ready', size: '4.7 MB' },
];


// ── Date utilities ───────────────────────────────────────────────────────────
const toDateOnly = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const formatYMD = (d) => {
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const formatDisplayDate = (d) => {
    if (!d) return null;
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${DAYS[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
};
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ── DateRangePicker ──────────────────────────────────────────────────────────
function DateRangePicker({ startDate, endDate, onApply, onCancel }) {
    const today = toDateOnly(new Date());
    const [viewYear, setViewYear] = useState(() => (startDate || today).getFullYear());
    const [viewMonth, setViewMonth] = useState(() => (startDate || today).getMonth());
    const [selStart, setSelStart] = useState(startDate || null);
    const [selEnd, setSelEnd] = useState(endDate || null);
    const [hoverDate, setHoverDate] = useState(null);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const isDisabled = (d) => {
        if (d > today) return true;
        if (selStart && !selEnd) {
            if (d < selStart) return true;
            if ((d - selStart) / 86400000 > 30) return true;
        }
        return false;
    };

    const effectiveEnd = selEnd || (selStart && !selEnd ? hoverDate : null);
    const isInRange = (d) => {
        if (!selStart || !effectiveEnd || effectiveEnd <= selStart) return false;
        return d > selStart && d < effectiveEnd;
    };
    const isStartDate = (d) => selStart && d.getTime() === selStart.getTime();
    const isEndDate = (d) => selEnd && d.getTime() === selEnd.getTime();
    const isHoverEnd = (d) => !!(selStart && !selEnd && hoverDate && d.getTime() === hoverDate.getTime());
    const hasRange = !!(selStart && effectiveEnd && effectiveEnd > selStart);

    const handleDayClick = (d) => {
        if (isDisabled(d)) return;
        if (!selStart || (selStart && selEnd)) {
            setSelStart(d); setSelEnd(null);
        } else {
            if (d < selStart) { setSelStart(d); setSelEnd(null); }
            else { setSelEnd(d); }
        }
        setHoverDate(null);
    };

    // Build calendar grid
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const rawFirstDay = new Date(viewYear, viewMonth, 1).getDay();
    const offset = rawFirstDay === 0 ? 6 : rawFirstDay - 1;
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push({ day: daysInPrevMonth - offset + 1 + i, current: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
    while (cells.length < 42) cells.push({ day: cells.length - offset - daysInMonth + 1, current: false });

    const canApply = !!(selStart && selEnd);

    return (
        <div style={S.drpContainer}>
            {/* From / To header */}
            <div style={S.drpHeader}>
                <div style={{ ...S.drpDateCard, borderRight: '1.5px solid #e5e7eb' }}>
                    <div style={S.drpDateCardLabel}>From</div>
                    <div style={selStart ? S.drpDateCardValue : S.drpDateCardPlaceholder}>
                        {selStart ? formatDisplayDate(selStart) : 'Select date'}
                    </div>
                </div>
                <div style={S.drpDateCard}>
                    <div style={S.drpDateCardLabel}>To</div>
                    <div style={selEnd ? S.drpDateCardValue : S.drpDateCardPlaceholder}>
                        {selEnd ? formatDisplayDate(selEnd) : 'Select date'}
                    </div>
                </div>
            </div>

            {/* Month navigation */}
            <div style={S.drpCalHeader}>
                <button style={S.drpNavBtn} onClick={prevMonth}>‹</button>
                <span style={S.drpMonthLabel}>{MONTH_NAMES[viewMonth]}, {viewYear}</span>
                <button style={S.drpNavBtn} onClick={nextMonth}>›</button>
            </div>

            {/* Weekday headers */}
            <div style={S.drpWeekRow}>
                {WEEK_DAYS.map(d => <div key={d} style={S.drpWeekDay}>{d}</div>)}
            </div>

            {/* Days grid */}
            <div style={S.drpDaysGrid}>
                {cells.map((cell, idx) => {
                    if (!cell.current) {
                        return (
                            <div key={idx} style={{ textAlign: 'center', padding: '3px 0' }}>
                                <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 14, color: '#d1d5db' }}>
                                    {cell.day}
                                </div>
                            </div>
                        );
                    }
                    const d = toDateOnly(new Date(viewYear, viewMonth, cell.day));
                    const disabled = isDisabled(d);
                    const start = isStartDate(d);
                    const end = isEndDate(d);
                    const hoverEnd = isHoverEnd(d);
                    const inRange = isInRange(d);

                    // Row background for range continuity
                    let rowBg = 'transparent';
                    if (hasRange) {
                        if (start) rowBg = 'linear-gradient(to right, transparent 50%, #fff0f0 50%)';
                        else if (end || hoverEnd) rowBg = 'linear-gradient(to left, transparent 50%, #fff0f0 50%)';
                        else if (inRange) rowBg = '#fff0f0';
                    }

                    // Circle style
                    let circleBg = 'transparent';
                    let circleColor = disabled ? '#d1d5db' : '#111827';
                    let circleFontWeight = 400;

                    if (start || end) {
                        circleBg = '#E63946'; circleColor = '#fff'; circleFontWeight = 700;
                    } else if (hoverEnd && !disabled) {
                        circleBg = 'rgba(230,57,70,0.18)'; circleColor = '#E63946';
                    } else if (inRange) {
                        circleColor = '#E63946';
                    }

                    return (
                        <div
                            key={idx}
                            style={{ padding: '3px 0', background: rowBg, cursor: disabled ? 'not-allowed' : 'pointer' }}
                            onMouseEnter={() => { if (selStart && !selEnd && !disabled) setHoverDate(d); }}
                            onMouseLeave={() => setHoverDate(null)}
                            onClick={() => handleDayClick(d)}
                        >
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: circleBg, color: circleColor,
                                fontWeight: circleFontWeight, fontSize: 14,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto', transition: 'background 0.12s',
                            }}>
                                {cell.day}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div style={S.drpFooter}>
                <button style={S.drpCancelBtn} onClick={onCancel}>Cancel</button>
                <button
                    style={{ ...S.drpApplyBtn, ...(!canApply ? S.drpApplyBtnDisabled : {}) }}
                    disabled={!canApply}
                    onClick={() => canApply && onApply(selStart, selEnd)}
                >
                    Apply
                </button>
            </div>
        </div>
    );
}

// ── Helper style getters ────────────────────────────────────────────────────
const getReportTypeColor = (type) => {
    const map = { executive: 'report-type-executive', competitive: 'report-type-competitive', market: 'report-type-market', custom: 'report-type-custom' };
    return map[type] || '';
};
const getStatusColor = (status) => {
    const map = { ready: 'report-status-ready', completed: 'report-status-ready', generating: 'report-status-generating', pending: 'report-status-generating' };
    return map[status] || '';
};

// ── Inline styles for the modal (self-contained so no CSS file needed) ───────
const S = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { background: '#fff', borderRadius: 16, width: 480, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', position: 'relative' },
    header: { padding: '28px 28px 0' },
    closeBtn: { position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6b7280', lineHeight: 1, padding: 4 },
    title: { margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' },
    subtitle: { margin: '6px 0 0', fontSize: 13, color: '#6b7280' },
    body: { padding: '24px 28px 28px' },
    fieldLabel: { display: 'block', fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 },
    fieldGroup: { marginBottom: 18 },
    textInput: {
        width: '100%', padding: '10px 14px', fontSize: 14, border: '1.5px solid #dc2626',
        borderRadius: 8, outline: 'none', color: '#111827', background: '#fff',
        transition: 'border-color 0.2s',
    },
    textInputFocus: { borderColor: '#E63946' },
    selectBox: {
        width: '100%', padding: '10px 14px', fontSize: 14, border: '1.5px solid #dc2626',
        borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', userSelect: 'none', color: '#111827',
    },
    selectBoxBorder: { borderColor: '#dc2626' },
    selectBoxSelected: { color: '#111827' },
    dropdown: {
        border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginTop: 4, overflow: 'hidden',
    },
    dropdownItem: { padding: '10px 14px', fontSize: 14, cursor: 'pointer', color: '#374151' },
    dropdownItemHover: { background: '#fff0f0', color: '#E63946' },
    dropdownItemSelected: { background: '#fff0f0', color: '#E63946', fontWeight: 600 },
    compSearch: { padding: '10px 14px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 },
    compSearchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#111827', background: 'transparent' },
    compItem: { padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: '#374151' },
    compItemHover: { background: '#fff0f0', color: '#E63946' },
    checkboxBase: { width: 16, height: 16, border: '2px solid #374151', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    checkboxChecked: { background: '#E63946', borderColor: '#E63946' },
    checkboxSelectAll: { borderColor: '#374151' },
    pillsArea: { marginTop: 12, padding: '12px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' },
    pill: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #d1d5db', borderRadius: 20, padding: '4px 10px', fontSize: 13, color: '#374151', margin: '3px' },
    pillX: { cursor: 'pointer', color: '#6b7280', fontSize: 11, lineHeight: 1, background: 'none', border: 'none', padding: 0 },
    generateBtn: {
        width: '100%', padding: '13px', fontSize: 14, fontWeight: 400, color: '#fff',
        background: 'linear-gradient(135deg, #E63946, #c1121f)', border: 'none',
        borderRadius: 8, cursor: 'pointer', marginTop: 8, transition: 'opacity 0.2s',
    },
    generateBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    loadingCenter: { textAlign: 'center', padding: '60px 28px' },
    successCenter: { textAlign: 'center', padding: '40px 28px' },
    greenCircle: { width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
    actionRow: { display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 },
    previewBtn: { flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 400, border: '1.5px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
    downloadBtn: { flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 400, border: 'none', borderRadius: 8, background: '#E63946', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
    anotherLink: { display: 'block', margin: '16px auto 0', color: '#E63946', fontSize: 14, cursor: 'pointer', background: 'none', border: '1.5px solid #fca5a5', borderRadius: 8, padding: '8px 20px', fontWeight: 500 },
    // Date Range Picker
    drpContainer: { border: '1.5px solid #e5e7eb', borderRadius: 12, background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', marginTop: 4, overflow: 'hidden', userSelect: 'none' },
    drpHeader: { display: 'flex', borderBottom: '1.5px solid #e5e7eb' },
    drpDateCard: { flex: 1, padding: '14px 16px', textAlign: 'center' },
    drpDateCardLabel: { fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
    drpDateCardValue: { fontSize: 14, fontWeight: 700, color: '#111827' },
    drpDateCardPlaceholder: { fontSize: 14, color: '#9ca3af' },
    drpCalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' },
    drpNavBtn: { width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#374151', lineHeight: 1 },
    drpMonthLabel: { fontSize: 15, fontWeight: 700, color: '#111827' },
    drpWeekRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px 4px' },
    drpWeekDay: { textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#E63946', padding: '4px 0' },
    drpDaysGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px 4px' },
    drpFooter: { display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1.5px solid #e5e7eb' },
    drpCancelBtn: { flex: 1, padding: '10px', fontSize: 14, fontWeight: 400, border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', color: '#374151' },
    drpApplyBtn: { flex: 1, padding: '10px', fontSize: 14, fontWeight: 400, border: 'none', borderRadius: 8, background: '#E63946', color: '#fff', cursor: 'pointer' },
    drpApplyBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
};

// ── GenerateReportModal ──────────────────────────────────────────────────────
function GenerateReportModal({ open, onClose, onReportGenerated }) {
    const dispatch = useDispatch();

    // Read competitors from Redux store (same source as Competitors page)
    const competitors = useSelector(selectCompetitors);
    const compsLoading = useSelector(selectCompetitorsLoading);

    const [step, setStep] = useState('form'); // 'form' | 'loading' | 'success'
    const [titleVal, setTitleVal] = useState('');
    const [titleFocused, setTitleFocused] = useState(false);
    const [reportType, setReportType] = useState(null);
    const [typeOpen, setTypeOpen] = useState(false);
    const [dateStart, setDateStart] = useState(null);
    const [dateEnd, setDateEnd] = useState(null);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [compOpen, setCompOpen] = useState(false);
    const [compSearch, setCompSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [completedReport, setCompletedReport] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const pollRef = useRef(null);
    const previewUrlRef = useRef(null);
    const compDropRef = useRef(null);
    const typeDropRef = useRef(null);
    const datePickerRef = useRef(null);

    // Dispatch fetch when modal opens; if already loaded, this is a no-op via the slice's loading guard
    useEffect(() => {
        if (!open) return;
        dispatch(fetchCompetitorsThunk());
    }, [open, dispatch]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (compDropRef.current && !compDropRef.current.contains(e.target)) setCompOpen(false);
            if (typeDropRef.current && !typeDropRef.current.contains(e.target)) setTypeOpen(false);
            if (datePickerRef.current && !datePickerRef.current.contains(e.target)) setDatePickerOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const resetForm = useCallback(() => {
        setStep('form');
        setTitleVal('');
        setReportType(null);
        setDateStart(null);
        setDateEnd(null);
        setDatePickerOpen(false);
        setSelectedIds([]);
        setCompSearch('');
        setCompletedReport(null);
        setErrorMsg('');
        setPreviewOpen(false);
        setPreviewUrl(null);
        setPreviewLoading(false);
        if (previewUrlRef.current) { URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; }
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }, []);

    const handleClose = () => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        resetForm();
        onClose();
    };

    // Competitor filtering
    const filteredComps = competitors.filter(c =>
        c.name.toLowerCase().includes(compSearch.toLowerCase())
    );
    const allSelected = filteredComps.length > 0 && filteredComps.every(c => selectedIds.includes(c.id));

    const toggleCompetitor = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !filteredComps.find(c => c.id === id)));
        } else {
            const newIds = filteredComps.map(c => c.id).filter(id => !selectedIds.includes(id));
            setSelectedIds(prev => [...prev, ...newIds]);
        }
    };
    const removePill = (id) => setSelectedIds(prev => prev.filter(x => x !== id));
    const selectedComps = competitors.filter(c => selectedIds.includes(c.id));

    const isFormValid = titleVal.trim() && reportType && dateStart && dateEnd;

    const handleGenerate = async () => {
        if (!isFormValid) return;
        setErrorMsg('');
        setStep('loading');

        const result = await generateReport({
            title: titleVal.trim(),
            report_type: reportType,
            period_start: formatYMD(dateStart),
            period_end: formatYMD(dateEnd),
            competitor_ids: selectedIds,
        });

        if (!result.success) {
            setErrorMsg(result.error || 'Failed to start report generation. Please try again.');
            setStep('form');
            return;
        }

        const reportId = result.data?.report_id;
        if (!reportId) {
            setErrorMsg('Invalid response from server. Please try again.');
            setStep('form');
            return;
        }

        pollRef.current = setInterval(async () => {
            const poll = await getReport(reportId);
            if (!poll.success) return; // transient error — keep polling
            const pollStatus = poll.data?.status;
            if (pollStatus === 'completed') {
                clearInterval(pollRef.current);
                pollRef.current = null;
                setCompletedReport(poll.data);
                setStep('success');
                if (onReportGenerated) onReportGenerated();
            } else if (pollStatus === 'failed') {
                clearInterval(pollRef.current);
                pollRef.current = null;
                setErrorMsg(poll.data?.error_message || 'Report generation failed. Please try again.');
                setStep('form');
            }
        }, 3000);
    };

    const handlePreview = async () => {
        if (previewOpen) { setPreviewOpen(false); return; }
        if (previewUrlRef.current) { setPreviewOpen(true); return; }
        if (!completedReport?.id) return;
        setPreviewLoading(true);
        setPreviewOpen(true);
        try {
            const token = localStorage.getItem('authToken');
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const res = await fetch(`${baseURL}/api/reports/${completedReport.id}/pdf/`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                previewUrlRef.current = url;
                setPreviewUrl(url);
            } else {
                setPreviewOpen(false);
            }
        } catch {
            setPreviewOpen(false);
        }
        setPreviewLoading(false);
    };

    const handleDownload = () => {
        if (!completedReport?.id) return;
        downloadReportPdf(completedReport.id, titleVal || 'report');
    };

    if (!open) return null;

    return (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div style={{ ...S.modal, ...(previewOpen ? { width: 860, maxHeight: '94vh' } : {}) }}>
                {/* Header */}
                <div style={S.header}>
                    <h2 style={S.title}>Generate Custom Report</h2>
                    <p style={S.subtitle}>Create a tailored strategic intelligence report with selected parameters</p>
                    <button style={S.closeBtn} onClick={handleClose}><CloseOutlined /></button>
                </div>

                {/* Body */}
                <div style={S.body}>

                    {/* ── FORM STEP ── */}
                    {step === 'form' && (
                        <>
                            {/* Report Title */}
                            <div style={S.fieldGroup}>
                                <label style={S.fieldLabel}>Report Title</label>
                                <input
                                    style={{ ...S.textInput, ...(titleFocused ? S.textInputFocus : {}) }}
                                    placeholder="e.g., Q4 Competitive Analysis"
                                    value={titleVal}
                                    onChange={e => setTitleVal(e.target.value)}
                                    onFocus={() => setTitleFocused(true)}
                                    onBlur={() => setTitleFocused(false)}
                                />
                            </div>

                            {/* Report Type */}
                            <div style={S.fieldGroup} ref={typeDropRef}>
                                <label style={S.fieldLabel}>Report Type</label>
                                <div
                                    className="report-type-select"
                                    style={{ ...S.selectBox, ...S.selectBoxBorder, ...(reportType ? S.selectBoxSelected : {}) }}
                                    onClick={() => { setTypeOpen(o => !o); setDatePickerOpen(false); setCompOpen(false); }}
                                >
                                    <span>{reportType === 'executive' ? 'Executive' : reportType === 'analyst' ? 'Analyst' : 'Select report type'}</span>
                                    <span style={{ fontSize: 12, color: '#9ca3af' }}>▾</span>
                                </div>
                                {typeOpen && (
                                    <div style={S.dropdown}>
                                        {[{ label: 'Executive', value: 'executive' }, { label: 'Analyst', value: 'analyst' }].map(opt => (
                                            <div
                                                key={opt.value}
                                                style={{
                                                    ...S.dropdownItem,
                                                    ...(reportType === opt.value ? S.dropdownItemSelected : {}),
                                                    ...(hoveredItem === `type-${opt.value}` && reportType !== opt.value ? S.dropdownItemHover : {}),
                                                }}
                                                onMouseEnter={() => setHoveredItem(`type-${opt.value}`)}
                                                onMouseLeave={() => setHoveredItem(null)}
                                                onClick={() => { setReportType(opt.value); setTypeOpen(false); }}
                                            >
                                                {opt.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Date Range Picker */}
                            <div style={S.fieldGroup} ref={datePickerRef}>
                                <label style={S.fieldLabel}>Date Range <span style={{ fontWeight: 400, color: '#dc2626', fontSize: 13 }}>(max 30 days, no future dates)</span></label>
                                <div
                                    style={{ ...S.selectBox, ...(dateStart ? S.selectBoxSelected : {}) }}
                                    onClick={() => { setDatePickerOpen(o => !o); setTypeOpen(false); setCompOpen(false); }}
                                >
                                    <span style={{ fontSize: 13 }}>
                                        {dateStart && dateEnd
                                            ? `${formatYMD(dateStart)}  →  ${formatYMD(dateEnd)}`
                                            : dateStart
                                                ? `${formatYMD(dateStart)}  →  pick end date`
                                                : 'Select date range'}
                                    </span>
                                    <span style={{ fontSize: 14 }}>📅</span>
                                </div>
                                {datePickerOpen && (
                                    <DateRangePicker
                                        startDate={dateStart}
                                        endDate={dateEnd}
                                        onApply={(start, end) => {
                                            setDateStart(start);
                                            setDateEnd(end);
                                            setDatePickerOpen(false);
                                        }}
                                        onCancel={() => setDatePickerOpen(false)}
                                    />
                                )}
                            </div>

                            {/* Competitors */}
                            <div style={S.fieldGroup} ref={compDropRef}>
                                <label style={S.fieldLabel}>Competitors</label>
                                <div
                                    style={{ ...S.selectBox, ...(selectedIds.length > 0 ? S.selectBoxSelected : {}) }}
                                    onClick={() => { setCompOpen(o => !o); setTypeOpen(false); setDatePickerOpen(false); }}
                                >
                                    <span>{selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select competitors...'}</span>
                                    <span style={{ fontSize: 12, color: '#9ca3af' }}>▾</span>
                                </div>

                                {compOpen && (
                                    <div style={{ ...S.dropdown, maxHeight: 280, overflowY: 'auto' }}>
                                        {/* Search */}
                                        <div style={S.compSearch}>
                                            <SearchOutlined style={{ color: '#9ca3af', fontSize: 14 }} />
                                            <input
                                                style={S.compSearchInput}
                                                placeholder="Search competitors..."
                                                value={compSearch}
                                                onChange={e => setCompSearch(e.target.value)}
                                                onClick={e => e.stopPropagation()}
                                                autoFocus
                                            />
                                        </div>

                                        {/* Select All */}
                                        <div
                                            style={{
                                                ...S.compItem,
                                                ...(hoveredItem === 'select-all' && !allSelected ? S.compItemHover : {}),
                                                ...(allSelected ? { background: '#fff0f0', color: '#E63946' } : {}),
                                            }}
                                            onMouseEnter={() => setHoveredItem('select-all')}
                                            onMouseLeave={() => setHoveredItem(null)}
                                            onClick={toggleSelectAll}
                                        >
                                            <div style={{ ...S.checkboxBase, ...(allSelected ? S.checkboxChecked : {}) }}>
                                                {allSelected && <CheckOutlined style={{ fontSize: 10, color: '#fff' }} />}
                                            </div>
                                            <span style={{ fontWeight: 600, color: allSelected ? '#E63946' : undefined }}>Select All</span>
                                        </div>

                                        {/* Competitor items */}
                                        {filteredComps.map(c => {
                                            const checked = selectedIds.includes(c.id);
                                            return (
                                                <div
                                                    key={c.id}
                                                    style={{
                                                        ...S.compItem,
                                                        ...(hoveredItem === `comp-${c.id}` && !checked ? S.compItemHover : {}),
                                                        ...(hoveredItem === `comp-${c.id}` && checked ? { background: '#fff0f0', color: '#E63946' } : {}),
                                                    }}
                                                    onMouseEnter={() => setHoveredItem(`comp-${c.id}`)}
                                                    onMouseLeave={() => setHoveredItem(null)}
                                                    onClick={() => toggleCompetitor(c.id)}
                                                >
                                                    <div style={{ ...S.checkboxBase, ...(checked ? S.checkboxChecked : {}) }}>
                                                        {checked && <CheckOutlined style={{ fontSize: 10, color: '#fff' }} />}
                                                    </div>
                                                    <span>{c.name}</span>
                                                </div>
                                            );
                                        })}

                                        {compsLoading && (
                                            <div style={{ ...S.dropdownItem, color: '#9ca3af', textAlign: 'center' }}>
                                                <LoadingOutlined spin style={{ marginRight: 6 }} />Loading...
                                            </div>
                                        )}
                                        {!compsLoading && filteredComps.length === 0 && (
                                            <div style={{ ...S.dropdownItem, color: '#9ca3af', textAlign: 'center' }}>No competitors found</div>
                                        )}
                                    </div>
                                )}

                                {/* Pills */}
                                {selectedComps.length > 0 && (
                                    <div style={S.pillsArea}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Selected Competitors:</span>
                                            <button style={{ ...S.pillX, color: '#E63946', fontSize: 13 }} onClick={() => setSelectedIds([])}>Clear all</button>
                                        </div>
                                        <div>
                                            {selectedComps.map(c => (
                                                <span key={c.id} style={S.pill}>
                                                    {c.name}
                                                    <button style={S.pillX} onClick={() => removePill(c.id)}><CloseOutlined style={{ fontSize: 11 }} /></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error message */}
                            {errorMsg && (
                                <div style={{ background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: '#dc2626', fontSize: 13 }}>
                                    {errorMsg}
                                </div>
                            )}

                            {/* Generate button */}
                            <button
                                style={{ ...S.generateBtn, ...(!isFormValid ? S.generateBtnDisabled : {}) }}
                                disabled={!isFormValid}
                                onClick={handleGenerate}
                            >
                                Generate Report
                            </button>
                        </>
                    )}

                    {/* ── LOADING STEP ── */}
                    {step === 'loading' && (
                        <div style={S.loadingCenter}>
                            <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 40, color: '#E63946' }} spin />} />
                            <p style={{ marginTop: 20, fontSize: 16, color: '#6b7280', fontWeight: 500 }}>Generating...</p>
                        </div>
                    )}

                    {/* ── SUCCESS STEP ── */}
                    {step === 'success' && (
                        <div style={S.successCenter}>
                            <div style={S.greenCircle}>
                                <CheckCircleFilled style={{ fontSize: 36, color: '#16a34a' }} />
                            </div>
                            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                                Report Generated Successfully!
                            </h3>
                            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
                                Your custom report &ldquo;{titleVal}&rdquo; is ready
                            </p>

                            <div style={S.actionRow}>
                                <button style={S.previewBtn} onClick={handlePreview}>
                                    <EyeOutlined /> {previewOpen ? 'Hide Preview' : 'Preview'}
                                </button>
                                <button style={S.downloadBtn} onClick={handleDownload}>
                                    <DownloadOutlined /> Download Report
                                </button>
                            </div>

                            {/* Inline PDF preview */}
                            {previewOpen && (
                                <div style={{ marginTop: 20, textAlign: 'left' }}>
                                    {previewLoading ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                            <Spin indicator={<LoadingOutlined style={{ fontSize: 28, color: '#E63946' }} spin />} />
                                            <p style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>Loading PDF preview...</p>
                                        </div>
                                    ) : previewUrl ? (
                                        <iframe
                                            src={previewUrl}
                                            title="Report PDF Preview"
                                            style={{
                                                width: '100%',
                                                height: 540,
                                                border: '1.5px solid #e5e7eb',
                                                borderRadius: 8,
                                                display: 'block',
                                            }}
                                        />
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '24px 0', color: '#dc2626', fontSize: 14 }}>
                                            Failed to load PDF. Use Download instead.
                                        </div>
                                    )}
                                </div>
                            )}

                            <button style={S.anotherLink} onClick={resetForm}>
                                Generate Another Report
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Helpers for real report data ─────────────────────────────────────────────
const getReportTitle = (report) => report.title || (report.report_type === 'executive' ? 'Executive Report' : 'Analyst Report');
const getReportMeta = (report) => {
    const timeAgo = report.created_at
        ? formatDistanceToNow(new Date(report.created_at), { addSuffix: true })
        : '—';
    const period = report.period_start && report.period_end
        ? `${report.period_start} → ${report.period_end}`
        : '';
    return `Generated ${timeAgo}${period ? ` • ${period}` : ''}`;
};

// ── Main Reports component ────────────────────────────────────────────────────
function Reports() {
    const [filterType, setFilterType] = useState('all');
    const [filterPeriod, setFilterPeriod] = useState('30');
    const [searchVal, setSearchVal] = useState('');
    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [previewModal, setPreviewModal] = useState({ open: false, pdfUrl: null, title: '', loading: false });
    const [downloadingId, setDownloadingId] = useState(null);
    const pollingRef = useRef({});
    const pdfUrlsRef = useRef({});

    const isReady = (status) => status === 'completed';
    const isGenerating = (status) => status === 'generating' || status === 'pending';
    const isFailed = (status) => status === 'failed';

    // ── Fetch report list ──────────────────────────────────────────────────────
    const fetchReportList = useCallback(async () => {
        setReportsLoading(true);
        const filters = {};
        if (filterType !== 'all') filters.type = filterType;
        if (filterPeriod) filters.period = filterPeriod;
        if (searchVal.trim()) filters.search = searchVal.trim();
        const res = await listReports(filters);
        if (res.success && Array.isArray(res.data)) {
            setReports(res.data);
        } else if (res.success && res.data?.results) {
            setReports(res.data.results);
        }
        setReportsLoading(false);
    }, [filterType, filterPeriod, searchVal]);

    useEffect(() => { fetchReportList(); }, [fetchReportList]);

    // ── Poll in-progress reports ───────────────────────────────────────────────
    useEffect(() => {
        reports.forEach(report => {
            if (isGenerating(report.status) && !pollingRef.current[report.id]) {
                pollingRef.current[report.id] = setInterval(async () => {
                    const res = await getReport(report.id);
                    if (!res.success) return;
                    const updated = res.data;
                    if (updated.status === 'completed' || updated.status === 'failed') {
                        clearInterval(pollingRef.current[report.id]);
                        delete pollingRef.current[report.id];
                        setReports(prev => prev.map(r => r.id === report.id ? { ...r, ...updated } : r));
                    }
                }, 3000);
            }
        });
    }, [reports]);

    // Cleanup all polls on unmount
    useEffect(() => {
        return () => {
            Object.values(pollingRef.current).forEach(clearInterval);
            Object.values(pdfUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    // Called from GenerateReportModal after a new report is created
    const onReportGenerated = useCallback(() => {
        fetchReportList();
    }, [fetchReportList]);

    // ── Preview: fetch PDF with auth, show in modal iframe ────────────────────
    const handlePreview = async (report) => {
        const title = getReportTitle(report);
        setPreviewModal({ open: true, pdfUrl: null, title, loading: true });

        if (pdfUrlsRef.current[report.id]) {
            setPreviewModal({ open: true, pdfUrl: pdfUrlsRef.current[report.id], title, loading: false });
            return;
        }
        try {
            const token = localStorage.getItem('authToken');
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const res = await fetch(`${baseURL}/api/reports/${report.id}/pdf/`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                pdfUrlsRef.current[report.id] = url;
                setPreviewModal({ open: true, pdfUrl: url, title, loading: false });
            } else {
                message.error('Failed to load PDF preview.');
                setPreviewModal({ open: false, pdfUrl: null, title: '', loading: false });
            }
        } catch {
            message.error('Failed to load PDF preview.');
            setPreviewModal({ open: false, pdfUrl: null, title: '', loading: false });
        }
    };

    const handleDownload = async (report) => {
        setDownloadingId(report.id);
        const result = await downloadReportPdf(report.id, getReportTitle(report));
        setDownloadingId(null);
        if (!result.success) {
            message.error(result.error || 'Failed to download PDF. Please try again.');
        }
    };

    // ── Render: Reports list ─────────────────────────────────────────────────
    const renderReportsList = () => (
        <Card className="reports-list-card" bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="reports-inline-padding-24">
                <div>
                    <Title level={4} className="reports-list-title-custom reports-inline-mb-4" style={{ margin: 0 }}>Available Reports</Title>
                    <Text type="secondary" className="reports-inline-display-block" style={{ marginTop: 4 }}>
                        Generated strategic intelligence reports with source citations
                    </Text>
                </div>
                <Tooltip title="Refresh reports">
                    <Button
                        size="small"
                        icon={<ReloadOutlined spin={reportsLoading} />}
                        onClick={fetchReportList}
                        loading={reportsLoading}
                        style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}
                    />
                </Tooltip>
            </div>
            <div className="reports-inline-padding-24" style={{ paddingTop: 16 }}>
                {reportsLoading && reports.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 28, color: '#E63946' }} spin />} />
                        <p style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>Loading reports...</p>
                    </div>
                )}

                {!reportsLoading && reports.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                        <FileTextOutlined style={{ fontSize: 36, marginBottom: 12, display: 'block' }} />
                        <p style={{ fontSize: 14 }}>No reports yet. Generate your first report above.</p>
                    </div>
                )}

                {reports.map((report) => (
                    <div key={report.id} className="report-list-item">
                        <div className="report-info">
                            <FileTextOutlined className="report-icon" />
                            <div className="report-details">
                                <div className="report-title-row">
                                    <Text className="report-title-text">{getReportTitle(report)}</Text>
                                    <Tag className={`report-type-badge ${getReportTypeColor(report.report_type)}`}>
                                        {report.report_type}
                                    </Tag>
                                    <Tag className={`report-type-badge ${getStatusColor(report.status)}`}>
                                        {report.status}
                                    </Tag>
                                </div>
                                <Text className="report-meta-text">{getReportMeta(report)}</Text>
                            </div>
                        </div>

                        <div className="report-actions">
                            {/* Preview */}
                            {isReady(report.status) && (
                                <Button
                                    size="small"
                                    className="preview-btn"
                                    icon={<EyeOutlined />}
                                    onClick={() => handlePreview(report)}
                                >
                                    Preview
                                </Button>
                            )}

                            {/* Download (completed) */}
                            {isReady(report.status) && (
                                <Button
                                    size="small"
                                    className="download-btn"
                                    icon={downloadingId === report.id ? <LoadingOutlined /> : <DownloadOutlined />}
                                    loading={downloadingId === report.id}
                                    onClick={() => handleDownload(report)}
                                >
                                    Download
                                </Button>
                            )}

                            {/* Generating */}
                            {isGenerating(report.status) && (
                                <>
                                    <Button size="small" className="preview-btn" disabled icon={<EyeOutlined />}>Preview</Button>
                                    <Button size="small" disabled className="download-btn" icon={<LoadingOutlined spin />}>
                                        Generating...
                                    </Button>
                                </>
                            )}

                            {/* Failed */}
                            {isFailed(report.status) && (
                                <Tooltip title={report.error_message || 'Report generation failed.'}>
                                    <Button
                                        size="small"
                                        danger
                                        icon={<ExclamationCircleOutlined />}
                                        style={{ borderRadius: 6 }}
                                    >
                                        Failed
                                    </Button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );

    return (
        <div className="reports-page-ant">
            <div className="page-title-section">
                <h1><FileTextOutlined className="page-title-icon" /> Reports</h1>
            </div>

            <div className="page-content">
                {/* Header card */}
                <Card bordered={false} style={{ borderRadius: 12, marginBottom: 24, border: '2px solid #fee2e2' }}>
                    <div className="header-card-content">
                        <div>
                            <h1 className="header-title-main">Reports</h1>
                            <p className="header-subtitle-main">Generate and manage executive-ready competitive intelligence reports</p>
                        </div>
                        <div className="header-actions">
                            <Button className="generate-report-btn" onClick={() => setModalOpen(true)}>
                                <FileTextOutlined /> Generate Report
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Filter + Reports */}
                <Row gutter={[30, 30]}>
                    <Col xs={24}>
                        <Card className="filter-card" title={<Title level={4}><FilterOutlined className="reports-inline-color-red reports-inline-mr-8" /> Filter Reports</Title>} bordered={false}>
                            <div className="filter-controls">
                                <Space size={20} wrap>
                                    <span className="filter-label">Type:</span>
                                    <Select value={filterType} className="report-select reports-inline-width-140" onChange={setFilterType}>
                                        <Option value="all">All Types</Option>
                                        <Option value="executive">Executive</Option>
                                        <Option value="analyst">Analyst</Option>
                                    </Select>
                                    <span className="filter-label">Period:</span>
                                    <Select value={filterPeriod} style={{ width: 120 }} onChange={setFilterPeriod} className="report-select">
                                        <Option value="7">Last 7 days</Option>
                                        <Option value="30">Last 30 days</Option>
                                        <Option value="90">Last 90 days</Option>
                                    </Select>
                                    <div className="search-input-wrapper">
                                        <SearchOutlined style={{ color: '#64748b' }} />
                                        <Input
                                            placeholder="Search reports..."
                                            style={{ minWidth: 200, maxWidth: 300 }}
                                            bordered={false}
                                            value={searchVal}
                                            onChange={(e) => setSearchVal(e.target.value)}
                                        />
                                    </div>
                                </Space>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24}>{renderReportsList()}</Col>
                </Row>
            </div>

            {/* Generate Report Modal */}
            <GenerateReportModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); fetchReportList(); }}
                onReportGenerated={onReportGenerated}
            />

            {/* Report Preview Modal (PDF iframe) */}
            <AntModal
                open={previewModal.open}
                onCancel={() => setPreviewModal({ open: false, pdfUrl: null, title: '', loading: false })}
                footer={null}
                width={860}
                centered
                bodyStyle={{ padding: 0 }}
                title={
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                        <EyeOutlined style={{ marginRight: 8, color: '#E63946' }} />
                        {previewModal.title}
                    </span>
                }
            >
                {previewModal.loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#E63946' }} spin />} />
                        <p style={{ marginTop: 16, color: '#6b7280' }}>Loading PDF preview...</p>
                    </div>
                ) : previewModal.pdfUrl ? (
                    <iframe
                        src={previewModal.pdfUrl}
                        title="Report PDF Preview"
                        style={{ width: '100%', height: '72vh', border: 'none', display: 'block', borderRadius: '0 0 8px 8px' }}
                    />
                ) : (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '32px 0' }}>
                        Failed to load PDF preview.
                    </p>
                )}
            </AntModal>
        </div>
    );
}

export default Reports;
