import type { SkillTagsPort } from '@application/ports/skillTagsPort';
import { createMockSkillTagList } from '@testing/factories/skillTagFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAdapter: SkillTagsPort = {
  getSkillTags: async () => createMockSkillTagList(3),
};

export const {
  mock: mockSkillTagsAdapter,
  override: overrideMockSkillTagsAdapter,
  reset: resetMockSkillTagsAdapter,
} = createOverrideableMock<SkillTagsPort>(defaultMockAdapter);

export default mockSkillTagsAdapter;
