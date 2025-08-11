import { createContext } from 'react';

interface ExampleFilterStateWithoutCourseAndLesson {
  excludeSpanglish: boolean;
  audioOnly: boolean;
  skillTagKeys: string[];
}

interface ExampleFilterContextType {
  exampleFilters: ExampleFilterStateWithoutCourseAndLesson;
  updateExampleFilters: (
    exampleFilters: ExampleFilterStateWithoutCourseAndLesson,
  ) => void;
}

export const ExampleFilterContext = createContext<ExampleFilterContextType>({
  exampleFilters: {
    excludeSpanglish: false,
    audioOnly: false,
    skillTagKeys: [],
  },
  updateExampleFilters: () => {},
});

export type {
  ExampleFilterContextType,
  ExampleFilterStateWithoutCourseAndLesson,
};
