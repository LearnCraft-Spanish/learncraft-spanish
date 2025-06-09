import type { ExampleRecord } from '@LearnCraft-Spanish/shared';
import type { getExamplesByFiltersQuery } from 'src/hexagon/domain/examples';

export interface ExamplesPort {
  getExamplesByFilters: (
    data: getExamplesByFiltersQuery,
  ) => Promise<ExampleRecord[]>;
}
