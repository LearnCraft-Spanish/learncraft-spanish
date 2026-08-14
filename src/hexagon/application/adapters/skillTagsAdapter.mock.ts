import type { SkillTagsPort } from '@application/ports/skillTagsPort';
import { createMockSkillTagList } from '@testing/factories/skillTagFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAdapter: SkillTagsPort = {
  getSkillTags: async () => createMockSkillTagList(3),
  getReachableSkills: async () => ({
    vocabularyIds: [],
    subcategoryIds: [],
    verbIds: [],
    conjugationTags: [],
  }),
};

export const {
  mock: mockSkillTagsAdapter,
  override: overrideMockSkillTagsAdapter,
  reset: resetMockSkillTagsAdapter,
} = createOverrideableMock<SkillTagsPort>(defaultMockAdapter);

export default mockSkillTagsAdapter;
