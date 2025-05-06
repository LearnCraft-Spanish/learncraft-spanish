import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';
import { WordCountSchema } from '@application/types/frequensay';

export const createMockWordCount = createZodFactory(WordCountSchema);
export const createMockWordCountList = createZodListFactory(WordCountSchema);
