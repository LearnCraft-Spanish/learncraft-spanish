import { overrideMockFeatureFlagAdapter } from '@application/adapters/featureFlagAdapter.mock';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useStudentUiVersion', () => {
  it('returns v1 when the flag is disabled', () => {
    overrideMockFeatureFlagAdapter({
      isEnabled: () => false,
    });

    const { result } = renderHook(() =>
      useStudentUiVersion('ui.student.help.v2'),
    );

    expect(result.current.version).toBe('v1');
  });

  it('returns v2 when the flag is enabled', () => {
    overrideMockFeatureFlagAdapter({
      isEnabled: () => true,
    });

    const { result } = renderHook(() =>
      useStudentUiVersion('ui.student.help.v2'),
    );

    expect(result.current.version).toBe('v2');
  });
});
