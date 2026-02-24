import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LinksClient from "./links-client";

export default async function LinksPage() {
    const user = await requireAuth();

    const links = await prisma.link.findMany({
        where: { userId: user.clerkUserId },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { clickEvents: true },
            },
        },
    });

    // today's clicks across all user links
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayClicks = await prisma.clickEvent.count({
        where: {
            link: { userId: user.clerkUserId },
            createdAt: { gte: todayStart },
        },
    });

    const totalClicks = links.reduce(
        (acc, l) => acc + (l._count?.clickEvents ?? 0),
        0
    );

    return (
        <LinksClient
            initialLinks={links}
            totalClicks={totalClicks}
            todayClicks={todayClicks}
        />
    );
}