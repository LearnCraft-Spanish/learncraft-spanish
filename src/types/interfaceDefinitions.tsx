export type Expanded<T> = { [K in keyof T]: T[K] };

export type Lesson = Expanded<{
  recordId: number;
  lesson: string;
  vocabIncluded: Array<string>;
  sortReference: number | null;
  relatedProgram: number;
  vocabKnown: Array<string>;
}>;

export type LessonUnparsed = Expanded<{
  recordId: number;
  lesson: string;
  vocabIncluded: Array<string>;
  sortReference: number | null;
  relatedProgram: number;
}>;

export type Program = Expanded<{
  recordId: number;
  name: string;
  lessons: Array<Lesson>;
  cohortACurrentLesson: number;
  cohortBCurrentLesson: number;
  cohortCCurrentLesson: number;
  cohortDCurrentLesson: number;
  cohortECurrentLesson: number;
  cohortFCurrentLesson: number;
}>;

export type ProgramUnparsed = Expanded<{
  recordId: number;
  name: string;
  lessons: Array<string>;
  cohortACurrentLesson: number;
  cohortBCurrentLesson: number;
  cohortCCurrentLesson: number;
  cohortDCurrentLesson: number;
  cohortECurrentLesson: number;
  cohortFCurrentLesson: number;
}>;

export type UserData = Expanded<{
  recordId: number;
  name: string;
  emailAddress: string;
  cohort: string;
  relatedProgram: number;
  roles: {
    studentRole: '' | 'limited' | 'student';
    adminRole: '' | 'coach' | 'admin';
  };
}>;

export type FlashcardStudent = Expanded<{
  recordId: number;
  name: string;
  emailAddress: string;
  cohort: string;
  relatedProgram: number;
  role: '' | 'limited' | 'student';
}>;

export type selectedProgram = Expanded<Program | null>;

export type selectedLesson = Expanded<Lesson | null>;

export type Flashcard = Expanded<{
  recordId: number;
  spanishExample: string;
  englishTranslation: string;
  spanglish: string;
  vocabIncluded: Array<string>;
  englishAudio: string;
  spanishAudioLa: string;
  vocabComplete: boolean;
  difficulty?: 'easy' | 'hard';
  dateCreated?: string;
  dateModified?: string;
}>;

export type NewFlashcard = Expanded<
  Omit<Flashcard, 'recordId' | 'vocabIncluded'> & {
    recordId?: never;
    vocabIncluded?: never;
  }
>;

export type StudentExample = Expanded<{
  recordId: number;
  lastReviewedDate: string;
  nextReviewDate: string;
  reviewInterval: number | null;
  coachAdded: boolean | null;
  relatedStudent: number;
  relatedExample: number;
  dateCreated: string;
  studentEmailAddress: string;
}>;

export type StudentFlashcardData = Expanded<{
  examples: Flashcard[];
  studentExamples: StudentExample[];
}>;

export type StudentExamplesTable = Expanded<Array<StudentExample>>;

export type ExamplesTable = Expanded<Array<Flashcard>>;

export type ActiveStudent = Expanded<UserData | null>;

export type AudioExamplesTable = Expanded<Array<Flashcard>>;

export type Vocabulary = Expanded<{
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
}>;

export type QuizCourse = Expanded<{
  name: string;
  url: string;
  code: string;
}>;

export type DisplayOrder = Expanded<{
  recordId: number;
}>;

export type Quiz = Expanded<{
  recordId: number;
  quizNickname: string;
  quizType: string;
  quizSubtype: string;
  quizNumber: number;
  quizLetter: string;
  lessonNumber: number;
  subtitle: string;
}>;

export type QuizUnparsed = Expanded<{
  quizNickname: string;
  recordId: number;
}>;

export type QuizExamplesTable = Expanded<{
  quizNickname: string;
  quizExamplesTable: Flashcard[];
}>;

export type Spelling = Expanded<{
  relatedWordIdiom: number;
  spellingOption: string;
}>;

export type VocabTagWithVocabDescriptor = Expanded<{
  id: number;
  type: 'vocabulary';
  tag: string;
  vocabDescriptor: string;
}>;

export type VocabTagWithoutVocabDescriptor = Expanded<{
  id: number;
  type: string;
  tag: string;
  vocabDescriptor?: undefined;
}>;

export type VocabTag = Expanded<
  VocabTagWithVocabDescriptor | VocabTagWithoutVocabDescriptor
>;

export type Coach = Expanded<{
  recordId: number;
  coach: string;
  user: string;
}>;

export type CoachingCourses = Expanded<{
  recordId: number;
  name: string;
  membershipType: string;
  weeklyPrivateCalls: number;
  hasGroupCalls: boolean;
}>;

export type CoachingLessons = Expanded<{
  recordId: number;
  lessonName: string;
  weekRef: number;
  type: string;
}>;

export type WrapperProps = Expanded<{
  children: React.ReactNode;
}>;

export type mockUserNames = Expanded<
  | 'admin-empty-role'
  | 'empty-role'
  | 'none-role'
  | 'limited'
  | 'student-admin'
  | 'student-lcsp'
  | 'student-ser-estar'
  | null
  | undefined
>;

export type PMFData = Expanded<{
  recordId: number;
  relatedStudent: number;
  lastContactDate: string;
}>;
