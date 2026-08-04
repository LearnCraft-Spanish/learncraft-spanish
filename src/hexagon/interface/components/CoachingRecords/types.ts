/**
 * Optional display-only context for edit contextuals.
 * Replaces passing a full `FurnishedWeekWithCoach` when the view only needs
 * a student label (WeeksRecords has it; RecentRecords may not).
 */
export interface CoachingRecordDisplayContext {
  studentName?: string;
}
