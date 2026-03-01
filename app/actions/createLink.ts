"use server"

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma";
import { createSlug } from "./createSlug";


export async function createLink(url: string, name: string) {
    if (!url || url.trim() === "") {
        throw new Error("URL is required")
    }

    if (!name || name.trim() === "") {
        throw new Error("Link name is required")
    }

    const user = await requireAuth();

    const plan = user.plan;

    if (plan === "FREE") {
        const count = await prisma.link.count({
            where: {
                userId: user.id
            }
        })

        if (count >= 10) {
            throw new Error("Free plan limit reached")
        }
    }

    const slug = await createSlug();

    const link = await prisma.link.create({
        data: {
            userId: user.clerkUserId,
            name: name.trim(),
            slug: slug,
            originalUrl: url,
            url: `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${slug}`,
        }
    })

    return link;
}