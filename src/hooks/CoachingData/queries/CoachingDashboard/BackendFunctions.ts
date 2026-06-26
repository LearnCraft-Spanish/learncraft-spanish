import type {
  Assignment,
  GroupSession,
  PrivateCall,
} from 'src/types/CoachingTypes';
// import { useBackendHelpers } from 'src/hooks/useBackend';

interface RecentRecords {
  assignments: Assignment[];
  privateCalls: PrivateCall[];
  groupSessions: GroupSession[];
}

export default function useCoachingDashboardBackend() {
  // const { getFactory } = useBackendHelpers();

  const getRecentRecords = async (
    _coachName: string | undefined,
    _monthYear: string,
  ): Promise<RecentRecords | undefined> => {
    throw new Error('This feature is not available at this time.');
    // if (!_coachName) return undefined;
    // const data = await getFactory<RecentRecords>(`coaching/recent-records/?coachName=${_coachName}&monthYear=${_monthYear}`);
    // data.privateCalls.sort((a, b) => {
    //   const aFirstName = a.weekName.split(' ')[0];
    //   const bFirstName = b.weekName.split(' ')[0];
    //   return aFirstName.localeCompare(bFirstName);
    // });
    // return data;
  };

  return { getRecentRecords };
}
