import type {
  UseSkillTagSearchProps,
  UseSkillTagSearchReturnType,
} from '@application/units/useSkillTagSearch';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';
import { vi } from 'vitest';

const defaultReturn: UseSkillTagSearchReturnType = {
  tagSearchTerm: '',
  tagSuggestions: [],
  updateTagSearchTerm:
    vi.fn<(target?: EventTarget & HTMLInputElement) => void>(),
  removeTagFromSuggestions: vi.fn<(tagId: string) => void>(),
  addTagBackToSuggestions: vi.fn<(tagId: string) => void>(),
  isLoading: false,
  error: null,
};

export const {
  mock: mockUseSkillTagSearch,
  override: overrideMockUseSkillTagSearch,
  reset: resetMockUseSkillTagSearch,
} = createOverrideableMockHook<
  [props?: UseSkillTagSearchProps],
  UseSkillTagSearchReturnType
>(defaultReturn);

export default mockUseSkillTagSearch;
