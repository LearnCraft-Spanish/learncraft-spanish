import { createContext } from 'react';

interface ExampleFilterState {
  includeSpanglish: boolean;
  audioOnly: boolean;
  skillTags: string[];
}

interface ExampleFilterContextType {
  exampleFilters: ExampleFilterState;
  updateExampleFilters: (exampleFilters: ExampleFilterState) => void;
  filtersChanging: boolean;
  updateFiltersChanging: (filtersChanging: boolean) => void;
}

export const ExampleFilterContext = createContext<ExampleFilterContextType>({
  exampleFilters: {
    includeSpanglish: false,
    audioOnly: false,
    skillTags: [],
  },
  updateExampleFilters: () => {},
  filtersChanging: false,
  updateFiltersChanging: () => {},
});

export type { ExampleFilterContextType, ExampleFilterState };
