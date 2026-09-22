import { describe, it } from 'vitest';

import verifyRequiredInputs, { isValidUrl } from './inputValidation';

describe('function verifyRequiredInputs', () => {
  it('returns false when all inputs are filled', () => {
    const inputs = [
      { value: 'value1', label: 'label1' },
      { value: 'value2', label: 'label2' },
    ];
    expect(verifyRequiredInputs(inputs)).toBe(false);
  });

  it('returns the first label of the first empty input', () => {
    const inputs = [
      { value: 'value1', label: 'label1' },
      { value: '', label: 'label2' },
      { value: '', label: 'label3' },
    ];
    expect(verifyRequiredInputs(inputs)).toBe('label2');
  });
});

describe('function isValidUrl', () => {
  it('returns true for an empty string', () => {
    expect(isValidUrl('')).toBe(true);
  });

  it('returns true for http and https urls', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
  });

  it('returns false for a malformed url', () => {
    expect(isValidUrl('not a url')).toBe(false);
  });

  it('returns false for a javascript: url (rejects non-http(s) schemes)', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
  });

  it('returns false for other non-http(s) schemes', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('mailto:test@example.com')).toBe(false);
  });
});
