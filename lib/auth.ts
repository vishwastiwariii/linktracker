import { syncUser } from "./syncUser";



export async function requireAuth() {
    const user = await syncUser();

    if(!user) {
        throw new Error("Unauthorized")
    }

    return user
}