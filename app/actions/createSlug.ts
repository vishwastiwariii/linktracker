"use server"

import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";


const MAX_RETRIES = 5;

export async function createSlug() {
    for (let i=0; i<MAX_RETRIES; i++) {
        const slug = generateSlug();

        const existing = await prisma.link.findUnique({
            where: {slug},
            select: {id: true}
        })

        if(!existing) return slug
    }

    throw new Error("Failed to generate unique slug after multiple attempts")   
}