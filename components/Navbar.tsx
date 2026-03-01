"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
} from "@clerk/nextjs";

const APP_TABS = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Analytics", href: "/analytics" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&family=Instrument+Serif:ital@0;1&display=swap');

  /* ── APP NAV (dashboard / analytics) ── */
  .lt-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 60px;
    border-bottom: 1px solid #E8E4DC;
    background: #F7F5F0;
    position: sticky; top: 0; z-index: 300;
    transition: background 0.3s, border-color 0.3s;
  }

  .lt-logo {
    font-family: 'Fraunces', serif; font-size: 18px; font-weight: 300;
    color: #1A1814; letter-spacing: -0.3px; text-decoration: none; line-height: 1;
  }
  .lt-logo span { color: #2A5C45; font-style: italic; }

  .lt-nav-left { display: flex; align-items: center; gap: 40px; }
  .lt-nav-center { display: flex; gap: 2px; }
  .lt-nav-right { display: flex; align-items: center; gap: 14px; }

  /* App tabs (Dashboard / Analytics) */
  .lt-tabs { display: flex; gap: 2px; list-style: none; margin: 0; padding: 0; }
  .lt-tab-link {
    display: block; font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.08em; text-transform: uppercase; color: #9B9588;
    text-decoration: none; padding: 6px 14px; border-radius: 4px;
    transition: color 0.15s, background 0.15s; font-weight: 400;
  }
  .lt-tab-link:hover { color: #1A1814; background: #E8E4DC; }
  .lt-tab-link.active { color: #2A5C45; background: #EAF2EE; }

  /* Landing-only center links */
  .lt-lp-link {
    font-size: 12px; color: rgba(240,237,232,0.45); text-decoration: none;
    padding: 6px 14px; border-radius: 6px; transition: all 0.15s; font-weight: 400;
  }
  .lt-lp-link:hover { color: #F0EDE8; background: rgba(255,255,255,0.06); }

  /* Date */
  .lt-date { font-family: 'DM Mono', monospace; font-size: 11px; color: #9B9588; font-weight: 300; }

  /* Signed-out buttons — APP style (light) */
  .lt-signin-btn {
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.06em;
    color: #9B9588; background: none; border: 1px solid #E8E4DC;
    border-radius: 5px; padding: 6px 14px; cursor: pointer; transition: all 0.15s; font-weight: 400;
  }
  .lt-signin-btn:hover { color: #1A1814; border-color: #9B9588; }
  .lt-signup-btn {
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.06em;
    color: #F7F5F0; background: #2A5C45; border: none;
    border-radius: 5px; padding: 7px 14px; cursor: pointer; transition: all 0.15s; font-weight: 400;
  }
  .lt-signup-btn:hover { opacity: 0.85; }

  /* ── LANDING NAV overrides ── */
  .lt-nav.lp {
    position: fixed; top: 0; left: 0; right: 0;
    background: transparent; border-color: transparent;
  }
  .lt-nav.lp.solid {
    background: rgba(10,10,10,0.92);
    backdrop-filter: blur(20px);
    border-color: rgba(255,255,255,0.07);
  }

  /* Logo on landing: lighter */
  .lt-nav.lp .lt-logo { color: #F0EDE8; font-family: 'DM Mono', monospace; font-size: 15px; font-weight: 500; }
  .lt-nav.lp .lt-logo span { color: #6DBF99; font-family: 'Instrument Serif', serif; font-style: italic; font-size: 17px; }

  /* Date hidden on landing */
  .lt-nav.lp .lt-date { display: none; }

  /* Signed-out buttons — LANDING style (dark bg) */
  .lt-nav.lp .lt-signin-btn {
    color: rgba(240,237,232,0.5); border-color: rgba(255,255,255,0.12); background: transparent;
  }
  .lt-nav.lp .lt-signin-btn:hover { color: #F0EDE8; border-color: rgba(255,255,255,0.28); }
  .lt-nav.lp .lt-signup-btn {
    background: #2A5C45; color: white; border: 1px solid #336B52;
    border-radius: 7px; padding: 7px 18px; font-size: 12px; font-weight: 500;
  }
  .lt-nav.lp .lt-signup-btn:hover { background: #336B52; box-shadow: 0 0 24px rgba(42,92,69,0.35); }

  @media (max-width: 700px) {
    .lt-nav { padding: 0 20px; }
    .lt-tabs, .lt-nav-center, .lt-date { display: none; }
  }
`;

export default function Navbar() {
    const pathname = usePathname();
    const isLanding = pathname === "/";
    const [solid, setSolid] = useState(false);

    // Scroll-solid effect only on landing page
    useEffect(() => {
        if (!isLanding) return;
        const onScroll = () => setSolid(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [isLanding]);

    // Reset solid state when leaving landing
    useEffect(() => { if (!isLanding) setSolid(false); }, [isLanding]);

    const today = new Date().toLocaleDateString("en", {
        month: "short", day: "numeric", year: "numeric",
    });

    const navClass = `lt-nav${isLanding ? " lp" : ""}${solid ? " solid" : ""}`;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <nav className={navClass}>
                {/* Left: logo */}
                <div className="lt-nav-left">
                    <Link className="lt-logo" href={isLanding ? "/" : "/dashboard"}>
                        link<span>track</span>
                    </Link>

                    {/* App tabs — only when signed in and not on landing */}
                    {!isLanding && (
                        <SignedIn>
                            <ul className="lt-tabs">
                                {APP_TABS.map((tab) => {
                                    const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
                                    return (
                                        <li key={tab.href}>
                                            <Link href={tab.href} className={`lt-tab-link${active ? " active" : ""}`}>
                                                {tab.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </SignedIn>
                    )}
                </div>

                {/* Center: landing-specific section links */}
                {isLanding && (
                    <div className="lt-nav-center">
                        <a href="#features" className="lt-lp-link">Features</a>
                        <a href="#how" className="lt-lp-link">How it works</a>
                    </div>
                )}

                {/* Right: auth */}
                <div className="lt-nav-right">
                    <SignedIn>
                        {!isLanding && <span className="lt-date">{today}</span>}
                        <UserButton appearance={{ elements: { avatarBox: { width: 34, height: 34 } } }} />
                    </SignedIn>

                    <SignedOut>
                        <SignInButton>
                            <button className="lt-signin-btn">
                                {isLanding ? "Log in" : "Sign in"}
                            </button>
                        </SignInButton>
                        <SignUpButton>
                            <button className="lt-signup-btn">
                                {isLanding ? "Start free →" : "Sign up"}
                            </button>
                        </SignUpButton>
                    </SignedOut>
                </div>
            </nav>
        </>
    );
}
