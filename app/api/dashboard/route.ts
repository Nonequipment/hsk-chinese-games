import { getChatGPTUser } from '@/app/chatgpt-auth';
import { createDashboardSnapshot } from '@/app/lib/dashboard/service';
export async function GET() { const user = await getChatGPTUser(); return Response.json(createDashboardSnapshot({ signedIn: Boolean(user) })); }
