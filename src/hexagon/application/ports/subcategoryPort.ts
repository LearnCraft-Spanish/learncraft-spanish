import type { Subcategory } from '@LearnCraft-Spanish/shared/src/domain/vocabulary/core-types';

/**
 * Port for subcategory operations.
 * This is the interface that infrastructure must implement.
 */
export interface SubcategoryPort {
  /**
   * Get all available subcategories
   */
  getSubcategories: () => Promise<Subcategory[]>;

  /**
   * Get a subcategory by ID
   */
  getSubcategoryById: (id: string) => Promise<Subcategory | null>;
}
