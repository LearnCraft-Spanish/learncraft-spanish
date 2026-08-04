import { canShowPMFSurvey } from '@domain/functions/canShowPMFSurvey';
import { describe, expect, it } from 'vitest';

const NINETY_DAYS_MS = 7776000000;
const THIRTY_DAYS_MS = 2592000000;

describe('canShowPMFSurvey', () => {
  const now = new Date('2024-06-15T12:00:00.000Z');

  it('returns false when last contact is within 60 days', () => {
    const lastContactDate = new Date(
      now.getTime() - THIRTY_DAYS_MS,
    ).toISOString();

    expect(
      canShowPMFSurvey({
        lastContactDate,
        now,
        randomRoll: 1,
      }),
    ).toBe(false);
  });

  it('returns false when last contact is exactly 60 days ago', () => {
    const sixtyDaysMs = 60 * 86400000;
    const lastContactDate = new Date(now.getTime() - sixtyDaysMs).toISOString();

    expect(
      canShowPMFSurvey({
        lastContactDate,
        now,
        randomRoll: 1,
      }),
    ).toBe(false);
  });

  it('returns true when last contact is older than 60 days and roll is 1', () => {
    const lastContactDate = new Date(
      now.getTime() - NINETY_DAYS_MS,
    ).toISOString();

    expect(
      canShowPMFSurvey({
        lastContactDate,
        now,
        randomRoll: 1,
      }),
    ).toBe(true);
  });

  it('returns false when last contact is older than 60 days but roll is not 1', () => {
    const lastContactDate = new Date(
      now.getTime() - NINETY_DAYS_MS,
    ).toISOString();

    expect(
      canShowPMFSurvey({
        lastContactDate,
        now,
        randomRoll: 0,
      }),
    ).toBe(false);
  });

  it('returns true when last contact is missing and roll is 1', () => {
    expect(
      canShowPMFSurvey({
        lastContactDate: null,
        now,
        randomRoll: 1,
      }),
    ).toBe(true);

    expect(
      canShowPMFSurvey({
        lastContactDate: undefined,
        now,
        randomRoll: 1,
      }),
    ).toBe(true);
  });

  it('returns false when last contact is missing and roll is not 1', () => {
    expect(
      canShowPMFSurvey({
        lastContactDate: null,
        now,
        randomRoll: 15,
      }),
    ).toBe(false);
  });
});
