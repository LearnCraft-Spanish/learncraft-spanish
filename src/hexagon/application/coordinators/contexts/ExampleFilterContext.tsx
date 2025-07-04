import { createContext } from 'react';

interface ExampleFilterState {
  excludeSpanglish: boolean;
  audioOnly: boolean;
  skillTags: string[];
}

interface ExampleFilterContextType {
  exampleFilters: ExampleFilterState;
  updateExampleFilters: (exampleFilters: ExampleFilterState) => void;
}

export const ExampleFilterContext = createContext<ExampleFilterContextType>({
  exampleFilters: {
    excludeSpanglish: false,
    audioOnly: false,
    skillTags: [],
  },
  updateExampleFilters: () => {},
});

export type { ExampleFilterContextType, ExampleFilterState };
