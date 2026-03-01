export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import DashboardClient from "./dashboard-client";


export default async function DashboardPage() {
    const { userId } = await auth()

    if (!userId) return null;

    const links = await prisma.link.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { clickEvents: true },
            },
        },
    })

    // today's clicks across all user links
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayClicks = await prisma.clickEvent.count({
        where: {
            link: { userId },
            createdAt: { gte: todayStart },
        },
    });

    const totalClicks = links.reduce(
        (acc, l) => acc + (l._count?.clickEvents ?? 0),
        0
    );

    return (
        <DashboardClient
            initialLinks={links}
            totalClicks={totalClicks}
            todayClicks={todayClicks}
        />
    );
}