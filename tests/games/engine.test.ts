import { createGame } from '@/app/lib/games/engine'; import { acceptsPinyin } from '@/app/lib/games/pinyin'; import { getSet } from '@/app/lib/curriculum/load';
it('builds every mode with each set item exactly once',()=>{const items=getSet('S01')!.items;for(const mode of ['meaning','reading','pinyin','hanzi','tones','matching','flash'] as const){const game=createGame({mode,items,seed:42});expect(game.itemIds).toHaveLength(20);expect(new Set(game.itemIds).size).toBe(20)}});
it('accepts numbered and marked pinyin equivalently',()=>expect(acceptsPinyin('nǐ','ni3')).toBe(true));
