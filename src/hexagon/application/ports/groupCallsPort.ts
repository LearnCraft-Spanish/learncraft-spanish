import type { GroupCallLookups } from '@learncraft-spanish/shared';

export interface GroupCallsPort {
  getGroupCallLookups: () => Promise<GroupCallLookups>;
}
