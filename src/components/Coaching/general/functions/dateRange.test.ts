import { describe, it } from 'vitest';

import getDateRange from './dateRange';

const returnedAttributes = [
  'dayOfWeekString',
  'nextWeekDate',
  'thisWeekDate',
  'lastSundayDate',
  'twoSundaysAgoDate',
];

describe('function getDateRange', () => {
  it('returns an object with the correct keys', () => {
    const dateRange = getDateRange(3);
    returnedAttributes.forEach((attribute) => {
      expect(dateRange).toHaveProperty(attribute);
    });
  });

  it('returns an object with the correct values', () => {
    const dateRange = getDateRange(3);
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

    expect(dateRange.dayOfWeekString).toBe(dayOfWeek.toString());
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

  it('handles different dayOfWeek parameters correctly', () => {
    const dateRange = getDateRange(5); // Testing with a different day of week
    // number of keys should be 6
    expect(Object.keys(dateRange).length).toBe(7);
  });
});
