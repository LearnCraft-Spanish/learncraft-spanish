/* Functions to convert Date objects */

// Returns full ISO 8601 DateTime string (UTC)
export const toISODateTime = (date: Date = new Date()): string => {
  return date.toISOString();
};

// Returns UTC date only in string format (YYYY-MM-DD)
export const toISODate = (date: Date = new Date()): string => {
  return date.toISOString().slice(0, 10);
};

// Converts a Date to a Unix timestamp (milliseconds)
export const toTimestamp = (date: Date = new Date()): number => {
  return date.getTime();
};

/* Formats date as "MMM DD, YYYY" (User-friendly, Local Time) */
export const toReadableDate = (date: Date = new Date()): string =>
  // use utc
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

/* Functions to parse strings or numbers and return Date objects */

// Parses an ISO 8601 string into a Date object
export const fromISODateTime = (isoString: string): Date => {
  if (!isoString || Number.isNaN(Date.parse(isoString))) {
    throw new TypeError(`Invalid ISO 8601 string: ${isoString}`);
  }
  return new Date(isoString);
};

// Parses a 10-character date-only string (YYYY-MM-DD) into a Date object
export const fromISODate = (dateString: string): Date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD.`);
  }
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-based in Date constructor
};

/* Formats date string (YYYY-MM-DD) as "Month Day" (e.g. "March 2") in UTC */
export const toReadableMonthDay = (dateString: string): string => {
  const date = fromISODate(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

// Parses a timestamp (ms) into a Date object
export const fromTimestamp = (timestamp: number): Date => {
  if (
    !Number.isSafeInteger(timestamp) ||
    timestamp < 0 ||
    timestamp > Date.UTC(275760, 0, 1)
  ) {
    throw new TypeError(
      `Invalid timestamp: ${timestamp}. Expected a safe positive integer.`,
    );
  }
  return new Date(timestamp);
};

/* Final export of all functions as object methods */

export const dateUtils = Object.freeze({
  toISODate,
  toISODateTime,
  toReadableDate,
  toReadableMonthDay,
  toTimestamp,
  fromISODate,
  fromISODateTime,
  fromTimestamp,
});
