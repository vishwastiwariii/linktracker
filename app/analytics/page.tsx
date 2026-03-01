export const runtime = "nodejs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AnalyticsClient from "./analytics-client";

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ link?: string }>;
}) {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const links = await prisma.link.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { clickEvents: true } },
        },
    });

    const { link: initialLinkId } = await searchParams;

    return (
        <AnalyticsClient
            links={links}
            initialLinkId={initialLinkId ?? null}
        />
    );
}
