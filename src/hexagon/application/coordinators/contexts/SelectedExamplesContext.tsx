// This is for the Example Manager/ Editor/Assigner/Search interface

import { createContext } from 'react';

export interface SelectedExamplesContextType {
  selectedExampleIds: number[];
  updateSelectedExamples: (exampleIds: number[]) => void;
  addSelectedExample: (exampleId: number) => void;
  removeSelectedExample: (exampleId: number) => void;
  clearSelectedExamples: () => void;
}

export const SelectedExamplesContext =
  createContext<SelectedExamplesContextType | null>(null);
