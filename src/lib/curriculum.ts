export type VocabularyItem = {
  id: string;
  number: number;
  setId: string;
  category: string;
  hanzi: string;
  pinyin: string;
  thai: string;
};

export type VocabularySet = {
  id: string;
  number: number;
  category: string;
  scheduledDate: string;
  itemIds: string[];
};

export type Curriculum = { items: VocabularyItem[]; sets: VocabularySet[] };

export function normalizeSetId(value?: string): string | null {
  const match = value?.trim().match(/^(?:s|set-?)(\d{1,2})$/i);
  if (!match) return null;
  const number = Number(match[1]);
  return number >= 1 && number <= 60 ? `S${String(number).padStart(2, '0')}` : null;
}

export function getSetItems(data: Curriculum, value?: string) {
  const id = normalizeSetId(value);
  const set = data.sets.find((entry) => entry.id === id);
  if (!set) return null;
  const byId = new Map(data.items.map((item) => [item.id, item]));
  const items = set.itemIds.map((itemId) => byId.get(itemId)).filter((item): item is VocabularyItem => Boolean(item));
  return { set, items };
}
