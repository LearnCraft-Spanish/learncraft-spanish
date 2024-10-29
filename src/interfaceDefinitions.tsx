export interface Lesson {
  recordId: number;
  lesson: string;
  vocabIncluded: Array<string>;
  sortReference: number | null;
  relatedProgram: number;
  vocabKnown: Array<string>;
}

export interface Program {
  recordId: number;
  name: string;
  lessons: Array<Lesson>;
  cohortACurrentLesson: number;
  cohortBCurrentLesson: number;
  cohortCCurrentLesson: number;
  cohortDCurrentLesson: number;
  cohortECurrentLesson: number;
  cohortFCurrentLesson: number;
}

export interface ProgramUnparsed {
  recordId: number;
  name: string;
  lessons: Array<string>;
  cohortACurrentLesson: number;
  cohortBCurrentLesson: number;
  cohortCCurrentLesson: number;
  cohortDCurrentLesson: number;
  cohortECurrentLesson: number;
  cohortFCurrentLesson: number;
}

export interface UserData {
  recordId: number;
  name: string;
  emailAddress: string;
  cohort: string;
  role: string;
  relatedProgram: number;
  isAdmin: boolean;
}
// selectedProgram is a program, or null
export type selectedProgram = Program | null;

// selectedLesson is a lesson, or null
export type selectedLesson = Lesson | null;

// These interfaces are also defined in Flashcard Manager, but with some fields missing
export interface Flashcard {
  recordId: number;
  spanishExample: string;
  englishTranslation: string;
  spanglish: string;
  vocabIncluded: Array<string>;
  allStudents?: Array<string>;
  englishAudio: string;
  spanishAudioLa: string;
  vocabComplete: boolean;
  difficulty?: string;
}

export interface StudentExample {
  recordId: number;
  lastReviewedDate: string;
  nextReviewDate: string;
  reviewInterval: number | null;
  coachAdded: boolean | null;
  relatedStudent: number;
  relatedExample: number;
  dateCreated: string;
  studentEmailAddress: string;
}

export interface StudentFlashcardData {
  examples: Flashcard[];
  studentExamples: StudentExample[];
}

// StudentExamplesTable is an array of StudentExamples
export type StudentExamplesTable = Array<StudentExample>;
// ExamplesTable is an array of Flashcards
export type ExamplesTable = Array<Flashcard>;

// Active Student is  UserData, or null
export type ActiveStudent = UserData | null;

// AudioExample is a Flashcard with spanishAudioLa.length > 0
// export type AudioExample = Flashcard;
// export type AudioExamplesTable = Array<AudioExample>;
export type AudioExamplesTable = Array<Flashcard>;

export interface Spelling {
  relatedWordIdiom: number;
  spellingOption: string;
}

export interface Vocabulary {
  recordId: number;
  wordIdiom: string;
  use: string;
  frequencyRank: number;
  vocabularySubcategorySubcategoryName: string;
  descriptionOfVocabularySkill?: string;
  vocabName: string;
  verbInfinitive: string;
  conjugationTags: Array<string>;
  spellings?: Array<string>;
}

export interface QuizCourse {
  name: string;
  url: string;
  code: string;
}

export interface DisplayOrder {
  recordId: number;
}

export interface Quiz {
  recordId: number;
  quizNickname: string;
  quizType: string;
  quizSubtype: string;
  quizNumber: number;
  quizLetter: string;
  lessonNumber: number;
  subtitle: string;
}

export interface QuizExamplesTable {
  quizNickname: string;
  quizExamplesTable: Flashcard[];
}

export interface Spelling {
  relatedWordidiom: number;
  spellingOption: string;
}

/*      Flashcard Finder      */

// Highly Tentative for now, will be updated as needed
export interface VocabTagWithVocabDescriptor {
  id: number;
  type: "vocabulary";
  tag: string;
  vocabDescriptor: string; // required when type is "vocab"
}

export interface VocabTagWithoutVocabDescriptor {
  id: number;
  type: string; // any other type
  tag: string;
  vocabDescriptor?: undefined; // explicitly undefined when type is not "vocab"
}

// Combines the two types above
export type VocabTag =
  | VocabTagWithVocabDescriptor
  | VocabTagWithoutVocabDescriptor;

/*      Coaching Interfaces      */
export interface Coach {
  recordId: number;
  coach: string;
  user: string;
}

export interface CoachingCourses {
  recordId: number;
  name: string;
  membershipType: string;
  weeklyPrivateCalls: number;
  hasGroupCalls: boolean;
}

export interface CoachingLessons {
  recordId: number;
  lessonName: string;
  weekRef: number;
  type: string;
}

export interface WrapperProps {
  children: React.ReactNode;
}

export type mockUserNames =
  | "admin-empty-role"
  | "empty-role"
  | "none-role"
  | "limited"
  | "student-admin"
  | "student-lcsp"
  | "student-ser-estar"
  | null
  | undefined;
