import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function syncUser() {
    const clerkUser = await currentUser();
    
    if(!clerkUser) {
        throw new Error("Unauthorized")
    }

    const email = clerkUser.emailAddresses[0].emailAddress
    
    if(!email) {
        throw new Error("Email not found")
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            clerkUserId: clerkUser.id
        }
    })  

    if(existingUser) return existingUser

    return await prisma.user.create({
        data: {
            clerkUserId: clerkUser.id,
            email,
            name: clerkUser.fullName!,
        }
    })
}