import { FlashcardSchema } from '@learncraft-spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockFlashcard = createZodFactory(FlashcardSchema);

export const createMockFlashcardList = (count?: number) => {
  return createZodListFactory(FlashcardSchema, count);
};
