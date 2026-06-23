import type { QueryFunctionContext } from '@tanstack/react-query';
import type * as StudentRecordsTypes from 'src/types/CoachingTypes';
// import { useBackendHelpers } from '../../useBackend';

export default function useStudentRecordsBackend() {
  // const { getFactory } = useBackendHelpers();

  function getWeeks(
    _ctx: QueryFunctionContext<
      [string, { startDate: string | undefined; endDate: string | undefined }]
    >,
  ): Promise<StudentRecordsTypes.Week[]> {
    throw new Error('This feature is not available at this time.');
    // const [, { startDate, endDate }] = _ctx.queryKey;
    // if (!startDate || !endDate) { return Promise.resolve([]); }
    // return getFactory(`coaching/weeks/${startDate}.${endDate}`);
  }

  function getAssignments(
    _ctx: QueryFunctionContext<
      [string, { startDate: string | undefined; endDate: string | undefined }]
    >,
  ): Promise<StudentRecordsTypes.Assignment[]> {
    throw new Error('This feature is not available at this time.');
    // const [, { startDate, endDate }] = _ctx.queryKey;
    // if (!startDate || !endDate) { return Promise.resolve([]); }
    // return getFactory(`coaching/assignments/${startDate}.${endDate}`);
  }

  function getPrivateCalls(
    _ctx: QueryFunctionContext<
      [string, { startDate: string | undefined; endDate: string | undefined }]
    >,
  ): Promise<StudentRecordsTypes.PrivateCall[]> {
    throw new Error('This feature is not available at this time.');
    // const [, { startDate, endDate }] = _ctx.queryKey;
    // if (!startDate || !endDate) { return Promise.resolve([]); }
    // return getFactory(`coaching/private-calls/${startDate}.${endDate}`);
  }

  function getGroupSessions(
    _ctx: QueryFunctionContext<
      [string, { startDate: string | undefined; endDate: string | undefined }]
    >,
  ): Promise<StudentRecordsTypes.GroupSession[]> {
    throw new Error('This feature is not available at this time.');
    // const [, { startDate, endDate }] = _ctx.queryKey;
    // if (!startDate || !endDate) { return Promise.resolve([]); }
    // return getFactory(`coaching/group-sessions/${startDate}.${endDate}`);
  }

  function getGroupAttendees(
    _ctx: QueryFunctionContext<
      [string, { startDate: string | undefined; endDate: string | undefined }]
    >,
  ): Promise<StudentRecordsTypes.GroupAttendees[]> {
    throw new Error('This feature is not available at this time.');
    // const [, { startDate, endDate }] = _ctx.queryKey;
    // if (!startDate || !endDate) { return Promise.resolve([]); }
    // return getFactory(`coaching/group-attendees/${startDate}.${endDate}`);
  }

  return {
    getWeeks,
    getAssignments,
    getPrivateCalls,
    getGroupSessions,
    getGroupAttendees,
  };
}
