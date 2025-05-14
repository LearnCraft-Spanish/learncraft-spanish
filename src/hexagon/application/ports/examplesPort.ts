import type { ExampleRecord } from '@LearnCraft-Spanish/shared';

export interface ExamplesPort {
  getExample: (id: number) => Promise<ExampleRecord>;
}
