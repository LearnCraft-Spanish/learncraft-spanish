import type {
  CreateNonVerbVocabulary,
  CreateVerb,
  GetTotalCountResponse,
  Vocabulary,
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
  getVocabulary: (options?: VocabularyQueryOptions) => Promise<Vocabulary[]>;

  /**
   * Get a vocabulary item by ID
   */
  getVocabularyById: (id: string) => Promise<Vocabulary | null>;

  /**
   * Get the total count of vocabulary items
   */
  getVocabularyCount: (
    subcategoryId?: number,
  ) => Promise<GetTotalCountResponse>;

  /**
   * Create a new verb vocabulary item
   */
  createVerb: (command: CreateVerb) => Promise<Vocabulary>;

  /**
   * Create a new non-verb vocabulary item
   */
  createNonVerbVocabulary: (
    command: CreateNonVerbVocabulary,
  ) => Promise<Vocabulary>;

  /**
   * Create multiple non-verb vocabulary items in a batch
   */
  createVocabularyBatch: (
    commands: CreateNonVerbVocabulary[],
  ) => Promise<Vocabulary[]>;

  /**
   * Delete a vocabulary item
   */
  deleteVocabulary: (id: string) => Promise<void>;

  /**
   * Get all records associated with a vocabulary record
   */
  getAllRecordsAssociatedWithVocabularyRecord: (
    id: string,
  ) => Promise<VocabularyRelatedRecords>;

  /**
   * Search vocabulary items based on criteria
   */
  searchVocabulary: (query: string) => Promise<Vocabulary[]>;
}

/**
 * Options for filtering vocabulary queries
 */
export interface VocabularyQueryOptions {
  /**
   * Filter by verb/non-verb type
   */
  isVerb?: boolean;

  /**
   * Filter by subcategory ID
   */
  subcategoryId?: number;

  /**
   * Limit the number of results
   */
  limit?: number;

  /**
   * Skip the first n results (for pagination)
   */
  offset?: number;
}
