export const runtime = "nodejs";
import { syncUser } from "@/lib/syncUser";


export default async function DashboardPage() {
    const user = await syncUser();

    return <div>Dashboard {user.name}</div>
}