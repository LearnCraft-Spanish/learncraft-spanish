import type {
  LessonPopup,
  UseLessonPopupOptions,
  UseLessonPopupReturnType,
} from '@application/units/useLessonPopup';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultLessonPopup: LessonPopup = {
  lessonsByVocabulary: [],
  lessonsLoading: false,
};

const defaultMockUseLessonPopup: UseLessonPopupReturnType = {
  lessonPopup: defaultLessonPopup,
};

export const {
  mock: mockUseLessonPopup,
  override: overrideMockUseLessonPopup,
  reset: resetMockUseLessonPopup,
} = createOverrideableMockHook<
  [UseLessonPopupOptions?],
  UseLessonPopupReturnType
>(defaultMockUseLessonPopup);

export default mockUseLessonPopup;
