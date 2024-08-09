export interface Lesson {
  recordId: number;
  lesson: string;
  vocabIncluded: Array<string>;
  sortReference: number;
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
}

export interface UserData {
  recordId: number;
  username: string;
  emailAddress: string;
  cohort: string;
  role: string;
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
  spanglish: 'spanglish' | 'esp';
  vocabIncluded: Array<string>;
  allStudents: Array<string>;
  englishAudio: string;
  spanishAudioLa: string;
  vocabComplete: boolean;
}

export interface StudentExample {
  recordId: number;
  lastReviewedDate: string;
  nextReviewDate: string;
  reviewInterval: number | null;
  relatedStudent: number;
  relatedExample: number;
  dateCreated: string;
  studentEmailAddress: string;
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
