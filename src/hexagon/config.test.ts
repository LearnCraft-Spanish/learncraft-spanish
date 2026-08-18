import { parseUiFlags } from '@config';
import { describe, expect, it } from 'vitest';

describe('parseUiFlags', () => {
  it('returns an empty list when the env value is missing or blank', () => {
    expect(parseUiFlags(undefined)).toEqual([]);
    expect(parseUiFlags('')).toEqual([]);
    expect(parseUiFlags('   ')).toEqual([]);
  });

  it('trims whitespace and drops empty comma segments', () => {
    expect(parseUiFlags('a,,  b ')).toEqual(['a', 'b']);
    expect(parseUiFlags('ui.student.help.v2')).toEqual(['ui.student.help.v2']);
  });
});
