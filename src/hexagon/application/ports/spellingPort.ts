export interface SpellingPort {
  /**
   * Get the spellings known for a lesson
   */
  getSpellingsKnownForLesson: (
    courseId: number,
    lessonNumber: number,
  ) => Promise<string[]>;
}
