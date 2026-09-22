import { describe, expect, it } from 'vitest';
import curriculum from '../../data/curriculum.json';
import { getSetItems, normalizeSetId } from '../../src/lib/curriculum';

describe('curriculum route helpers', () => {
  it('normalizes canonical and friendly set IDs', () => {
    expect(normalizeSetId('S01')).toBe('S01');
    expect(normalizeSetId('set-01')).toBe('S01');
    expect(normalizeSetId('not-a-set')).toBeNull();
  });

  it('finds the ordered vocabulary for a friendly route', () => {
    const result = getSetItems(curriculum, 'set-01');
    expect(result?.items[0].hanzi).toBe('爸爸');
    expect(result?.items).toHaveLength(20);
  });

  it('keeps verified readings for words with easily confused tones', () => {
    const reading = (hanzi: string) => curriculum.items.find((item) => item.hanzi === hanzi)?.pinyin;
    expect(reading('别人')).toBe('biérén');
    expect(reading('长')).toBe('cháng');
    expect(reading('干')).toBe('gān');
    expect(reading('还')).toBe('hái');
  });
});
