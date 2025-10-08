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

  const getRecentRecords = async (
    coachName: string | undefined,
    monthYear: string,
  ) => {
    if (!coachName) return undefined;
    const data = await getFactory<RecentRecords>(
      `coaching/recent-records/?coachName=${coachName}&monthYear=${monthYear}`,
    );
    // sort private calls by student name. we will use the weekName field. a weekName is a string that can look like "Sam Barton Standard: Private-Only Week 23. lets sort by splitting it, grabbing the first name, then comparing"
    data.privateCalls.sort((a, b) => {
      const aFirstName = a.weekName.split(' ')[0];
      const bFirstName = b.weekName.split(' ')[0];
      return aFirstName.localeCompare(bFirstName);
    });
    return data;
  };

  return { getRecentRecords };
}
