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

  const getRecentRecords = (coachName: string | undefined, month: string) => {
    if (!coachName) return undefined;
    return getFactory<RecentRecords>(
      `coaching/recent-records/?coachName=${coachName}&month=${month}`,
    );
  };

  return { getRecentRecords };
}
