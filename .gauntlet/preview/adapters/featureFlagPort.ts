import type { FeatureFlagPort } from '@application/ports/featureFlagPort';
import type { StudentUiFlag } from '@domain/uiFlags';

/**
 * Feature flags for gauntlet preview — all student UI flags enabled by default.
 * Override with `?flags=off` to force v1, or `?flags=id1,id2` for an allowlist.
 */
export function useFeatureFlagAdapter(): FeatureFlagPort {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('flags');

  if (raw === 'off' || raw === '0' || raw === 'false') {
    return { isEnabled: () => false };
  }

  if (raw && raw.length > 0) {
    const enabled = new Set(
      raw
        .split(',')
        .map((flag) => flag.trim())
        .filter(Boolean),
    );
    return {
      isEnabled: (flagId: StudentUiFlag): boolean => enabled.has(flagId),
    };
  }

  return {
    isEnabled: (_flagId: StudentUiFlag): boolean => true,
  };
}

export default useFeatureFlagAdapter;
