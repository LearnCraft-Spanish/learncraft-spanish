import { OfficialQuizRecordSchema } from '@learncraft-spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockOfficialQuizRecord = createZodFactory(
  OfficialQuizRecordSchema,
);
export const createMockOfficialQuizRecordList = (count?: number) =>
  createZodListFactory(OfficialQuizRecordSchema, count);
