import type { UseMyDataReturn } from '@application/queries/useMyData';

import { previewUserForRole } from './fixtures';
import { readPreviewRole } from './previewRole';

export const GAUNTLET_STUB = true;

/**
 * Auth0-free / network-free `useMyData` for gauntlet preview.
 * Role fixtures come from `fixtures.ts`; `?flags=` only affects student beta.
 */
export function useMyData(): UseMyDataReturn {
  const myData = previewUserForRole(readPreviewRole());

  return {
    myData,
    isBetaTester: myData?.betaTester ?? false,
    isLoading: false,
    error: null,
  };
}

export default useMyData;
