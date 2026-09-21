import { handleCardPost } from '@/app/api/cards/route';

it('rejects anonymous progress writes', async () => {
  const response = await handleCardPost(new Request('http://local/api/cards', { method: 'POST', body: JSON.stringify({ itemId: 'V0001' }) }), { getUser: async () => null, repo: {} as never });
  expect(response.status).toBe(401);
});

it('ignores a forged userId in the payload', async () => {
  let writtenUser = '';
  const repo = { markCardStudied: async (input: { userId: string }) => { writtenUser = input.userId; } };
  await handleCardPost(new Request('http://local/api/cards', { method: 'POST', body: JSON.stringify({ userId: 'victim', itemId: 'V0001', setId: 'S01', status: 'learning', requestId: 'r1' }) }), { getUser: async () => ({ userId: 'real-user' }), repo: repo as never });
  expect(writtenUser).toBe('real-user');
});
