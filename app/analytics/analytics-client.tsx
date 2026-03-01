"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getLinkAnalytics } from "@/app/actions/getLinkAnalytics";

/* ─────────────────────── types ─────────────────────── */

type LinkRow = {
    id: string;
    slug: string;
    name: string;
    originalUrl: string;
    url: string;
    createdAt: Date;
    _count: { clickEvents: number };
};

type Analytics = Awaited<ReturnType<typeof getLinkAnalytics>>;

/* ─────────────────────── helpers ─────────────────────── */

function timeAgo(d: Date | string) {
    const days = Math.round((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    return `${days}d ago`;
}

/* ─────────────────────── CSS ─────────────────────── */

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap');

  .an-root {
    --bg: #F7F5F0;
    --surface: #FFFFFF;
    --border: #E8E4DC;
    --text-primary: #1A1814;
    --text-secondary: #9B9588;
    --accent: #2A5C45;
    --accent-light: #EAF2EE;
    --danger: #C0392B;
    --mono: 'DM Mono', monospace;
    --serif: 'Fraunces', serif;
    background: var(--bg);
    color: var(--text-primary);
    font-family: var(--mono);
    min-height: 100vh;
  }

  /* ── HERO ── */
  .an-hero {
    padding: 64px 48px 40px;
    animation: anFadeUp 0.5s ease both;
  }
  .an-eyebrow {
    font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 14px; font-weight: 400;
  }
  .an-title {
    font-family: var(--serif); font-size: clamp(32px, 5vw, 48px);
    font-weight: 300; line-height: 1.08; letter-spacing: -1.5px; margin-bottom: 10px;
  }
  .an-title em { font-style: italic; color: var(--accent); }
  .an-sub { font-size: 12px; color: var(--text-secondary); font-weight: 300; }

  /* ── PAGE WRAPPER ── */
  .an-page {
    margin: 0 48px;
    border-top: 1px solid var(--border);
    animation: anFadeUp 0.5s 0.12s ease both;
    opacity: 0;
  }

  /* SECTION */
  .an-section-heading {
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px 0 16px; border-bottom: 1px solid var(--border);
  }
  .an-section-label {
    font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text-secondary); font-weight: 400;
  }
  .an-section-meta {
    font-family: var(--serif); font-size: 12px;
    font-style: italic; color: var(--text-secondary);
  }

  /* ── LINK PICKER ── */
  .an-pick-card {
    display: grid; grid-template-columns: 1fr auto;
    gap: 20px; align-items: center;
    padding: 20px 0; border-bottom: 1px solid var(--border);
    cursor: pointer; transition: opacity 0.15s;
    animation: anSlideIn 0.22s ease both;
  }
  .an-pick-card:hover { opacity: 0.7; }
  .an-pick-name {
    font-family: var(--serif); font-size: 16px; font-weight: 300;
    color: var(--text-primary); margin-bottom: 3px; letter-spacing: -0.2px;
  }
  .an-pick-url {
    font-size: 11px; color: var(--text-secondary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 520px; margin-bottom: 8px;
  }
  .an-pick-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .an-slug {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; padding: 3px 8px; border-radius: 3px;
    background: var(--accent-light); color: var(--accent); letter-spacing: 0.04em;
  }
  .an-slug::before {
    content: ''; width: 5px; height: 5px;
    background: var(--accent); border-radius: 50%; display: inline-block;
  }
  .an-pick-stat { font-size: 10px; color: var(--text-secondary); }
  .an-pick-stat strong {
    font-family: var(--serif); font-size: 13px;
    font-weight: 300; color: var(--text-primary); margin-right: 1px;
  }
  .an-pick-cta {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px; background: var(--text-primary); color: var(--bg);
    border: none; border-radius: 5px; font-family: var(--mono); font-size: 11px;
    letter-spacing: 0.04em; cursor: pointer; transition: all 0.15s;
    font-weight: 400; white-space: nowrap; flex-shrink: 0;
  }
  .an-pick-cta:hover { background: var(--accent); box-shadow: 0 4px 14px rgba(42,92,69,0.2); }

  /* ── EMPTY ── */
  .an-empty {
    padding: 64px 0; display: flex; flex-direction: column; gap: 10px;
  }
  .an-empty-icon {
    width: 44px; height: 44px; border: 1px dashed var(--border);
    border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px;
  }
  .an-empty-icon svg { opacity: 0.25; }
  .an-empty-title { font-family: var(--serif); font-size: 20px; font-weight: 300; }
  .an-empty-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.6; max-width: 260px; font-weight: 300; }

  /* ── ANALYTICS HERO ── */
  .an-detail-hero {
    padding: 48px 48px 36px; border-bottom: 1px solid var(--border);
    animation: anFadeUp 0.4s ease both;
  }
  .an-back-row { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
  .an-back-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 7px 14px; border: 1px solid var(--border); border-radius: 5px;
    background: var(--surface); color: var(--text-secondary);
    font-family: var(--mono); font-size: 11px; letter-spacing: 0.04em;
    cursor: pointer; transition: all 0.15s; font-weight: 400;
  }
  .an-back-btn:hover { border-color: var(--text-secondary); color: var(--text-primary); }
  .an-eyebrow-tag {
    font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--accent); font-weight: 400;
  }
  .an-detail-title {
    font-family: var(--serif); font-size: clamp(28px, 4vw, 40px);
    font-weight: 300; line-height: 1.1; letter-spacing: -1px; margin-bottom: 10px;
  }
  .an-url-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .an-dest { font-size: 11px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; max-width: 480px; }

  /* ── ANALYTICS BODY ── */
  .an-body {
    margin: 0 48px;
    display: grid; grid-template-columns: 1fr 300px;
    min-height: calc(100vh - 340px);
    animation: anFadeUp 0.4s 0.1s ease both;
    opacity: 0;
  }
  .an-main { border-right: 1px solid var(--border); padding: 36px 48px 60px 0; }
  .an-side { padding: 36px 0 60px 36px; }

  /* STAT ROW */
  .an-stat-row {
    display: grid; grid-template-columns: repeat(3, 1fr);
    border: 1px solid var(--border); border-radius: 8px;
    background: var(--surface); overflow: hidden; margin-bottom: 40px;
  }
  .an-stat-cell { padding: 22px 24px; border-right: 1px solid var(--border); }
  .an-stat-cell:last-child { border-right: none; }
  .an-stat-label {
    font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-secondary); margin-bottom: 10px; font-weight: 400;
  }
  .an-stat-value {
    font-family: var(--serif); font-size: 44px; font-weight: 300;
    line-height: 1; letter-spacing: -1px; color: var(--text-primary); margin-bottom: 6px;
  }
  .an-stat-delta { font-size: 10px; color: var(--accent); font-weight: 300; }

  /* CHART */
  .an-chart-wrap { margin-bottom: 40px; }
  .an-chart-header {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 16px; border-bottom: 1px solid var(--border);
  }
  .an-range-tabs { display: flex; gap: 4px; }
  .an-range-tab {
    padding: 5px 10px; border-radius: 4px; font-family: var(--mono); font-size: 10px;
    letter-spacing: 0.06em; cursor: pointer; border: 1px solid var(--border);
    background: transparent; color: var(--text-secondary); transition: all 0.14s; font-weight: 400;
  }
  .an-range-tab:hover { color: var(--text-primary); border-color: var(--text-secondary); }
  .an-range-tab.on { color: var(--accent); background: var(--accent-light); border-color: var(--accent); }
  .an-chart-area {
    display: flex; align-items: flex-end; gap: 5px;
    height: 120px; margin: 20px 0 28px; position: relative;
  }
  .an-bar-col {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; height: 100%; justify-content: flex-end;
    position: relative; cursor: pointer;
  }
  .an-bar {
    width: 100%; background: var(--border);
    border-radius: 2px 2px 0 0; min-height: 3px; transition: background 0.15s;
  }
  .an-bar-col:hover .an-bar, .an-bar-today .an-bar { background: var(--accent); }
  .an-bar-col:hover::after {
    content: attr(data-tip);
    position: absolute; bottom: calc(100% + 6px); left: 50%;
    transform: translateX(-50%); background: var(--text-primary); color: var(--bg);
    font-size: 10px; padding: 4px 8px; border-radius: 4px;
    white-space: nowrap; pointer-events: none; z-index: 10; font-family: var(--mono);
  }
  .an-bar-label {
    font-size: 9px; color: var(--text-secondary); letter-spacing: 0.03em;
    margin-top: 6px; position: absolute; bottom: -20px; white-space: nowrap;
  }

  /* CLICKS TABLE */
  .an-clicks-header {
    display: grid; grid-template-columns: 1fr 120px 80px;
    gap: 16px; padding: 0 0 10px; border-bottom: 1px solid var(--border);
  }
  .an-col-head {
    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-secondary); font-weight: 400;
  }
  .an-click-row {
    display: grid; grid-template-columns: 1fr 120px 80px;
    gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--border);
    animation: anSlideIn 0.2s ease both;
  }
  .an-click-row:hover { opacity: 0.75; }
  .an-click-ref { display: flex; align-items: center; gap: 8px; }
  .an-ref-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; flex-shrink: 0; }
  .an-ref-dot.muted { background: var(--border); }
  .an-click-source { font-size: 12px; font-weight: 300; }
  .an-click-source span { display: block; font-size: 10px; color: var(--text-secondary); margin-top: 1px; }
  .an-click-country { font-size: 12px; font-weight: 300; }
  .an-click-time { font-size: 11px; color: var(--text-secondary); font-weight: 300; text-align: right; }

  /* SIDEBAR BREAKDOWN */
  .an-sb-block { margin-bottom: 32px; }
  .an-sb-heading {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 12px; border-bottom: 1px solid var(--border); margin-bottom: 0;
  }
  .an-bd-row {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 0; border-bottom: 1px solid var(--border);
  }
  .an-bd-icon {
    width: 24px; height: 24px; background: var(--accent-light);
    border-radius: 4px; display: flex; align-items: center;
    justify-content: center; font-size: 11px; flex-shrink: 0;
  }
  .an-bd-label { flex: 1; font-size: 12px; font-weight: 300; }
  .an-bd-track { width: 56px; }
  .an-bd-track-bg { height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .an-bd-track-fill { height: 100%; background: var(--accent); border-radius: 2px; }
  .an-bd-pct { font-family: var(--serif); font-size: 14px; font-weight: 300; min-width: 36px; text-align: right; }

  /* LOADING */
  .an-loading {
    display: flex; align-items: center; justify-content: center;
    min-height: 200px; font-size: 12px; color: var(--text-secondary);
  }

  @keyframes anFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes anSlideIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 900px) {
    .an-hero { padding: 48px 24px 32px; }
    .an-page, .an-body { margin: 0 24px; }
    .an-detail-hero { padding: 36px 24px 28px; }
    .an-body { grid-template-columns: 1fr; }
    .an-main { border-right: none; padding-right: 0; }
    .an-side { padding-left: 0; border-top: 1px solid var(--border); }
    .an-stat-row { grid-template-columns: 1fr 1fr; }
    .an-stat-row .an-stat-cell:last-child { grid-column: 1/-1; border-right: none; border-top: 1px solid var(--border); }
    .an-clicks-header, .an-click-row { grid-template-columns: 1fr 80px; }
    .an-clicks-header .an-col-head:nth-child(2),
    .an-click-row .an-click-country { display: none; }
  }
