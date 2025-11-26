import type { SrsDifficulty } from '@domain/srs';

// This is the data that is stored in the state of the useStudentFlashcardUpdates hook
// It stores the difficulty from srs (easy, hard, viewed) and if the review is pending (not yet sent to the backend)
// export interface ExampleReviewedResults {
//   exampleId: number;
//   difficulty: SrsDifficulty;
//   pending: boolean;
// }

// This is the data that is stored in the localStorage of the useStudentFlashcardUpdates hook
// It stores the exampleId and difficulty of the flashcard that is being reviewed
// It also stores the lastReviewedDate, which is the date when the review was made
// This is used to determine if the review has already been sent to the backend
// If the lastReviewedDate is the same or more recent than the current date, the review has already been sent to the backend
// If the lastReviewedDate is less than the current date, the review has not been sent to the backend
export interface PendingFlashcardUpdateObject {
  exampleId: number;
  difficulty: SrsDifficulty;
  // YYYY-MM-DD format, when the review was made
  // TODO: Change to date.isoString format
  lastReviewedDate: string;
}
