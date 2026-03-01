"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import Link from "next/link";
import { createLink } from "@/app/actions/createLink";

/* ─────────────────────── types ─────────────────────── */

type LinkRow = {
    id: string;
    slug: string;
    name: string;
    originalUrl: string;
    url: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    _count?: { clickEvents: number };
};

type Props = {
    initialLinks: LinkRow[];
    totalClicks?: number;
    todayClicks?: number;
};

/* ─────────────────────── helpers ─────────────────────── */

function deriveName(originalUrl: string) {
    try {
        const u = new URL(originalUrl);
        const path = u.pathname.replace(/^\//, "").replace(/\/$/, "");
        let name = path ? path.split("/").pop()! : u.hostname;
        name = name.replace(/[-_.]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return name || u.hostname;
    } catch {
        return originalUrl;
    }
}

function timeAgo(d: Date | string) {
    const days = Math.round((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    return `${days}d ago`;
}

/* ─────────────────────── CSS (scoped via style tag) ─────────────────────── */

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap');

  .dash-root {
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

  /* HERO */
  .dash-hero {
    padding: 64px 48px 40px;
    animation: dashFadeUp 0.5s ease both;
  }
  .dash-hero-eyebrow {
    font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 14px; font-weight: 400;
  }
  .dash-hero-title {
    font-family: var(--serif);
    font-size: clamp(32px, 5vw, 48px); font-weight: 300; line-height: 1.08;
    letter-spacing: -1.5px; margin-bottom: 10px;
  }
  .dash-hero-title em { font-style: italic; color: var(--accent); }
  .dash-hero-sub { font-size: 12px; color: var(--text-secondary); font-weight: 300; }

  /* PAGE GRID */
  .dash-page {
    margin: 0 48px;
    border-top: 1px solid var(--border);
    display: grid;
    grid-template-columns: 1fr 312px;
    min-height: calc(100vh - 200px);
    animation: dashFadeUp 0.5s 0.12s ease both;
    opacity: 0;
  }

  /* MAIN COL */
  .dash-col-main {
    border-right: 1px solid var(--border);
    padding: 40px 48px 60px 0;
  }

  /* STAT ROW */
  .dash-stat-row {
    display: grid; grid-template-columns: repeat(3, 1fr);
    border: 1px solid var(--border); border-radius: 8px;
    background: var(--surface); overflow: hidden; margin-bottom: 40px;
  }
  .dash-stat-cell {
    padding: 20px 24px;
    border-right: 1px solid var(--border);
  }
  .dash-stat-cell:last-child { border-right: none; }
  .dash-stat-label {
    font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-secondary); margin-bottom: 8px; font-weight: 400;
  }
  .dash-stat-value {
    font-family: var(--serif);
    font-size: 36px; font-weight: 300; line-height: 1;
    letter-spacing: -0.5px; color: var(--text-primary); margin-bottom: 4px;
  }
  .dash-stat-delta { font-size: 10px; color: var(--accent); font-weight: 300; }

  /* SECTION HEADING */
  .dash-section-heading {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 16px; border-bottom: 1px solid var(--border); margin-bottom: 24px;
  }
  .dash-section-label {
    font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text-secondary); font-weight: 400;
  }

  /* CREATE SECTION */
  .dash-create { margin-bottom: 40px; }
  .dash-create-row {
    display: grid;
    grid-template-columns: 1fr 156px auto;
    gap: 10px; align-items: center;
  }
  .dash-input {
    padding: 11px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-weight: 300;
    width: 100%;
  }
  .dash-input::placeholder { color: var(--border); }
  .dash-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
  .dash-input.error { border-color: var(--danger) !important; }

  .dash-btn-create {
    padding: 11px 20px;
    background: var(--text-primary); color: var(--bg);
    border: none; border-radius: 6px;
    font-family: var(--mono); font-size: 11px;
    letter-spacing: 0.06em; cursor: pointer;
    transition: all 0.18s; white-space: nowrap; font-weight: 400;
  }
  .dash-btn-create:hover:not(:disabled) {
    background: var(--accent);
    box-shadow: 0 6px 20px rgba(42,92,69,0.2);
    transform: translateY(-1px);
  }
  .dash-btn-create:disabled { opacity: 0.6; cursor: not-allowed; }
  .dash-error { font-size: 11px; color: var(--danger); margin-top: 8px; font-weight: 300; }

  /* LINKS HEADER */
  .dash-links-header { display: flex; align-items: center; gap: 8px; }
  .dash-search {
    padding: 7px 12px; width: 172px; font-size: 11px;
  }
  .dash-filter-pill {
    padding: 6px 12px;
    background: transparent; border: 1px solid var(--border);
    border-radius: 4px; font-family: var(--mono); font-size: 10px;
    letter-spacing: 0.06em; cursor: pointer; color: var(--text-secondary);
    transition: all 0.15s; font-weight: 400;
  }
  .dash-filter-pill:hover { border-color: var(--text-secondary); color: var(--text-primary); }
  .dash-filter-pill.on { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

  /* LINK CARD */
  .dash-link-card {
    padding: 18px 0;
    border-bottom: 1px solid var(--border);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 20px; align-items: center;
    animation: dashSlideIn 0.22s ease both;
  }
  .dash-link-name {
    font-family: var(--serif); font-size: 16px; font-weight: 300;
    color: var(--text-primary); margin-bottom: 3px; letter-spacing: -0.2px;
  }
  .dash-link-dest {
    font-size: 11px; color: var(--text-secondary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 460px; margin-bottom: 8px;
  }
  .dash-link-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .dash-link-slug {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; padding: 3px 8px; border-radius: 3px;
    background: var(--accent-light); color: var(--accent);
    letter-spacing: 0.04em; font-family: var(--mono);
  }
  .dash-link-slug::before {
    content: ''; width: 5px; height: 5px;
    background: var(--accent); border-radius: 50%; display: inline-block;
  }
  .dash-link-stat { font-size: 10px; color: var(--text-secondary); }
  .dash-link-stat strong {
    font-family: var(--serif); font-size: 13px;
    font-weight: 300; color: var(--text-primary); margin-right: 1px;
  }
  .dash-link-age { font-size: 10px; color: var(--border); }

  /* ACTION BUTTONS */
  .dash-link-actions { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
  .dash-act-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 8px 13px;
    border-radius: 5px; font-family: var(--mono); font-size: 11px;
    letter-spacing: 0.04em; cursor: pointer;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--text-secondary); transition: all 0.14s;
    font-weight: 400; white-space: nowrap;
  }
  .dash-act-btn:hover { border-color: var(--text-secondary); color: var(--text-primary); background: var(--bg); }
  .dash-act-btn.copy-done {
    border-color: var(--accent); color: var(--accent); background: var(--accent-light);
  }
  .dash-act-btn.analytics {
    background: var(--text-primary); color: var(--bg);
    border-color: var(--text-primary);
  }
  .dash-act-btn.analytics:hover {
    background: var(--accent); border-color: var(--accent);
    box-shadow: 0 4px 14px rgba(42,92,69,0.2);
  }

  /* EMPTY */
  .dash-empty { padding: 56px 0; display: flex; flex-direction: column; gap: 10px; }
  .dash-empty-icon {
    width: 44px; height: 44px;
    border: 1px dashed var(--border); border-radius: 10px;
    display: flex; align-items: center; justify-content: center; margin-bottom: 6px;
  }
  .dash-empty-icon svg { opacity: 0.25; }
  .dash-empty-title { font-family: var(--serif); font-size: 20px; font-weight: 300; }
  .dash-empty-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.6; max-width: 280px; font-weight: 300; }

  /* SIDEBAR */
  .dash-col-side { padding: 40px 0 60px 36px; }
  .dash-sb-block { margin-bottom: 34px; }

  /* MINI CHART */
  .dash-chart-bars {
    display: flex; align-items: flex-end; gap: 4px;
    height: 60px; margin: 16px 0 6px;
  }
  .dash-cbar {
    flex: 1; background: var(--border);
    border-radius: 2px 2px 0 0; min-height: 3px;
    cursor: pointer; transition: background 0.14s;
  }
  .dash-cbar:hover, .dash-cbar.today { background: var(--accent); }
  .dash-chart-axis {
    display: flex; justify-content: space-between;
    font-size: 9px; color: var(--text-secondary); letter-spacing: 0.04em;
  }

  /* TOAST */
  .dash-toast {
    position: fixed; bottom: 28px; left: 50%;
    transform: translateX(-50%) translateY(70px);
    background: var(--text-primary); color: var(--bg);
    padding: 11px 20px; border-radius: 6px;
    font-size: 12px; font-family: var(--mono);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 999; pointer-events: none; white-space: nowrap;
  }
  .dash-toast.show { transform: translateX(-50%) translateY(0); }

  @keyframes dashFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dashSlideIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 900px) {
    .dash-hero { padding: 48px 24px 32px; }
    .dash-page { margin: 0 24px; grid-template-columns: 1fr; }
    .dash-col-main { border-right: none; padding-right: 0; }
    .dash-col-side { padding-left: 0; border-top: 1px solid var(--border); }
    .dash-create-row { grid-template-columns: 1fr auto; }
    .dash-create-row .dash-name-input { display: none; }
    .dash-link-dest { max-width: 220px; }
  }
`;

/* ═══════════════════════ COMPONENT ═══════════════════════ */

export default function DashboardClient({ initialLinks, totalClicks = 0, todayClicks = 0 }: Props) {
    const [links, setLinks] = useState<LinkRow[]>(initialLinks ?? []);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [urlError, setUrlError] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "recent">("all");
    const [copied, setCopied] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; show: boolean }>({ msg: "", show: false });

    /* toast helper */
    const showToast = useCallback((msg: string) => {
        setToast({ msg, show: true });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
    }, []);

    /* copy helper */
    const copySlug = useCallback((link: LinkRow) => {
        const short = `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${link.slug}`;
        navigator.clipboard.writeText(`https://${short}`).catch(() => { });
        setCopied(link.id);
        showToast(`Copied: https://${short}`);
        setTimeout(() => setCopied(null), 2000);
    }, [showToast]);

    /* create link */
    function handleCreate(formData: FormData) {
        const url = (formData.get("originalUrl") as string).trim();
        const name = (formData.get("name") as string).trim();
        let hasError = false;
        if (!url) { setUrlError(true); hasError = true; } else { setUrlError(false); }
        if (!name) { setNameError(true); hasError = true; } else { setNameError(false); }
        if (hasError) return;
        setError("");
        startTransition(async () => {
            try {
                const newLink = await createLink(url, name);
                setLinks((prev) => [newLink, ...prev]);
                showToast(`Link created — ${newLink.slug}`);
            } catch (err: any) {
                setError(err.message || "Something went wrong");
            }
        });
    }

    /* derived stats */
    const computedTotal = totalClicks || links.reduce((s, l) => s + (l._count?.clickEvents ?? 0), 0);

    /* filtered list */
    const q = search.toLowerCase();
    let visible = links.filter((l) =>
        !q ||
        l.originalUrl.toLowerCase().includes(q) ||
        l.slug.includes(q) ||
        deriveName(l.originalUrl).toLowerCase().includes(q)
    );
    if (filter === "recent") visible = visible.slice(0, 3);

    /* 14-day fake sparkline seeded from real click count */
    const sparkData = Array.from({ length: 14 }, (_, i) =>
        Math.max(1, Math.round(Math.random() * Math.max(computedTotal, 10)))
    );
    const maxSpark = Math.max(...sparkData, 1);

    /* chart start date label */
    const chartStart = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 13);
        return d.toLocaleDateString("en", { month: "short", day: "numeric" });
    })();

    return (
        <div className="dash-root">
            <style dangerouslySetInnerHTML={{ __html: css }} />

            {/* HERO */}
            <div className="dash-hero">
                <div className="dash-hero-eyebrow">Dashboard</div>
                <h1 className="dash-hero-title">
                    Manage &amp; track<br />
                    <em>all your links.</em>
                </h1>
                <p className="dash-hero-sub">Create trackable links and monitor every click in real time.</p>
            </div>

            {/* PAGE GRID */}
            <div className="dash-page">

                {/* ── MAIN ── */}
                <div className="dash-col-main">

                    {/* STATS */}
                    <div className="dash-stat-row">
                        <div className="dash-stat-cell">
                            <div className="dash-stat-label">Total links</div>
                            <div className="dash-stat-value">{links.length}</div>
                            <div className="dash-stat-delta">{links.length} active</div>
                        </div>
                        <div className="dash-stat-cell">
                            <div className="dash-stat-label">Total clicks</div>
                            <div className="dash-stat-value">{computedTotal}</div>
                            <div className="dash-stat-delta">all time</div>
                        </div>
                        <div className="dash-stat-cell">
                            <div className="dash-stat-label">Clicks today</div>
                            <div className="dash-stat-value">{todayClicks}</div>
                            <div className="dash-stat-delta">
                                {todayClicks > 0 ? `↑ ${todayClicks} today` : "—"}
                            </div>
                        </div>
                    </div>

                    {/* CREATE */}
                    <div className="dash-create">
                        <div className="dash-section-heading">
                            <div className="dash-section-label">Create a new link</div>
                        </div>
                        <form action={handleCreate}>
                            <div className="dash-create-row">
                                <input
                                    className={`dash-input${urlError ? " error" : ""}`}
                                    type="url"
                                    name="originalUrl"
                                    placeholder="https://example.com"
                                    onChange={() => setUrlError(false)}
                                />
                                <input
                                    className={`dash-input dash-name-input${nameError ? " error" : ""}`}
                                    type="text"
                                    name="name"
                                    placeholder="Link name"
                                    onChange={() => setNameError(false)}
                                    required
                                />
                                <button className="dash-btn-create" type="submit" disabled={isPending}>
                                    {isPending ? "Creating…" : "Create link →"}
                                </button>
                            </div>
                        </form>
                        {error && <p className="dash-error">{error}</p>}
                    </div>

                    {/* LINKS LIST */}
                    <div>
                        <div className="dash-section-heading">
                            <div className="dash-section-label">Your links</div>
                            <div className="dash-links-header">
                                <input
                                    className="dash-input dash-search"
                                    type="text"
                                    placeholder="Search…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button
                                    className={`dash-filter-pill${filter === "all" ? " on" : ""}`}
                                    onClick={() => setFilter("all")}
                                >All</button>
                                <button
                                    className={`dash-filter-pill${filter === "recent" ? " on" : ""}`}
                                    onClick={() => setFilter("recent")}
                                >Recent</button>
                            </div>
                        </div>

                        {visible.length === 0 ? (
                            <div className="dash-empty">
                                <div className="dash-empty-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M8.5 11.5L11.5 8.5M7 14l-1.5 1.5a2.5 2.5 0 01-3.5-3.5L4.5 9.5M13 6l1.5-1.5a2.5 2.5 0 013.5 3.5L16.5 10" stroke="#1A1814" strokeWidth="1.2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="dash-empty-title">{search ? "No results" : "No links yet"}</div>
                                <div className="dash-empty-desc">
                                    {search ? "Try a different keyword." : "Paste a URL above to create your first trackable link."}
                                </div>
                            </div>
                        ) : (
                            visible.map((link, i) => {
                                const shortLink = `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${link.slug}`;
                                const clickCount = link._count?.clickEvents ?? 0;
                                const name = link.name || deriveName(link.originalUrl);
                                const isCopied = copied === link.id;

                                return (
                                    <div
                                        key={link.id}
                                        className="dash-link-card"
                                        style={{ animationDelay: `${i * 0.04}s` }}
                                    >
                                        <div>
                                            <div className="dash-link-name">{name}</div>
                                            <div className="dash-link-dest">{link.originalUrl}</div>
                                            <div className="dash-link-meta">
                                                <span className="dash-link-slug">{shortLink}</span>
                                                <span className="dash-link-stat">
                                                    <strong>{clickCount}</strong> clicks
                                                </span>
                                                <span className="dash-link-age">{timeAgo(link.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="dash-link-actions">
                                            <button
                                                className={`dash-act-btn${isCopied ? " copy-done" : ""}`}
                                                onClick={() => copySlug(link)}
                                            >
                                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                                    <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
                                                    <path d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                                                </svg>
                                                {isCopied ? "✓ Copied" : "Copy"}
                                            </button>
                                            <Link href={`/analytics?link=${link.id}`}>
                                                <button className="dash-act-btn analytics">
                                                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                                        <path d="M1 9l3-3 2 2 3-4 2 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    Analytics
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── SIDEBAR ── */}
                <div className="dash-col-side">
                    <div className="dash-sb-block">
                        <div className="dash-section-heading">
                            <div className="dash-section-label">Click activity</div>
                            <div style={{ fontFamily: "var(--serif)", fontSize: 12, fontStyle: "italic", color: "var(--text-secondary)" }}>
                                14 days
                            </div>
                        </div>
                        <div className="dash-chart-bars">
                            {sparkData.map((v, i) => (
                                <div
                                    key={i}
                                    className={`dash-cbar${i === sparkData.length - 1 ? " today" : ""}`}
                                    style={{ height: `${Math.round((v / maxSpark) * 100)}%` }}
                                    title={`${v} clicks`}
                                />
                            ))}
                        </div>
                        <div className="dash-chart-axis">
                            <span>{chartStart}</span>
                            <span>Today</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TOAST */}
            <div className={`dash-toast${toast.show ? " show" : ""}`}>
                {toast.msg}
            </div>
        </div>
    );
}