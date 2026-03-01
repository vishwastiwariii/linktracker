"use client";

import { useState, useTransition, useCallback } from "react";
import { createLink } from "@/app/actions/createLink";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/* ─────────────────────────── types ─────────────────────────── */

type ClickEvent = { id: string; createdAt: Date };

type Link = {
    id: string;
    slug: string;
    originalUrl: string;
    url: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    clickEvents?: ClickEvent[];
    _count?: { clickEvents: number };
};

type LinksClientProps = {
    initialLinks: Link[];
    totalClicks?: number;
    todayClicks?: number;
};

/* ─────────────────────── helper: display name ─────────────────────── */

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

/* ─────────────────────── copy-toast hook ─────────────────────── */

function useCopyToast() {
    const [copied, setCopied] = useState<string | null>(null);
    const copy = useCallback((text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    }, []);
    return { copied, copy };
}

/* ═══════════════════════ COMPONENT ═══════════════════════ */

export default function LinksClient({
    initialLinks,
    totalClicks = 0,
    todayClicks = 0,
}: LinksClientProps) {
    const [links, setLinks] = useState(initialLinks ?? []);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const { copied, copy } = useCopyToast();

    function onSubmit(formData: FormData) {
        setError("");
        startTransition(async () => {
            try {
                const url = formData.get("originalUrl") as string;
                const name = (formData.get("name") as string)?.trim();
                if (!name) { setError("Link name is required"); return; }
                const newLink = await createLink(url, name);
                setLinks((prev) => [newLink, ...prev]);
            } catch (err: any) {
                setError(err.message || "Something went wrong");
            }
        });
    }

    const computedTotalClicks =
        totalClicks || links.reduce((acc, l) => acc + (l._count?.clickEvents ?? 0), 0);

    /* ─── design tokens ─── */
    const bg = "#f7f5f0";
    const border = "#e5e2da";
    const muted = "#888680";
    const ink = "#1a1916";
    const accent = "#8c4a2f"; /* warm burnt umber — pairs with cream */
    const serif = "var(--font-playfair), Georgia, 'Times New Roman', serif";
    const mono = "var(--font-jetbrains), 'Courier New', monospace";

    return (
        <div style={{ background: bg, minHeight: "100vh" }}>

            {/* ══════════════════════════════════════════════════
                HERO SECTION
            ══════════════════════════════════════════════════ */}
            <div style={{ borderBottom: `1px solid ${border}` }}>
                <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 48px 72px" }}>

                    {/* Eyebrow */}
                    <p style={{
                        fontFamily: mono,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        color: muted,
                        textTransform: "uppercase",
                        marginBottom: 24,
                    }}>
                        Link Intelligence
                    </p>

                    {/* Headline */}
                    <h1 style={{
                        fontFamily: serif,
                        fontSize: "clamp(2.6rem, 6vw, 4.2rem)",
                        fontWeight: 400,
                        lineHeight: 1.1,
                        color: ink,
                        margin: 0,
                    }}>
                        Know who clicks,
                        <br />
                        <em style={{ color: accent, fontStyle: "italic" }}>every time.</em>
                    </h1>

                    {/* Sub-copy */}
                    <p style={{
                        fontFamily: mono,
                        fontSize: "0.85rem",
                        color: muted,
                        lineHeight: 1.75,
                        marginTop: 24,
                        maxWidth: 420,
                    }}>
                        Paste any URL and get a trackable link. See real-time click data,
                        referrers, and geography — without any setup.
                    </p>

                    {/* Decorative accent line */}
                    <div style={{
                        marginTop: 40,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}>
                        <div style={{ width: 48, height: 1, background: accent }} />
                        <span style={{
                            fontFamily: mono,
                            fontSize: "0.7rem",
                            letterSpacing: "0.12em",
                            color: accent,
                            textTransform: "uppercase",
                        }}>
                            Real-time · No setup · Private
                        </span>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                TWO-COLUMN PANEL
            ══════════════════════════════════════════════════ */}
            <div style={{ display: "flex", minHeight: "calc(100vh - 260px)" }}>

                {/* ── LEFT: Links list ── */}
                <div style={{ flex: 1, borderRight: `1px solid ${border}` }}>

                    {/* Section header */}
                    <div style={{
                        padding: "28px 48px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                        <span style={{
                            fontFamily: mono,
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            letterSpacing: "0.18em",
                            color: muted,
                            textTransform: "uppercase",
                        }}>
                            Your Links
                        </span>
                        <span style={{
                            fontFamily: serif,
                            fontSize: "0.9rem",
                            fontStyle: "italic",
                            color: muted,
                        }}>
                            {links.length} {links.length === 1 ? "link" : "links"}
                        </span>
                    </div>

                    <Separator style={{ background: border }} />

                    {/* Empty state */}
                    {links.length === 0 ? (
                        <div style={{ padding: "80px 48px", textAlign: "center" }}>
                            <p style={{ fontFamily: serif, fontSize: "1.1rem", color: muted, fontStyle: "italic" }}>
                                No links yet
                            </p>
                            <p style={{ fontFamily: mono, fontSize: "0.78rem", color: muted, marginTop: 8 }}>
                                Create your first tracked link to start counting clicks.
                            </p>
                        </div>
                    ) : (
                        links.map((link) => {
                            const shortLink = `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${link.slug}`;
                            const fullShort = `http://${shortLink}`;
                            const clickCount = link._count?.clickEvents ?? 0;
                            const name = deriveName(link.originalUrl);
                            const isCopied = copied === link.id;

                            return (
                                <div key={link.id}>
                                    <div
                                        style={{
                                            padding: "24px 48px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 24,
                                            transition: "background 0.15s",
                                            cursor: "default",
                                        }}
                                        onMouseEnter={(e) =>
                                            ((e.currentTarget as HTMLElement).style.background = "#f0ede6")
                                        }
                                        onMouseLeave={(e) =>
                                            ((e.currentTarget as HTMLElement).style.background = "transparent")
                                        }
                                    >
                                        {/* Left: name, original URL, pill */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                fontFamily: serif,
                                                fontSize: "1.05rem",
                                                fontWeight: 600,
                                                color: ink,
                                                margin: 0,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}>
                                                {name}
                                            </p>
                                            <p style={{
                                                fontFamily: mono,
                                                fontSize: "0.72rem",
                                                color: muted,
                                                marginTop: 4,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}>
                                                {link.originalUrl}
                                            </p>

                                            {/* Short-link pill — click to copy */}
                                            <button
                                                onClick={() => copy(fullShort, link.id)}
                                                style={{
                                                    marginTop: 8,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    padding: "3px 10px",
                                                    borderRadius: 999,
                                                    background: isCopied ? "#8c4a2f22" : "#e9e6e0",
                                                    border: `1px solid ${isCopied ? accent : "transparent"}`,
                                                    color: isCopied ? accent : "#3d3b36",
                                                    fontFamily: mono,
                                                    fontSize: "0.7rem",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s",
                                                }}
                                                title="Click to copy"
                                            >
                                                <span style={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "50%",
                                                    background: isCopied ? accent : muted,
                                                    flexShrink: 0,
                                                    transition: "background 0.2s",
                                                }} />
                                                {isCopied ? "Copied!" : shortLink}
                                            </button>
                                        </div>

                                        {/* Right: click count */}
                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                            <p style={{
                                                fontFamily: serif,
                                                fontSize: "2.4rem",
                                                fontWeight: 700,
                                                color: ink,
                                                lineHeight: 1,
                                                margin: 0,
                                            }}>
                                                {clickCount}
                                            </p>
                                            <p style={{
                                                fontFamily: mono,
                                                fontSize: "0.65rem",
                                                fontWeight: 700,
                                                letterSpacing: "0.15em",
                                                color: muted,
                                                textTransform: "uppercase",
                                                marginTop: 4,
                                            }}>
                                                Clicks
                                            </p>
                                        </div>
                                    </div>
                                    <Separator style={{ background: border }} />
                                </div>
                            );
                        })
                    )}
                </div>

                {/* ── RIGHT: Create a link ── */}
                <div style={{
                    width: 360,
                    flexShrink: 0,
                    padding: "40px 36px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 32,
                    borderLeft: `1px solid ${border}`,
                }}>
                    {/* Heading */}
                    <div>
                        <h2 style={{
                            fontFamily: serif,
                            fontSize: "1.6rem",
                            fontWeight: 400,
                            color: ink,
                            margin: 0,
                        }}>
                            Create a link
                        </h2>
                        <p style={{
                            fontFamily: mono,
                            fontSize: "0.78rem",
                            color: muted,
                            marginTop: 10,
                            lineHeight: 1.7,
                        }}>
                            Paste any URL below. We&apos;ll wrap it in a trackable short link
                            and start counting.
                        </p>
                    </div>

                    {/* Form */}
                    <form action={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Destination URL */}
                        <div>
                            <label style={{
                                fontFamily: mono,
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                letterSpacing: "0.15em",
                                color: muted,
                                textTransform: "uppercase",
                                display: "block",
                                marginBottom: 8,
                            }}>
                                Destination URL
                            </label>
                            <Input
                                name="originalUrl"
                                placeholder="https://example.com"
                                required
                                className="rounded-none border-0 border-b bg-transparent focus-visible:ring-0 px-0"
                                style={{
                                    borderColor: border,
                                    color: ink,
                                    fontFamily: mono,
                                    fontSize: "0.82rem",
                                }}
                            />
                        </div>

                        {/* Link name */}
                        <div>
                            <label style={{
                                fontFamily: mono,
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                letterSpacing: "0.15em",
                                color: muted,
                                textTransform: "uppercase",
                                display: "block",
                                marginBottom: 8,
                            }}>
                                Link Name
                            </label>
                            <Input
                                name="name"
                                placeholder="Resume, portfolio, proposal…"
                                required
                                className="rounded-none border-0 border-b bg-transparent focus-visible:ring-0 px-0"
                                style={{
                                    borderColor: border,
                                    color: ink,
                                    fontFamily: mono,
                                    fontSize: "0.82rem",
                                }}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <p style={{ fontFamily: mono, fontSize: "0.78rem", color: "#c0392b", margin: 0 }}>
                                {error}
                            </p>
                        )}

                        {/* CTA */}
                        <button
                            type="submit"
                            disabled={isPending}
                            style={{
                                background: ink,
                                color: bg,
                                fontFamily: mono,
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                letterSpacing: "0.04em",
                                padding: "14px 20px",
                                border: "none",
                                cursor: isPending ? "not-allowed" : "pointer",
                                opacity: isPending ? 0.6 : 1,
                                transition: "opacity 0.2s",
                                textAlign: "center",
                            }}
                        >
                            {isPending ? "Creating link…" : "Create trackable link →"}
                        </button>
                    </form>

                    {/* Stats bar */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        border: `1px solid ${border}`,
                        background: "#f0ede6",
                        marginTop: "auto",
                    }}>
                        {[
                            { label: "LINKS", value: links.length },
                            { label: "CLICKS", value: computedTotalClicks },
                            { label: "TODAY", value: todayClicks },
                        ].map((stat, i) => (
                            <div
                                key={stat.label}
                                style={{
                                    padding: "18px 0",
                                    textAlign: "center",
                                    borderRight: i < 2 ? `1px solid ${border}` : undefined,
                                }}
                            >
                                <p style={{
                                    fontFamily: serif,
                                    fontSize: "1.8rem",
                                    fontWeight: 700,
                                    color: ink,
                                    lineHeight: 1,
                                    margin: 0,
                                }}>
                                    {stat.value}
                                </p>
                                <p style={{
                                    fontFamily: mono,
                                    fontSize: "0.6rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.15em",
                                    color: muted,
                                    textTransform: "uppercase",
                                    marginTop: 6,
                                }}>
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}