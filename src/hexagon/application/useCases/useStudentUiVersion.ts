import type { UiVersion } from '@domain/uiVersion';
import { CURRENT_UI_VERSION } from '@domain/uiVersion';

export interface StudentUiVersionResult {
  version: UiVersion;
}

/**
 * Which UI version to render. Every visitor gets the rolled-out version,
 * signed in or not. Kept as a hook in `useCases/` (rather than reading the
 * constant directly) because interface tests mock this module path to
 * exercise the remaining v1 branches.
 */
export function useStudentUiVersion(): StudentUiVersionResult {
  return { version: CURRENT_UI_VERSION };
}
