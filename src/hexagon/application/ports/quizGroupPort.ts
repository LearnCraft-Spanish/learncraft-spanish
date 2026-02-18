import type { QuizGroup } from '@learncraft-spanish/shared';

export interface QuizGroupPort {
  /**
   * Get all quiz groups (including unpublished, for use in the admin interface)
   * @returns A list of quiz groups
   */
  getAllQuizGroups: () => Promise<QuizGroup[]>;
}
