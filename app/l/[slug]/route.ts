import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


function getDeviceType(userAgent: string | null) {
    if (!userAgent) return null;

    const ua = userAgent.toLowerCase();

    if (ua.includes("mobile")) return "MOBILE";
    if (ua.includes("tablet")) return "TABLET";
    if (ua.includes("bot")) return "BOT";

}

function getBrowser(userAgent: string | null) {
    if (!userAgent) return null;

    const ua = userAgent.toLowerCase();

    if (ua.includes("chrome")) return "Chrome";
    if (ua.includes("firefox")) return "Firefox";
    if (ua.includes("safari")) return "Safari";
    if (ua.includes("edge")) return "Edge";
    if (ua.includes("opera")) return "Opera";

}


function hashIP(ip: string | null) {
    if (!ip) return null;

    return ip.replace(/\./g, "");
}


export async function GET(
    request: Request,
    context: { params: Promise<{ slug: string }> }
) {
    const { slug } = await context.params;

    if (!slug) {
        return new Response("Missing slug", { status: 400 });
    }

    const link = await prisma.link.findUnique({
        where: { slug }
    })

    if (!link) return new Response("Not Found", { status: 404 })

    const userAgent = request.headers.get("user-agent");
    const referer = request.headers.get("referer");
    const forwardedFor = request.headers.get("x-forwarded-for");

    const ip = forwardedFor?.split(",")[0] || null;

    const device = getDeviceType(userAgent);
    const ipHash = hashIP(ip);
    const browser = getBrowser(userAgent);


    prisma.clickEvent.create({
        data: {
            linkId: link.id,
            device,
            ipHash,
            browser,
        }
    })


    return NextResponse.redirect(link.originalUrl)
}