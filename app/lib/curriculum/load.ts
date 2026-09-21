import rawCurriculum from "@/data/curriculum.json";
import type { Curriculum, VocabularyItem, VocabularySet } from "./types";

export const curriculum = rawCurriculum as Curriculum;
const itemsById = new Map(curriculum.items.map(item => [item.id, item]));

export function getSet(id: string): VocabularySet | undefined {
  const set = curriculum.sets.find(candidate => candidate.id === id);
  if (!set) return undefined;
  return { ...set, items: set.itemIds.map(itemId => itemsById.get(itemId)).filter((item): item is VocabularyItem => Boolean(item)) };
}

export function searchVocabulary(query: string, filters: { setId?: string; category?: string } = {}): VocabularyItem[] {
  const needle = query.trim().toLocaleLowerCase();
  return curriculum.items.filter(item => {
    if (filters.setId && item.setId !== filters.setId) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (!needle) return true;
    return [item.hanzi, item.pinyin, item.thai].some(value => value.toLocaleLowerCase().includes(needle));
  });
}
