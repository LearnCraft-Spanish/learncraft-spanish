import {
  appUserAbbreviationSchema,
  appUserSchema,
} from '@learncraft-spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockAppUserAbbreviation = createZodFactory(
  appUserAbbreviationSchema,
);
export const createMockAppUserAbbreviationList = createZodListFactory(
  appUserAbbreviationSchema,
);

export const createMockAppUser = createZodFactory(appUserSchema);
export const createMockAppUserList = createZodListFactory(appUserSchema);
