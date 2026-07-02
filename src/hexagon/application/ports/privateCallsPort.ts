import type { PrivateCallLookups } from '@learncraft-spanish/shared';

export interface PrivateCallsPort {
  getPrivateCallLookups: () => Promise<PrivateCallLookups>;
}
