import type { VocabRecordWithSpellings } from '@LearnCraft-Spanish/shared';

export interface FrequensayPort {
  getFrequensayVocabulary: () => Promise<VocabRecordWithSpellings[]>;
}
