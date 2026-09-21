import { MemoryProgressRepository } from '@/app/lib/progress/repository';

it('scopes every progress read to the authenticated user', async () => {
  const repo = new MemoryProgressRepository();
  await repo.markCardStudied({ userId: 'u1', itemId: 'V0001', setId: 'S01', status: 'remembered', requestId: 'r1' });
  expect((await repo.getSetProgress('u2', 'S01')).studiedCount).toBe(0);
});

it('deduplicates retried card writes', async () => {
  const repo = new MemoryProgressRepository();
  const input = { userId: 'u1', itemId: 'V0001', setId: 'S01', status: 'learning' as const, requestId: 'same' };
  await repo.markCardStudied(input);
  await repo.markCardStudied(input);
  expect(await repo.countCardEvents('u1', 'V0001')).toBe(1);
});

it('derives exam unlock from 20 distinct studied items', async () => {
  const repo = new MemoryProgressRepository();
  for (let i = 1; i <= 20; i++) await repo.markCardStudied({ userId: 'u1', itemId: `V${String(i).padStart(4, '0')}`, setId: 'S01', status: 'remembered', requestId: `r${i}` });
  expect((await repo.getSetProgress('u1', 'S01')).examUnlocked).toBe(true);
});
