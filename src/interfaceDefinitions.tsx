export interface lesson {
    recordId: number;
    lesson: string;
    vocabIncluded: Array<string>;
    sortReference: number;
    relatedProgram: number;
    vocabKnown: Array<string>;
  }
  
export interface program {
    recordId: number;
    name: string;
    lessons: Array<lesson>;
    cohortACurrentLesson: number;
    cohortBCurrentLesson: number;
    cohortCCurrentLesson: number;
    cohortDCurrentLesson: number;
    cohortECurrentLesson: number;
  }