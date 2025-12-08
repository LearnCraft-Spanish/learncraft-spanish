import { SelectedExamplesContext } from '@application/coordinators/contexts/SelectedExamplesContext';
import { use } from 'react';

export function useSelectedExamplesContext() {
  const context = use(SelectedExamplesContext);
  if (!context) {
    throw new Error(
      'useSelectedExamplesContext must be used within a SelectedExamplesContextProvider',
    );
  }
  return context;
}
