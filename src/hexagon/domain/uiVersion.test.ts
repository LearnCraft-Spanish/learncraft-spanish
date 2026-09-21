import { resolveStudentUiVersion } from '@domain/uiVersion';
import { describe, expect, it } from 'vitest';

describe('resolveStudentUiVersion', () => {
  it('returns v2 for a beta-tester student', () => {
    expect(
      resolveStudentUiVersion({ studentRole: 'student', betaTester: true }),
    ).toBe('v2');
  });

  it('returns v1 for a student who is not a beta tester', () => {
    expect(
      resolveStudentUiVersion({ studentRole: 'student', betaTester: false }),
    ).toBe('v1');
  });

  it('returns v1 for a beta-tester limited user', () => {
    expect(
      resolveStudentUiVersion({ studentRole: 'limited', betaTester: true }),
    ).toBe('v1');
  });

  it('returns v1 for a beta-tester user with no student role', () => {
    expect(
      resolveStudentUiVersion({ studentRole: 'none', betaTester: true }),
    ).toBe('v1');
  });

  it('returns v1 when there is no user record', () => {
    expect(resolveStudentUiVersion(null)).toBe('v1');
  });
});
