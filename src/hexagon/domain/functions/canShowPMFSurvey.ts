const MS_PER_DAY = 86400000;
const DEFAULT_INTERVAL_IN_DAYS = 60;
const DEFAULT_SHOW_WHEN_ROLL_EQUALS = 1;

export interface CanShowPMFSurveyParams {
  lastContactDate: string | null | undefined;
  now: Date;
  randomRoll: number;
  intervalInDays?: number;
  showWhenRollEquals?: number;
}

/**
 * Pure PMF survey eligibility rule.
 * Returns false if last contact is within the interval; otherwise shows when
 * randomRoll equals showWhenRollEquals (default 1, matching Math.floor(Math.random() * 30)).
 */
export function canShowPMFSurvey({
  lastContactDate,
  now,
  randomRoll,
  intervalInDays = DEFAULT_INTERVAL_IN_DAYS,
  showWhenRollEquals = DEFAULT_SHOW_WHEN_ROLL_EQUALS,
}: CanShowPMFSurveyParams): boolean {
  if (lastContactDate) {
    const storedDateInDays = Math.floor(
      Date.parse(lastContactDate) / MS_PER_DAY,
    );
    const currentDateInDays = Math.floor(
      Date.parse(now.toISOString()) / MS_PER_DAY,
    );
    const diff = currentDateInDays - storedDateInDays;
    if (diff <= intervalInDays) {
      return false;
    }
  }

  return randomRoll === showWhenRollEquals;
}
