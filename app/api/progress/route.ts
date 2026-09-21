export async function GET(request: Request) {
  const [{ getChatGPTUser }, { getProgressRepository }] = await Promise.all([import('@/app/chatgpt-auth'), import('@/app/lib/db/env')]);
  const user = await getChatGPTUser(); if (!user) return Response.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  const setId = new URL(request.url).searchParams.get('setId') ?? 'S01';
  return Response.json(await getProgressRepository().getSetProgress(user.userId, setId));
}
