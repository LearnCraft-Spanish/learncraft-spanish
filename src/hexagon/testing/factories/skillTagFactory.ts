import type { SkillTag } from '@learncraft-spanish/shared';
import { SkillTagSchema } from '@learncraft-spanish/shared';
import { createZodListFactory } from '@testing/utils/factoryTools';

const factory = createZodListFactory(SkillTagSchema);

export const createMockSkillTagList = (
  count?: number,
  overrides?: Partial<SkillTag>,
) => factory(count, overrides);
