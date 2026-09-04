import type { OfficialQuizRecord, QuizGroup } from '@learncraft-spanish/shared';

/** Shape a `<select>` needs; matches `interface`'s `SelectOption` structurally. */
export interface LabeledOption {
  value: string;
  label: string;
}

/**
 * Quiz groups map to courses, so the "Course" field a learner edits under
 * "Change" is really this list. Order is left to the API (course order),
 * not re-sorted here.
 */
export function quizGroupSelectOptions(
  quizGroups: QuizGroup[],
): LabeledOption[] {
  return quizGroups.map((group) => ({
    value: String(group.id),
    label: group.name,
  }));
}

/**
 * Quizzes within the selected group. `quizNumber` is the value rather than
 * `id` because that is what the setup menu's state (and the quiz-taking
 * route) already key off of.
 */
export function officialQuizSelectOptions(
  quizOptions: OfficialQuizRecord[],
): LabeledOption[] {
  return quizOptions.map((quiz) => ({
    value: String(quiz.quizNumber),
    label: quiz.quizTitle,
  }));
}
