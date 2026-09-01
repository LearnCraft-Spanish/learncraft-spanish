/**
 * Quiz length options track what is actually drawable. The presets are offered
 * while they fit, and a set too small for them is offered at its exact size, so
 * the learner is never given a length that would quietly draw fewer cards.
 */
export const QUIZ_LENGTH_PRESETS: readonly number[] = [10, 20, 50, 100, 150];

export function availableQuizLengths(availableCount: number): number[] {
  if (availableCount <= 0) {
    return [];
  }

  const options = QUIZ_LENGTH_PRESETS.filter(
    (length) => length <= availableCount,
  );

  if (!options.includes(availableCount)) {
    options.push(availableCount);
  }

  return options.sort((a, b) => a - b);
}

/**
 * Holds a chosen length inside the options a filter change left behind, by
 * dropping to the largest one that still fits. Growing the set therefore moves
 * an odd length such as 36 down to 20 rather than up to 50, which keeps the
 * quiz from getting longer than the learner asked for.
 *
 * Expects `options` sorted ascending, as `availableQuizLengths` returns them.
 */
export function snapQuizLength(
  selected: number,
  options: readonly number[],
): number {
  if (options.length === 0) {
    return 0;
  }

  const fitting = options.filter((option) => option <= selected);
  return fitting.length > 0 ? fitting[fitting.length - 1] : options[0];
}
