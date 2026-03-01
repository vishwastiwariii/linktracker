import { prisma } from "@/lib/prisma";

export async function getLinkStats( linkId: string ){


    const totalClicks = await prisma.clickEvent.count({
        where:{
            linkId: linkId
        }
    })


    const uniqueVisitors = await prisma.clickEvent.groupBy({
        by: ["ipHash"],
        where: { linkId },
    });

    const uniqueCount = uniqueVisitors.length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentClicks = await prisma.clickEvent.findMany({
        where: {
        linkId,
        createdAt: { gte: sevenDaysAgo },
        },
        select: {
        createdAt: true,
        },
    });


    return {
        totalClicks, 
        uniqueVisitors: uniqueCount,
        recentClicks: recentClicks.length
    }
    
}