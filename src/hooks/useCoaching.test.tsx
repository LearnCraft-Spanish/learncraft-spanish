import { act } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { ar } from 'vitest/dist/chunks/reporters.anwo7Y6a';
import serverlikeData from '../../mocks/data/serverlike/serverlikeData';
import type { QuizExamplesTable, QuizUnparsed } from '../interfaceDefinitions';
import MockAllProviders from '../../mocks/Providers/MockAllProviders';
import { setupMockAuth } from '../../tests/setupMockAuth';
import mockDataHardCoded from '../../mocks/data/serverlike/studentRecords/studentRecordsMockData';
import useCoaching from './useCoaching';

describe('hook useCoaching', () => {
  it('renders without crashing', async () => {
    const { result } = renderHook(() => useCoaching(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
  });
  describe('queries exist, with data', () => {
    const listOfQueries = [
      'activeMembershipsQuery',
      'activeStudentsQuery',
      'coachListQuery',
      'courseListQuery',
      'lastThreeWeeksQuery',
      'groupSessionsQuery',
      'groupAttendeesQuery',
      'assignmentsQuery',
      'callsQuery',
    ];
    for (const query of listOfQueries) {
      it(`query ${query} exists and has data`, async () => {
        const { result } = renderHook(() => useCoaching(), {
          wrapper: MockAllProviders,
        });
        await waitFor(() => {
          // @ts-expect-error - I dont want to add type safety to this bandaid of a test
          expect(result.current[query].isSuccess).toBeTruthy();
          // @ts-expect-error - I dont want to add type safety to this bandaid of a test
          expect(result.current[query].data.length).toBeGreaterThan(0);
        });
      });
    }
  });
  describe('helper functions exist & work', () => {
    const listOfFunctions = [
      {
        func: 'getCoachFromMembershipId',
        arg: mockDataHardCoded.lastThreeWeeks[0].relatedMembership,
        expected: mockDataHardCoded.coachList[0],
      },
      {
        func: 'getCourseFromMembershipId',
        arg: mockDataHardCoded.lastThreeWeeks[0].relatedMembership,
        expected: mockDataHardCoded.courseList[0],
      },
      {
        func: 'getStudentFromMembershipId',
        arg: mockDataHardCoded.lastThreeWeeks[0].relatedMembership,
        expected: mockDataHardCoded.activeStudents[0],
      },
      {
        func: 'getAttendeeWeeksFromGroupSessionId',
        arg: mockDataHardCoded.groupSessions[0].recordId,
        expected: [mockDataHardCoded.lastThreeWeeks[0]],
      },
      {
        func: 'getGroupSessionFromWeekRecordId',
        arg: mockDataHardCoded.lastThreeWeeks[0].recordId,
        expected: mockDataHardCoded.groupSessions[0],
      },
      {
        func: 'getAssignmentsFromWeekRecordId',
        arg: mockDataHardCoded.lastThreeWeeks[0].recordId,
        expected: mockDataHardCoded.assignments.filter(
          (assignment) =>
            assignment.relatedWeek ===
            mockDataHardCoded.lastThreeWeeks[0].recordId,
        ),
      },
      {
        func: 'getMembershipFromWeekRecordId',
        arg: mockDataHardCoded.lastThreeWeeks[0].recordId,
        expected: mockDataHardCoded.activeMemberships.find(
          (membership) =>
            membership.recordId ===
            mockDataHardCoded.lastThreeWeeks[0].relatedMembership,
        ),
      },
      {
        func: 'getPrivateCallsFromWeekRecordId',
        arg: mockDataHardCoded.lastThreeWeeks[0].recordId,
        expected: mockDataHardCoded.calls.filter(
          (call) =>
            call.relatedWeek === mockDataHardCoded.lastThreeWeeks[0].recordId,
        ),
      },
      {
        func: 'dateObjectToText',
        arg: new Date(2024, 10, 25),
        expected: '2024-10-25',
      },
    ];
    for (const func of listOfFunctions) {
      it(`function ${func.func} exists and works`, async () => {
        const { result } = renderHook(() => useCoaching(), {
          wrapper: MockAllProviders,
        });
        await waitFor(() => {
          // @ts-expect-error - I dont want to add type safety to this bandaid of a test
          expect(result.current[func.func]).toBeDefined();
          // @ts-expect-error - I dont want to add type safety to this bandaid of a test
          expect(result.current[func.func](func.arg)).toStrictEqual(
            func.expected,
          );
        });
      });
    }
  });
});
