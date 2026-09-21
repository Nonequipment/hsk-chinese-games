export type VocabularyItem = Readonly<{
  id: string;
  number: number;
  setId: string;
  category: string;
  scheduledDate: string | null;
  hanzi: string;
  pinyin: string;
  thai: string;
}>;

export type VocabularySetRecord = Readonly<{
  id: string;
  category: string;
  scheduledDate: string | null;
  itemIds: readonly string[];
}>;

export type VocabularySet = VocabularySetRecord & Readonly<{ items: readonly VocabularyItem[] }>;
export type StudyDay = Readonly<{ day: number; date: string; setIds: readonly string[]; setCount: number; wordCount: number }>;
export type Curriculum = Readonly<{
  version: string;
  targetDate: string;
  items: readonly VocabularyItem[];
  sets: readonly VocabularySetRecord[];
  days: readonly StudyDay[];
}>;
