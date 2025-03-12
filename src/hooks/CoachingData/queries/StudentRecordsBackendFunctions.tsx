import type { QueryFunctionContext } from '@tanstack/react-query';
import type * as StudentRecordsTypes from 'src/types/CoachingTypes';
import { useBackendHelpers } from '../../useBackend';

export default function useStudentRecordsBackend() {
  const { getFactory } = useBackendHelpers();

  function getWeeks({
    queryKey,
  }: QueryFunctionContext<
    [string, { startDate: string | undefined; endDate: string | undefined }]
  >): Promise<StudentRecordsTypes.Week[]> {
    const [, { startDate, endDate }] = queryKey;

    if (!startDate || !endDate) {
      return Promise.resolve([]);
    }
    return getFactory(`coaching/weeks/${startDate}.${endDate}`);
  }

  function getAssignments({
    queryKey,
  }: QueryFunctionContext<
    [string, { startDate: string | undefined; endDate: string | undefined }]
  >): Promise<StudentRecordsTypes.Assignment[]> {
    const [, { startDate, endDate }] = queryKey;

    if (!startDate || !endDate) {
      return Promise.resolve([]);
    }
    return getFactory(`coaching/assignments/${startDate}.${endDate}`);
  }

  function getPrivateCalls({
    queryKey,
  }: QueryFunctionContext<
    [string, { startDate: string | undefined; endDate: string | undefined }]
  >): Promise<StudentRecordsTypes.PrivateCall[]> {
    const [, { startDate, endDate }] = queryKey;

    if (!startDate || !endDate) {
      return Promise.resolve([]);
    }
    return getFactory(`coaching/private-calls/${startDate}.${endDate}`);
  }

  function getGroupSessions({
    queryKey,
  }: QueryFunctionContext<
    [string, { startDate: string | undefined; endDate: string | undefined }]
  >): Promise<StudentRecordsTypes.GroupSession[]> {
    const [, { startDate, endDate }] = queryKey;

    if (!startDate || !endDate) {
      return Promise.resolve([]);
    }
    return getFactory(`coaching/group-sessions/${startDate}.${endDate}`);
  }

  function getGroupAttendees({
    queryKey,
  }: QueryFunctionContext<
    [string, { startDate: string | undefined; endDate: string | undefined }]
  >): Promise<StudentRecordsTypes.GroupAttendees[]> {
    const [, { startDate, endDate }] = queryKey;

    if (!startDate || !endDate) {
      return Promise.resolve([]);
    }
    return getFactory(`coaching/group-attendees/${startDate}.${endDate}`);
  }

  return {
    getWeeks,
    getAssignments,
    getPrivateCalls,
    getGroupSessions,
    getGroupAttendees,
  };
}
