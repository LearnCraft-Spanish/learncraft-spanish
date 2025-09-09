import { createContext } from 'react';

interface ExampleFilterStateWithoutLesson {
  excludeSpanglish: boolean;
  audioOnly: boolean;
  skillTagKeys: string[];
}

interface ExampleFilterContextType {
  exampleFilters: ExampleFilterStateWithoutLesson;
  updateExampleFilters: (
    exampleFilters: ExampleFilterStateWithoutLesson,
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

export type { ExampleFilterContextType, ExampleFilterStateWithoutLesson };
