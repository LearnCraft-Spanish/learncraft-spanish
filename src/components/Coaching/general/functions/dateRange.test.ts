import { describe, it } from 'vitest';

import getDateRange from './dateRange';

const returnedAttributes = [
  'dayOfWeek',
  'nextWeekDate',
  'thisWeekDate',
  'lastSundayDate',
  'twoSundaysAgoDate',
];
describe('function getDateRange', () => {
  it('returns an object with the correct keys', () => {
    const dateRange = getDateRange();
    returnedAttributes.forEach((attribute) => {
      expect(dateRange).toHaveProperty(attribute);
    });
  });
  it('returns an object with the correct values', () => {
    // This feels like a really stupid test, this is literally just the logic in the function, copied and pasted
    // But I do think we want some way to verify that the dates are correct, so I'm going to leave it in for now
    const dateRange = getDateRange();
    const nowString = Date.now();
    const now = new Date(nowString);
    const dayOfWeek = now.getDay();
    const nextSundayString = now.getTime() - dayOfWeek * 86400000 + 604800000;
    const thisPastSundayString = now.getTime() - dayOfWeek * 86400000;
    const lastSundayString = now.getTime() - dayOfWeek * 86400000 - 604800000;
    const twoSundaysAgoString =
      now.getTime() - dayOfWeek * 86400000 - 1209600000;
    const nextSunday = new Date(nextSundayString);
    const thisPastSunday = new Date(thisPastSundayString);
    const lastSunday = new Date(lastSundayString);
    const twoSundaysAgo = new Date(twoSundaysAgoString);
    expect(dateRange.dayOfWeek).toBe(dayOfWeek);
    expect(dateRange.nextWeekDate).toBe(nextSunday.toISOString().split('T')[0]);
    expect(dateRange.thisWeekDate).toBe(
      thisPastSunday.toISOString().split('T')[0],
    );
    expect(dateRange.lastSundayDate).toBe(
      lastSunday.toISOString().split('T')[0],
    );
    expect(dateRange.twoSundaysAgoDate).toBe(
      twoSundaysAgo.toISOString().split('T')[0],
    );
  });
});
