/** Valid rank range for vocabulary entries (1-10001) */
export type VocabularyRank = number & { readonly brand: unique symbol };

/**
 * Core vocabulary entry type representing a Spanish-English word pair.
 * Used as the base data structure for vocabulary items.
 */
export interface VocabularyEntry {
  /** Spanish word or phrase */
  spanish: string;
  /** English translation */
  english: string;
  /** Optional example usage */
  usage?: string;
  /** Frequency rank (1-10001, lower is more frequent) */
  rank: VocabularyRank;
}
