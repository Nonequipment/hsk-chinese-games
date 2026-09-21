import type { ProgressRepository } from '@/app/lib/progress/repository';
import type { ChatGPTUser } from '@/app/chatgpt-auth';

type Dependencies = { getUser: () => Promise<Pick<ChatGPTUser, 'userId'> | null>; repo: ProgressRepository };
export async function handleCardPost(request: Request, deps: Dependencies): Promise<Response> {
  const user = await deps.getUser();
  if (!user) return Response.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  const body = await request.json() as Record<string, string>;
  if (!body.itemId || !body.setId || !body.status || !body.requestId) return Response.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 });
  await deps.repo.markCardStudied({ userId: user.userId, itemId: body.itemId, setId: body.setId, status: body.status as 'remembered' | 'learning' | 'difficult', requestId: body.requestId });
  return Response.json({ ok: true });
}
export async function POST(request: Request) {
  const [{ getChatGPTUser }, { getProgressRepository }] = await Promise.all([import('@/app/chatgpt-auth'), import('@/app/lib/db/env')]);
  return handleCardPost(request, { getUser: getChatGPTUser, repo: getProgressRepository() });
}
