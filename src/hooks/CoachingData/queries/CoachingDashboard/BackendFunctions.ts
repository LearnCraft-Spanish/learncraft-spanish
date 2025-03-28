import type {
  Assignment,
  GroupSession,
  PrivateCall,
} from 'src/types/CoachingTypes';
import { useBackendHelpers } from 'src/hooks/useBackend';

interface RecentRecords {
  assignments: Assignment[];
  privateCalls: PrivateCall[];
  groupSessions: GroupSession[];
}

export default function useCoachingDashboardBackend() {
  const { getFactory } = useBackendHelpers();

  const getRecentRecords = (coachEmail: string | undefined) => {
    if (!coachEmail) return undefined;
    return getFactory<RecentRecords>(`coaching/recent-records/${coachEmail}`);
  };

  return { getRecentRecords };
}