`;

/* ═══════════════════════ CHART ═══════════════════════ */

const DAY_LABELS_7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS_14 = Array.from({ length: 14 }, (_, i) => String(i + 1));

function Chart({ data, range }: { data: number[]; range: "7d" | "14d" | "30d" }) {
    const max = Math.max(...data, 1);
    const labels = range === "7d" ? DAY_LABELS_7 : range === "14d" ? DAY_LABELS_14 : null;
    const step = data.length <= 7 ? 1 : data.length <= 14 ? 2 : 5;

    return (
        <div className="an-chart-area">
            {data.map((v, i) => {
                const isLast = i === data.length - 1;
                const showLbl = labels ? (i % step === 0 || isLast) : i % step === 0;
                const lbl = labels ? (showLbl ? labels[i] : "") : (showLbl ? String(i + 1) : "");
                return (
                    <div
                        key={i}
                        className={`an-bar-col${isLast ? " an-bar-today" : ""}`}
                        data-tip={`${v} click${v !== 1 ? "s" : ""}`}
                    >
                        <div className="an-bar" style={{ height: `${Math.round((v / max) * 100)}%` }} />
                        <div className="an-bar-label">{isLast ? "Today" : lbl}</div>
                    </div>
                );
            })}
        </div>
    );
}

/* ═══════════════════════ COMPONENT ═══════════════════════ */

export default function AnalyticsClient({
    links,
    initialLinkId,
}: {
    links: LinkRow[];
    initialLinkId: string | null;
}) {
    const router = useRouter();
    const [selectedLink, setSelectedLink] = useState<LinkRow | null>(
        initialLinkId ? (links.find((l) => l.id === initialLinkId) ?? null) : null
    );
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [range, setRange] = useState<"7d" | "14d" | "30d">("7d");
    const [loading, startTransition] = useTransition();

    const openAnalytics = useCallback((link: LinkRow) => {
        setSelectedLink(link);
        setAnalytics(null);
        setRange("7d");
        router.replace(`/analytics?link=${link.id}`, { scroll: false });
        startTransition(async () => {
            const data = await getLinkAnalytics(link.id);
            setAnalytics(data);
        });
    }, [router]);

    // Auto-open if initialLinkId was provided
    useEffect(() => {
        if (initialLinkId && !analytics) {
            const link = links.find((l) => l.id === initialLinkId);
            if (link) openAnalytics(link);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const goBack = () => {
        setSelectedLink(null);
        setAnalytics(null);
        router.replace("/analytics", { scroll: false });
    };

    const chartData = analytics
        ? range === "7d" ? analytics.chart7
            : range === "14d" ? analytics.chart14
                : analytics.chart30
        : [];

    const shortLink = selectedLink
        ? `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${selectedLink.slug}`
        : "";

    return (
        <div className="an-root">
            <style dangerouslySetInnerHTML={{ __html: css }} />

            {/* ══════════════════════ LINK PICKER ══════════════════════ */}
            {!selectedLink && (
                <>
                    <div className="an-hero">
                        <div className="an-eyebrow">Analytics</div>
                        <h1 className="an-title">
                            Pick a link to<br />
                            <em>inspect.</em>
                        </h1>
                        <p className="an-sub">Select any tracked link below to view its full performance breakdown.</p>
                    </div>

                    <div className="an-page">
                        <div className="an-section-heading">
                            <div className="an-section-label">Your links</div>
                            <div className="an-section-meta">{links.length} link{links.length !== 1 ? "s" : ""}</div>
                        </div>

                        {links.length === 0 ? (
                            <div className="an-empty">
                                <div className="an-empty-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M8.5 11.5L11.5 8.5M7 14l-1.5 1.5a2.5 2.5 0 01-3.5-3.5L4.5 9.5M13 6l1.5-1.5a2.5 2.5 0 013.5 3.5L16.5 10" stroke="#1A1814" strokeWidth="1.2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="an-empty-title">No links yet</div>
                                <div className="an-empty-desc">Create a tracked link on the dashboard first.</div>
                            </div>
                        ) : (
                            links.map((link, i) => (
                                <div
                                    key={link.id}
                                    className="an-pick-card"
                                    style={{ animationDelay: `${i * 0.06}s` }}
                                    onClick={() => openAnalytics(link)}
                                >
                                    <div>
                                        <div className="an-pick-name">{link.name}</div>
                                        <div className="an-pick-url">{link.originalUrl}</div>
                                        <div className="an-pick-meta">
                                            <span className="an-slug">
                                                {process.env.NEXT_PUBLIC_ROOT_DOMAIN}/{link.slug}
                                            </span>
                                            <span className="an-pick-stat">
                                                <strong>{link._count.clickEvents}</strong> clicks
                                            </span>
                                            <span className="an-pick-stat" style={{ color: "var(--border)" }}>
                                                {timeAgo(link.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="an-pick-cta">
                                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                            <path d="M1 9l3-3 2 2 3-4 2 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        View analytics
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* ══════════════════════ ANALYTICS DETAIL ══════════════════════ */}
            {selectedLink && (
                <>
                    {/* Header */}
                    <div className="an-detail-hero">
                        <div className="an-back-row">
                            <button className="an-back-btn" onClick={goBack}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M7.5 2L3 6l4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                All links
                            </button>
                            <span className="an-eyebrow-tag">Link analytics</span>
                        </div>
                        <div className="an-detail-title">{selectedLink.name}</div>
                        <div className="an-url-row">
                            <span className="an-slug">{shortLink}</span>
                            <span className="an-dest">{selectedLink.originalUrl}</span>
                        </div>
                    </div>

                    {loading || !analytics ? (
                        <div className="an-loading">Loading analytics…</div>
                    ) : (
                        <div className="an-body">
                            {/* ── MAIN ── */}
                            <div className="an-main">

                                {/* Stat row */}
                                <div className="an-stat-row">
                                    <div className="an-stat-cell">
                                        <div className="an-stat-label">Unique visitors</div>
                                        <div className="an-stat-value">{analytics.uniqueVisitors}</div>
                                        <div className="an-stat-delta">
                                            {analytics.totalClicks > 0
                                                ? `${Math.round((analytics.uniqueVisitors / analytics.totalClicks) * 100)}% of total clicks`
                                                : "—"}
                                        </div>
                                    </div>
                                    <div className="an-stat-cell">
                                        <div className="an-stat-label">Total clicks</div>
                                        <div className="an-stat-value">{analytics.totalClicks}</div>
                                        <div className="an-stat-delta">
                                            {analytics.todayClicks > 0 ? `↑ ${analytics.todayClicks} today` : "—"}
                                        </div>
                                    </div>
                                    <div className="an-stat-cell">
                                        <div className="an-stat-label">Clicks today</div>
                                        <div className="an-stat-value">{analytics.todayClicks}</div>
                                        <div className="an-stat-delta">since midnight</div>
                                    </div>
                                </div>

                                {/* Chart */}
                                <div className="an-chart-wrap">
                                    <div className="an-chart-header">
                                        <div className="an-section-label">Clicks over time</div>
                                        <div className="an-range-tabs">
                                            {(["7d", "14d", "30d"] as const).map((r) => (
                                                <button
                                                    key={r}
                                                    className={`an-range-tab${range === r ? " on" : ""}`}
                                                    onClick={() => setRange(r)}
                                                >{r}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <Chart data={chartData} range={range} />
                                </div>

                                {/* Recent clicks */}
                                <div>
                                    <div className="an-section-heading" style={{ paddingTop: 0, marginBottom: 16 }}>
                                        <div className="an-section-label">Recent clicks</div>
                                        <div className="an-section-meta">{analytics.recentClicks.length} recent</div>
                                    </div>

                                    {analytics.recentClicks.length === 0 ? (
                                        <div className="an-empty">
                                            <div className="an-empty-title">No clicks yet</div>
                                            <div className="an-empty-desc">Share your link to start collecting data.</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="an-clicks-header">
                                                <div className="an-col-head">Referrer</div>
                                                <div className="an-col-head">Country</div>
                                                <div className="an-col-head" style={{ textAlign: "right" }}>Time</div>
                                            </div>
                                            {analytics.recentClicks.map((c, i) => (
                                                <div key={i} className="an-click-row" style={{ animationDelay: `${i * 0.03}s` }}>
                                                    <div className="an-click-ref">
                                                        <div className={`an-ref-dot${c.refType === "direct" ? " muted" : ""}`} />
                                                        <div className="an-click-source">
                                                            {c.ref}
                                                            <span>{c.refType}</span>
                                                        </div>
                                                    </div>
                                                    <div className="an-click-country">{c.country || "—"}</div>
                                                    <div className="an-click-time">{c.time}</div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* ── SIDEBAR ── */}
                            <div className="an-side">

                                {/* Devices */}
                                <div className="an-sb-block">
                                    <div className="an-sb-heading">
                                        <div className="an-section-label">Devices</div>
                                    </div>
                                    {analytics.devices.length === 0 ? (
                                        <div style={{ padding: "16px 0", fontSize: 11, color: "var(--text-secondary)" }}>No data yet</div>
                                    ) : analytics.devices.map((d, i) => (
                                        <div key={i} className="an-bd-row">
                                            <div className="an-bd-icon">{d.icon}</div>
                                            <div className="an-bd-label">{d.label}</div>
                                            <div className="an-bd-track">
                                                <div className="an-bd-track-bg">
                                                    <div className="an-bd-track-fill" style={{ width: `${d.pct}%` }} />
                                                </div>
                                            </div>
                                            <div className="an-bd-pct">{d.pct}%</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Browsers */}
                                <div className="an-sb-block">
                                    <div className="an-sb-heading">
                                        <div className="an-section-label">Browsers</div>
                                    </div>
                                    {analytics.browsers.length === 0 ? (
                                        <div style={{ padding: "16px 0", fontSize: 11, color: "var(--text-secondary)" }}>No data yet</div>
                                    ) : analytics.browsers.map((b, i) => (
                                        <div key={i} className="an-bd-row">
                                            <div className="an-bd-icon" style={{ fontSize: 13 }}>◉</div>
                                            <div className="an-bd-label">{b.label}</div>
                                            <div className="an-bd-track">
                                                <div className="an-bd-track-bg">
                                                    <div className="an-bd-track-fill" style={{ width: `${b.pct}%` }} />
                                                </div>
                                            </div>
                                            <div className="an-bd-pct">{b.pct}%</div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
