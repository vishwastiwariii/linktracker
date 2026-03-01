"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ── CSS ─────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }

  .lp-root {
    --dark:    #0A0A0A;
    --dark-2:  #111111;
    --dark-3:  #1A1A1A;
    --dark-4:  #242424;
    --border-dark: rgba(255,255,255,0.07);
    --border-light: #E8E5DF;
    --text-on-dark: #F0EDE8;
    --muted-on-dark: rgba(240,237,232,0.4);
    --light-bg: #F9F8F5;
    --light-2:  #FFFFFF;
    --text:     #141210;
    --muted:    #8A8580;
    --green:    #2A5C45;
    --green-2:  #336B52;
    --green-glow: rgba(42,92,69,0.35);
    --green-subtle: #EBF4EF;
    --serif: 'Instrument Serif', Georgia, serif;
    --mono: 'Geist Mono', 'DM Mono', monospace;
    background: var(--light-bg);
    color: var(--text);
    font-family: var(--mono);
    -webkit-font-smoothing: antialiased;
  }


  /* ── HERO ── */
  .lp-hero {
    background: var(--dark);
    min-height: 100vh;
    padding: 0 40px;
    display: flex; flex-direction: column;
    align-items: center;
    position: relative; overflow: hidden;
  }
  .lp-hero::before {
    content: '';
    position: absolute; top: -120px; left: 50%;
    transform: translateX(-50%);
    width: 900px; height: 600px;
    background: radial-gradient(ellipse at center, rgba(42,92,69,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .lp-hero::after {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
  }
  .lp-hero-content {
    position: relative; z-index: 2;
    text-align: center; padding-top: 168px;
    max-width: 780px; width: 100%;
  }
  .lp-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 5px 14px 5px 8px;
    background: rgba(42,92,69,0.15); border: 1px solid rgba(42,92,69,0.3);
    border-radius: 100px; font-size: 11px; color: #6DBF99;
    font-weight: 400; letter-spacing: 0.02em; margin-bottom: 36px;
  }
  .lp-badge-dot {
    width: 6px; height: 6px; background: #4CAF7D; border-radius: 50%;
    animation: lpBlink 2.5s ease infinite;
  }
  @keyframes lpBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .lp-h1 {
    font-family: var(--serif); font-size: clamp(48px,6.5vw,84px);
    font-weight: 400; line-height: 1.05; color: var(--text-on-dark);
    letter-spacing: -1.5px; margin-bottom: 24px;
  }
  .lp-h1 em { font-style: italic; color: #6DBF99; }
  .lp-hero-p {
    font-size: 15px; color: var(--muted-on-dark);
    line-height: 1.75; font-weight: 300; max-width: 480px;
    margin: 0 auto 44px; letter-spacing: 0.01em;
  }
  .lp-hero-actions {
    display: flex; align-items: center; justify-content: center;
    gap: 12px; margin-bottom: 72px;
  }
  .lp-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 28px; background: var(--green); color: white;
    border: 1px solid var(--green-2); border-radius: 9px; text-decoration: none;
    font-family: var(--mono); font-size: 13px; font-weight: 500;
    letter-spacing: 0.01em; transition: all 0.18s; cursor: pointer;
  }
  .lp-btn-primary:hover {
    background: var(--green-2);
    box-shadow: 0 0 40px var(--green-glow), 0 8px 24px rgba(0,0,0,0.4);
    transform: translateY(-1px);
  }
  .lp-btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 24px; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; text-decoration: none;
    font-family: var(--mono); font-size: 13px; color: var(--muted-on-dark);
    font-weight: 400; transition: all 0.18s; cursor: pointer; letter-spacing: 0.01em;
  }
  .lp-btn-secondary:hover { background: rgba(255,255,255,0.08); color: var(--text-on-dark); border-color: rgba(255,255,255,0.18); }

  /* ── PRODUCT WINDOW ── */
  .lp-window-wrap {
    position: relative; z-index: 2;
    width: 100%; max-width: 900px; margin: 0 auto;
  }
  .lp-window-wrap::before {
    content: '';
    position: absolute; bottom: -60px; left: 50%; transform: translateX(-50%);
    width: 70%; height: 120px;
    background: radial-gradient(ellipse, rgba(42,92,69,0.28) 0%, transparent 70%);
    pointer-events: none;
  }
  .lp-window {
    background: #141414; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; overflow: hidden;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5);
  }
  .lp-wbar {
    background: #1A1A1A; padding: 12px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; gap: 12px;
  }
  .wdot { width:10px; height:10px; border-radius:50%; }
  .wd-r{background:#FF5F57} .wd-y{background:#FEBC2E} .wd-g{background:#28C840}
  .lp-wurl {
    flex:1; max-width:280px; margin:0 auto;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius:5px; padding:4px 12px; font-size:10px;
    color: rgba(255,255,255,0.25); text-align:center; letter-spacing:0.02em;
  }
  .lp-wbody {
    padding: 24px 28px 28px;
    display: grid; grid-template-columns: 1fr 200px; gap: 20px;
  }
  .lp-wnav {
    grid-column: 1/-1; display:flex; align-items:center;
    justify-content:space-between; margin-bottom:4px;
  }
  .lp-wnav-logo { font-family:var(--mono); font-size:13px; font-weight:500; color:rgba(255,255,255,0.8); }
  .lp-wnav-logo span { color:#6DBF99; font-family:var(--serif); font-style:italic; font-size:14px; }
  .lp-wtabs { display:flex; gap:2px; }
  .lp-wtab { font-size:9px; letter-spacing:0.06em; padding:4px 10px; border-radius:4px; color:rgba(255,255,255,0.3); font-weight:400; }
  .lp-wtab.on { color:#6DBF99; background:rgba(42,92,69,0.2); }
  .lp-wstats {
    grid-column: 1/-1; display:grid; grid-template-columns:repeat(3,1fr);
    gap:8px; margin-bottom:4px;
  }
  .lp-wstat {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
    border-radius:8px; padding:14px 16px;
  }
  .lp-wstat-lbl { font-size:8px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.25); margin-bottom:6px; }
  .lp-wstat-val { font-family:var(--serif); font-size:28px; color:rgba(255,255,255,0.85); line-height:1; margin-bottom:3px; }
  .lp-wstat-delta { font-size:9px; color:#6DBF99; }
  .lp-wlinks { display:flex; flex-direction:column; gap:0; }
  .lp-wlink {
    display:flex; align-items:center; justify-content:space-between;
    padding:11px 0; border-bottom:1px solid rgba(255,255,255,0.05);
  }
  .lp-wlink:last-child { border-bottom:none; }
  .lp-wlink-name { font-family:var(--serif); font-size:13px; color:rgba(255,255,255,0.75); font-style:italic; margin-bottom:2px; }
  .lp-wlink-slug {
    display:inline-flex; align-items:center; gap:4px;
    font-size:9px; color:#6DBF99; background:rgba(42,92,69,0.15);
    padding:2px 7px; border-radius:3px; letter-spacing:0.04em;
  }
  .lp-wlink-clicks { font-family:var(--serif); font-size:22px; color:rgba(255,255,255,0.7); text-align:right; line-height:1; }
  .lp-wlink-clicks span { display:block; font-family:var(--mono); font-size:8px; color:rgba(255,255,255,0.25); text-transform:uppercase; letter-spacing:0.08em; margin-top:2px; }
  .lp-wchart-lbl { font-size:8px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.25); margin-bottom:10px; }
  .lp-wchart { display:flex; align-items:flex-end; gap:3px; height:56px; }
  .wcbar { flex:1; border-radius:2px 2px 0 0; min-height:3px; background:rgba(255,255,255,0.08); }
  .wcbar-hi{background:#2A5C45} .wcbar-mid{background:rgba(42,92,69,0.5)}

  /* Toast */
  .lp-toast {
    position:absolute; bottom:28px; right:28px;
    background:#1C1C1C; border:1px solid rgba(255,255,255,0.1);
    border-radius:10px; padding:10px 14px;
    display:flex; align-items:center; gap:10px;
    box-shadow:0 8px 32px rgba(0,0,0,0.6);
    transform:translateY(20px); opacity:0;
    transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);
    pointer-events:none; min-width:220px;
  }
  .lp-toast.show { transform:none; opacity:1; }
  .lp-toast-dot { width:8px; height:8px; background:#4CAF7D; border-radius:50%; flex-shrink:0; animation:lpBlink 1.5s ease infinite; }
  .lp-toast-text { font-size:11px; color:rgba(255,255,255,0.7); }
  .lp-toast-text strong { display:block; color:rgba(255,255,255,0.9); font-size:12px; }
  .lp-toast-flag { font-size:16px; flex-shrink:0; }

  /* Hero fade */
  .lp-hero-fade {
    position:absolute; bottom:0; left:0; right:0; height:180px;
    background:linear-gradient(transparent, var(--light-bg));
    pointer-events:none; z-index:3;
  }

  /* ── FEATURES ── */
  .lp-section { padding: 100px 40px; }
  .lp-section-inner { max-width: 1100px; margin: 0 auto; }
  .lp-label { font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--green); font-weight:500; margin-bottom:16px; }
  .lp-h2 {
    font-family:var(--serif); font-size:clamp(36px,4.5vw,56px);
    font-weight:400; line-height:1.1; letter-spacing:-1px;
    color:var(--text); margin-bottom:16px;
  }
  .lp-h2 em { font-style:italic; color:var(--green); }
  .lp-section-sub { font-size:14px; color:var(--muted); line-height:1.75; font-weight:300; max-width:440px; margin-bottom:64px; }
  .lp-features-grid {
    display:grid; grid-template-columns:repeat(3,1fr);
    gap:1px; background:var(--border-light);
    border:1px solid var(--border-light); border-radius:14px; overflow:hidden;
  }
  .lp-feat {
    background:var(--light-2); padding:36px 32px;
    transition:background 0.18s; position:relative;
  }
  .lp-feat:hover { background:#FAFAF7; }
  .lp-feat-icon {
    width:40px; height:40px; background:var(--green-subtle);
    border-radius:10px; display:flex; align-items:center; justify-content:center;
    margin-bottom:20px; transition:transform 0.18s;
  }
  .lp-feat:hover .lp-feat-icon { transform:scale(1.08); }
  .lp-feat-name { font-family:var(--serif); font-size:18px; font-weight:400; margin-bottom:10px; letter-spacing:-0.2px; line-height:1.2; }
  .lp-feat-desc { font-size:12px; color:var(--muted); line-height:1.75; font-weight:300; }

  /* ── HOW IT WORKS ── */
  .lp-how { padding:100px 40px; background:var(--light-2); border-top:1px solid var(--border-light); }
  .lp-how-inner { max-width:1100px; margin:0 auto; }
  .lp-how-steps {
    display:grid; grid-template-columns:repeat(3,1fr);
    gap:0; position:relative; margin-top:64px;
  }
  .lp-how-steps::before {
    content:''; position:absolute;
    top:28px; left:calc(16.67% + 20px); right:calc(16.67% + 20px);
    height:1px; background:var(--border-light); z-index:0;
  }
  .lp-how-step { padding:0 32px; position:relative; border-right:1px solid var(--border-light); }
  .lp-how-step:first-child { padding-left:0; }
  .lp-how-step:last-child { border-right:none; padding-right:0; }
  .lp-how-num {
    width:56px; height:56px; background:var(--light-2);
    border:1px solid var(--border-light); border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-family:var(--serif); font-size:20px; font-style:italic;
    color:var(--green); margin-bottom:28px; position:relative; z-index:1;
    transition:all 0.18s;
  }
  .lp-how-step:hover .lp-how-num { background:var(--green); color:white; border-color:var(--green); box-shadow:0 0 24px var(--green-glow); }
  .lp-how-title { font-family:var(--serif); font-size:20px; font-weight:400; letter-spacing:-0.2px; margin-bottom:12px; }
  .lp-how-desc { font-size:12px; color:var(--muted); line-height:1.75; font-weight:300; }

  /* ── CTA ── */
  .lp-cta { background:var(--dark); padding:120px 40px; text-align:center; position:relative; overflow:hidden; }
  .lp-cta-glow {
    position:absolute; top:-200px; left:50%; transform:translateX(-50%);
    width:800px; height:500px;
    background:radial-gradient(ellipse, rgba(42,92,69,0.22) 0%, transparent 70%);
    pointer-events:none;
  }
  .lp-cta-content { position:relative; z-index:1; max-width:600px; margin:0 auto; }
  .lp-cta-h2 {
    font-family:var(--serif); font-size:clamp(40px,5vw,64px);
    font-weight:400; color:var(--text-on-dark); line-height:1.08;
    letter-spacing:-1.5px; margin-bottom:16px;
  }
  .lp-cta-h2 em { font-style:italic; color:#6DBF99; }
  .lp-cta-p { font-size:14px; color:var(--muted-on-dark); line-height:1.7; font-weight:300; margin-bottom:40px; }
  .lp-cta-form {
    display:flex; gap:0; max-width:420px; margin:0 auto 16px;
    border:1px solid rgba(255,255,255,0.12); border-radius:10px;
    overflow:hidden; background:rgba(255,255,255,0.04);
    transition:border-color 0.2s, box-shadow 0.2s;
  }
  .lp-cta-form:focus-within { border-color:rgba(42,92,69,0.5); box-shadow:0 0 0 3px rgba(42,92,69,0.15); }
  .lp-cta-input {
    flex:1; padding:13px 18px; background:transparent; border:none; outline:none;
    font-family:var(--mono); font-size:13px; color:var(--text-on-dark); font-weight:300;
  }
  .lp-cta-input::placeholder { color:rgba(255,255,255,0.2); }
  .lp-cta-submit {
    padding:13px 22px; background:var(--green); color:white;
    border:none; border-left:1px solid rgba(255,255,255,0.1);
    font-family:var(--mono); font-size:12px; font-weight:500;
    cursor:pointer; transition:background 0.15s; white-space:nowrap;
  }
  .lp-cta-submit:hover { background:var(--green-2); }
  .lp-cta-fine { font-size:11px; color:rgba(255,255,255,0.2); font-weight:300; letter-spacing:0.02em; }

  /* ── FOOTER ── */
  .lp-footer {
    background:var(--dark); border-top:1px solid rgba(255,255,255,0.06);
    padding:32px 40px; display:flex; align-items:center; justify-content:space-between;
  }
  .lp-footer-logo { font-family:var(--mono); font-size:14px; font-weight:500; color:rgba(255,255,255,0.4); text-decoration:none; }
  .lp-footer-logo span { font-family:var(--serif); font-style:italic; color:#6DBF99; }
  .lp-footer-links { display:flex; gap:24px; list-style:none; }
  .lp-footer-links a { font-size:11px; color:rgba(255,255,255,0.25); text-decoration:none; transition:color 0.15s; font-weight:300; }
  .lp-footer-links a:hover { color:rgba(255,255,255,0.55); }
  .lp-footer-copy { font-size:11px; color:rgba(255,255,255,0.2); font-weight:300; }

  /* ── FADE UP ── */
  .lp-fade { opacity:0; transform:translateY(20px); transition:opacity 0.6s ease, transform 0.6s ease; }
  .lp-fade.d1 { transition-delay:0.1s; } .lp-fade.d2{transition-delay:0.2s;} .lp-fade.d3{transition-delay:0.3s;}
  .lp-fade.visible { opacity:1; transform:none; }

  /* ── RESPONSIVE ── */
  @media(max-width:900px){
    .lp-nav-center{display:none;}
    .lp-wbody{grid-template-columns:1fr;}
    .lp-features-grid{grid-template-columns:1fr 1fr;}
    .lp-how-steps{grid-template-columns:1fr;gap:40px;}
    .lp-how-steps::before{display:none;}
    .lp-how-step{border-right:none;padding:0;}
    .lp-footer{flex-direction:column;gap:20px;align-items:flex-start;}
  }
  @media(max-width:600px){
    .lp-nav,.lp-hero{padding-left:20px;padding-right:20px;}
    .lp-hero-content{padding-top:120px;}
    .lp-section,.lp-how,.lp-cta{padding:72px 20px;}
    .lp-features-grid{grid-template-columns:1fr;}
    .lp-hero-actions{flex-direction:column;align-items:center;}
    .lp-footer{padding:28px 20px;}
  }
`;

const CHART_HEIGHTS = [22, 38, 18, 55, 32, 70, 48, 85, 38, 64, 50, 90, 58, 100];

const TOAST_DATA = [
  { name: "Resume — Feb 2026", detail: "opened · India · just now", flag: "🇮🇳" },
  { name: "Portfolio site", detail: "clicked · USA · just now", flag: "🇺🇸" },
  { name: "Design proposal", detail: "viewed · Germany · just now", flag: "🇩🇪" },
  { name: "Job application", detail: "opened · UK · just now", flag: "🇬🇧" },
  { name: "Case study deck", detail: "clicked · Singapore · just now", flag: "🇸🇬" },
  { name: "Portfolio site", detail: "viewed · France · just now", flag: "🇫🇷" },
  { name: "Resume — Feb 2026", detail: "opened · Canada · just now", flag: "🇨🇦" },
];

export default function LandingPage() {
  const [displayCount, setDisplayCount] = useState("0");
  const [toast, setToast] = useState<typeof TOAST_DATA[0] | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [ctaSubmitted, setCtaSubmitted] = useState(false);
  const [ctaEmail, setCtaEmail] = useState("");

  // Animated counter on mount
  useEffect(() => {
    const target = 1247842;
    const dur = 1600;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayCount(Math.round(target * ease).toLocaleString());
      if (p < 1) requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => requestAnimationFrame(tick), 600);
    return () => clearTimeout(timer);
  }, []);

  // Live counter increment
  useEffect(() => {
    const iv = setInterval(() => {
      setDisplayCount(c => {
        const next = parseInt(c.replace(/,/g, "")) + Math.floor(Math.random() * 3) + 1;
        return next.toLocaleString();
      });
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  // Floating toast
  useEffect(() => {
    let idx = 0;
    const showToast = () => {
      const t = TOAST_DATA[idx % TOAST_DATA.length];
      idx++;
      setToast(t);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3200);
    };
    const t1 = setTimeout(showToast, 2000);
    const iv = setInterval(showToast, 5500);
    return () => { clearTimeout(t1); clearInterval(iv); };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -24px 0px" });
    document.querySelectorAll(".lp-fade").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function handleCta() {
    if (ctaEmail.includes("@")) {
      setCtaSubmitted(true);
    }
  }

  return (
    <div className="lp-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-badge">
            <div className="lp-badge-dot" />
            <span>{displayCount} clicks tracked live</span>
          </div>

          <h1 className="lp-h1">
            You sent it.<br />
            Now know who<br />
            <em>opened it.</em>
          </h1>

          <p className="lp-hero-p">
            Turn any URL into a trackable link in seconds. See every click — who, where, what device — the moment it happens.
          </p>

          <div className="lp-hero-actions">
            <Link href="/sign-up" className="lp-btn-primary">
              Get started free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a href="#how" className="lp-btn-secondary">See how it works</a>
          </div>
        </div>

        {/* Product window */}
        <div className="lp-window-wrap">
          <div className="lp-window">
            <div className="lp-wbar">
              <div className="wdot wd-r" /><div className="wdot wd-y" /><div className="wdot wd-g" />
              <div className="lp-wurl">app.linktrack.io/dashboard</div>
            </div>
            <div className="lp-wbody">
              <div className="lp-wnav">
                <span className="lp-wnav-logo">link<span>track</span></span>
                <div className="lp-wtabs">
                  <span className="lp-wtab on">Dashboard</span>
                  <span className="lp-wtab">Analytics</span>
                </div>
              </div>
              <div className="lp-wstats">
                {[{ lbl: "Total links", val: "3", d: "3 active" }, { lbl: "Total clicks", val: "142", d: "↑ all time" }, { lbl: "Clicks today", val: "12", d: "↑ 12 today" }].map(s => (
                  <div key={s.lbl} className="lp-wstat">
                    <div className="lp-wstat-lbl">{s.lbl}</div>
                    <div className="lp-wstat-val">{s.val}</div>
                    <div className="lp-wstat-delta">{s.d}</div>
                  </div>
                ))}
              </div>
              <div className="lp-wlinks">
                {[{ name: "Resume — Feb 2026", slug: "lnk.to/r4b2", clicks: 87 }, { name: "Portfolio site", slug: "lnk.to/pf9x", clicks: 41 }, { name: "Design proposal Q1", slug: "lnk.to/dp1m", clicks: 14 }].map(l => (
                  <div key={l.slug} className="lp-wlink">
                    <div>
                      <div className="lp-wlink-name">{l.name}</div>
                      <div className="lp-wlink-slug">{l.slug}</div>
                    </div>
                    <div className="lp-wlink-clicks">{l.clicks}<span>clicks</span></div>
                  </div>
                ))}
              </div>
              <div>
                <div className="lp-wchart-lbl">Clicks · last 14 days</div>
                <div className="lp-wchart">
                  {CHART_HEIGHTS.map((h, i) => (
                    <div key={i} className={`wcbar${i === CHART_HEIGHTS.length - 1 ? " wcbar-hi" : i % 2 === 0 ? "" : " wcbar-mid"}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating toast */}
            <div className={`lp-toast${toastVisible ? " show" : ""}`}>
              <div className="lp-toast-dot" />
              <div className="lp-toast-text">
                <strong>{toast?.name}</strong>
                <span>{toast?.detail}</span>
              </div>
              <span className="lp-toast-flag">{toast?.flag}</span>
            </div>
          </div>
        </div>

        <div className="lp-hero-fade" />
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-section" id="features">
        <div className="lp-section-inner">
          <div className="lp-label lp-fade">Features</div>
          <h2 className="lp-h2 lp-fade d1">Everything you need to<br />track links <em>intelligently.</em></h2>
          <p className="lp-section-sub lp-fade d2">Built for the person who sends things — resumes, proposals, decks, portfolios — and needs to know what happens next.</p>

          <div className="lp-features-grid">
            {[
              { icon: <path d="M9 2v14M2 9h14" stroke="#2A5C45" strokeWidth="1.5" strokeLinecap="round" />, name: "Instant short links", desc: "Paste any URL — Google Docs, Notion, PDFs, portfolios. Get a clean trackable link in one second.", delay: "" },
              { icon: <path d="M2 13l4-4 3 3 4-5 3 3" stroke="#2A5C45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />, name: "Real-time analytics", desc: "Watch clicks arrive as they happen. Timestamp, referrer, device, country — every detail, immediately.", delay: "d1" },
              { icon: <><circle cx="9" cy="8" r="4" stroke="#2A5C45" strokeWidth="1.5" /><path d="M3 15c0-2.5 2.7-4.5 6-4.5s6 2 6 4.5" stroke="#2A5C45" strokeWidth="1.5" strokeLinecap="round" /></>, name: "Unique visitors", desc: "Distinguish between one person opening your resume six times vs. six different people opening it once.", delay: "d2" },
              { icon: <><circle cx="9" cy="9" r="7" stroke="#2A5C45" strokeWidth="1.5" /><path d="M9 2c-2.5 2-4 4-4 7s1.5 5 4 7M9 2c2.5 2 4 4 4 7s-1.5 5-4 7M2 9h14" stroke="#2A5C45" strokeWidth="1.5" strokeLinecap="round" /></>, name: "Geography & source", desc: "See which country and platform — LinkedIn, email, WhatsApp, direct — each click originated from.", delay: "" },
              { icon: <path d="M2 4h14v11H2zM6 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 9h6M6 12h4" stroke="#2A5C45" strokeWidth="1.5" strokeLinecap="round" />, name: "Named link library", desc: "Label every link — \"Resume v4\", \"Acme proposal\" — so your dashboard stays readable at a glance.", delay: "d1" },
              { icon: <><path d="M3 9a6 6 0 1012 0A6 6 0 003 9z" stroke="#2A5C45" strokeWidth="1.5" /><path d="M9 6v3l2 2" stroke="#2A5C45" strokeWidth="1.5" strokeLinecap="round" /></>, name: "Zero setup, always", desc: "No SDK. No tracking pixel. No DNS changes. If you can paste a URL, you can use linktrack. Start in 10 seconds.", delay: "d2" },
            ].map((f, i) => (
              <div key={i} className={`lp-feat lp-fade ${f.delay}`}>
                <div className="lp-feat-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">{f.icon}</svg>
                </div>
                <div className="lp-feat-name">{f.name}</div>
                <div className="lp-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-how" id="how">
        <div className="lp-how-inner">
          <div className="lp-label lp-fade">How it works</div>
          <h2 className="lp-h2 lp-fade d1">From paste to insight<br />in <em>under a minute.</em></h2>
          <div className="lp-how-steps">
            {[
              { n: "1", title: "Paste your URL", desc: "Any URL — Google Doc, PDF, Notion, Figma, portfolio. Paste it in and give it a name so you remember it.", d: "" },
              { n: "2", title: "Share your link", desc: "Copy the clean short link we generate. Paste it in an email, LinkedIn message, WhatsApp — anywhere you'd normally share a link.", d: "d1" },
              { n: "3", title: "See who clicks", desc: "The moment someone opens your link, you'll see it. Time, country, device, referrer. Everything, instantly.", d: "d2" },
            ].map(s => (
              <div key={s.n} className={`lp-how-step lp-fade ${s.d}`}>
                <div className="lp-how-num">{s.n}</div>
                <div className="lp-how-title">{s.title}</div>
                <div className="lp-how-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta" id="start">
        <div className="lp-cta-glow" />
        <div className="lp-cta-content">
          <h2 className="lp-cta-h2 lp-fade">Stop wondering<br />who <em>clicked.</em></h2>
          <p className="lp-cta-p lp-fade d1">Free forever. No credit card. Your first trackable link in under 30 seconds.</p>
          <div className="lp-cta-form lp-fade d2">
            {ctaSubmitted ? (
              <input className="lp-cta-input" readOnly value="✓ You're on the list — check your inbox." style={{ color: "#6DBF99" }} />
            ) : (
              <>
                <input
                  className="lp-cta-input"
                  type="email"
                  placeholder="you@example.com"
                  value={ctaEmail}
                  onChange={e => setCtaEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCta()}
                />
                <button className="lp-cta-submit" onClick={handleCta}>
                  Get started free →
                </button>
              </>
            )}
          </div>
          <div className="lp-cta-fine lp-fade d2">Free plan · No card required</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <a className="lp-footer-logo" href="#">link<span>track</span></a>
        <ul className="lp-footer-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
        </ul>
        <div className="lp-footer-copy">© 2026 linktrack</div>
      </footer>
    </div>
  );
}
