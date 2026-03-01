"use server";

import { prisma } from "@/lib/prisma";

export async function getLinkAnalytics(linkId: string) {
    const now = new Date();

    // ── total clicks ──────────────────────────────
    const totalClicks = await prisma.clickEvent.count({ where: { linkId } });

    // ── unique visitors ───────────────────────────
    const uniqueGroups = await prisma.clickEvent.groupBy({
        by: ["ipHash"],
        where: { linkId },
    });
    const uniqueVisitors = uniqueGroups.length;

    // ── clicks today ──────────────────────────────
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayClicks = await prisma.clickEvent.count({
        where: { linkId, createdAt: { gte: todayStart } },
    });

    // ── per-day click counts (30 days) ────────────
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const allRecent = await prisma.clickEvent.findMany({
        where: { linkId, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, country: true, browser: true, device: true },
        orderBy: { createdAt: "desc" },
    });

    // Build day-bucket arrays for 7, 14, 30 days
    function buildChart(days: number) {
        const buckets = Array(days).fill(0);
        for (const ev of allRecent) {
            const daysAgo = Math.floor(
                (now.getTime() - ev.createdAt.getTime()) / 86400000
            );
            if (daysAgo < days) buckets[days - 1 - daysAgo]++;
        }
        return buckets;
    }

    const chart7 = buildChart(7);
    const chart14 = buildChart(14);
    const chart30 = buildChart(30);

    // ── device breakdown ──────────────────────────
    const deviceMap: Record<string, number> = {};
    for (const ev of allRecent) {
        const key = ev.device ?? "UNKNOWN";
        deviceMap[key] = (deviceMap[key] ?? 0) + 1;
    }
    const total = allRecent.length || 1;
    const devices = Object.entries(deviceMap)
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({
            label: label.charAt(0) + label.slice(1).toLowerCase(),
            pct: Math.round((count / total) * 100),
            icon: label === "MOBILE" ? "📱" : label === "TABLET" ? "📟" : "💻",
        }));

    // ── browser breakdown ─────────────────────────
    const browserMap: Record<string, number> = {};
    for (const ev of allRecent) {
        const key = ev.browser ?? "Unknown";
        browserMap[key] = (browserMap[key] ?? 0) + 1;
    }
    const browsers = Object.entries(browserMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([label, count]) => ({
            label,
            pct: Math.round((count / total) * 100),
        }));

    // ── recent clicks (last 20) ───────────────────
    const recentRaw = await prisma.clickEvent.findMany({
        where: { linkId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { country: true, browser: true, device: true, createdAt: true },
    });

    function timeAgo(d: Date) {
        const secs = Math.round((Date.now() - d.getTime()) / 1000);
        if (secs < 60) return `${secs}s ago`;
        const mins = Math.round(secs / 60);
        if (mins < 60) return `${mins} min ago`;
        const hrs = Math.round(mins / 60);
        if (hrs < 24) return `${hrs} hr ago`;
        return `${Math.round(hrs / 24)}d ago`;
    }

    const recentClicks = recentRaw.map((ev) => ({
        ref: ev.browser ?? "Direct",
        refType: ev.browser ? "browser" : "direct",
        country: ev.country ?? "Unknown",
        time: timeAgo(ev.createdAt),
    }));

    return {
        totalClicks,
        uniqueVisitors,
        todayClicks,
        chart7,
        chart14,
        chart30,
        devices,
        browsers,
        recentClicks,
    };
}
