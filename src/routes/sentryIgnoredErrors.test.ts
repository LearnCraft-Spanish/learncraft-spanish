import { describe, expect, it } from 'vitest';
import { shouldIgnoreError } from './sentryIgnoredErrors';

describe('shouldIgnoreError', () => {
  it('ignores failed dynamic import TypeErrors from originalException', () => {
    const error = new TypeError(
      'Failed to fetch dynamically imported module: https://app.learncraftspanish.com/assets/WeeksRecords-Bf5e4mps.js',
    );

    expect(shouldIgnoreError({}, error)).toBe(true);
  });

  it('ignores the same error when only present on the Sentry event payload', () => {
    const event = {
      exception: {
        values: [
          {
            type: 'TypeError',
            value:
              'Failed to fetch dynamically imported module: https://app.learncraftspanish.com/assets/WeeksRecords-Bf5e4mps.js',
          },
        ],
      },
    };

    expect(shouldIgnoreError(event, undefined)).toBe(true);
  });

  it('ignores when the ignored error is nested as cause', () => {
    const cause = new TypeError(
      'Failed to fetch dynamically imported module: https://app.learncraftspanish.com/assets/foo.js',
    );
    const error = new Error('wrapper', { cause });

    expect(shouldIgnoreError({}, error)).toBe(true);
  });

  it('ignores Firefox dynamically imported module TypeErrors', () => {
    const error = new TypeError(
      'error loading dynamically imported module: https://app.learncraftspanish.com/assets/CombinedCustomQuiz-CQzRiShA.js',
    );

    expect(shouldIgnoreError({}, error)).toBe(true);
  });

  it('ignores invalid JavaScript MIME type TypeErrors', () => {
    expect(
      shouldIgnoreError(
        {},
        new TypeError("'text/html' is not a valid JavaScript MIME type."),
      ),
    ).toBe(true);
  });

  it('does not ignore unrelated TypeErrors', () => {
    expect(
      shouldIgnoreError({}, new TypeError('Cannot read properties of null')),
    ).toBe(false);
  });
});
