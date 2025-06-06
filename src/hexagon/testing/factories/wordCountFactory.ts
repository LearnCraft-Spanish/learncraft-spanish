import { WordCountSchema } from '@application/types/frequensay';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockWordCount = createZodFactory(WordCountSchema);
export const createMockWordCountList = createZodListFactory(WordCountSchema);
