import { curriculum, getSet, searchVocabulary } from '@/app/lib/curriculum/load';

it('preserves the complete workbook curriculum', () => {
  expect(curriculum.items).toHaveLength(1200);
  expect(curriculum.sets).toHaveLength(60);
  expect(curriculum.sets.every(set => set.itemIds.length === 20)).toBe(true);
  expect(curriculum.days[0]).toMatchObject({ day: 1, setIds: ['S01', 'S02', 'S03'] });
  expect(curriculum.items.filter(item => item.hanzi === '只').length).toBeGreaterThan(1);
  expect(new Set(curriculum.items.map(item => item.id)).size).toBe(1200);
});

it('loads sets and searches all three languages without collapsing duplicates', () => {
  expect(getSet('S01')?.items).toHaveLength(20);
  expect(searchVocabulary('zhī').some(item => item.hanzi === '只')).toBe(true);
  expect(searchVocabulary('ลูกค้า').length).toBeGreaterThan(0);
});
