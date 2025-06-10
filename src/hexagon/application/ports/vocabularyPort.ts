import type {
  CreateVocabulary,
  Vocabulary,
  VocabularyAbbreviation,
  VocabularyRelatedRecords,
} from '@LearnCraft-Spanish/shared';

/**
 * Port for all vocabulary operations.
 * This defines the interface that infrastructure must implement.
 */
export interface VocabularyPort {
  /**
   * Get all vocabulary items
   */
  getVocabulary: () => Promise<VocabularyAbbreviation[]>;

  /**
   * Get all vocabulary items by subcategory
   */
  getVocabularyBySubcategory: (
    subcategoryId: number,
    page: number,
    limit: number,
  ) => Promise<Vocabulary[]>;

  /**
   * Get a vocabulary item by ID
   */
  getVocabularyById: (id: number) => Promise<Vocabulary | null>;

  /**
   * Get the total count of vocabulary items
   */
  getVocabularyCount: () => Promise<number>;

  /**
   * Get the total count of vocabulary items by subcategory
   */
  getVocabularyCountBySubcategory: (subcategoryId: number) => Promise<number>;

  /**
   * Create a new vocabulary item
   */
  createVocabulary: (command: CreateVocabulary) => Promise<number>;

  /**
   * Delete a vocabulary item
   */
  deleteVocabulary: (id: number) => Promise<number>;

  /**
   * Get all records associated with a vocabulary record
   */
  getAllRecordsAssociatedWithVocabularyRecord: (
    id: string | undefined,
  ) => Promise<VocabularyRelatedRecords>;

  /**
   * Get the total count of vocabulary items by subcategory
   */
  getRelatedRecords: (id: number) => Promise<VocabularyRelatedRecords[]>;
}
