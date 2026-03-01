import { prisma } from "@/lib/prisma";
import { getLinkStats } from "@/app/actions/getLinkStats";
import { notFound } from "next/navigation";

export default async function LinkAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) {
    return notFound();
  }

  const link = await prisma.link.findUnique({
    where: { id },
  });

  if (!link) return notFound();

  const stats = await getLinkStats(link.id);

  return (
    <div>
      <h1>Analytics</h1>
      <p>Total Clicks: {stats.totalClicks}</p>
      <p>Unique Visitors: {stats.uniqueVisitors}</p>
    </div>
  );
}