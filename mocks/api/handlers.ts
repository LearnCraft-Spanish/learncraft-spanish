import { CourseWithLessonsSchema } from '@learncraft-spanish/shared';
import { http, HttpResponse } from 'msw';

import { generatedMockData } from '../data/serverlike/studentRecords/studentRecordsMockData';
import { appUserTable, getAppUserFromName } from '../data/serverlike/userTable';

// import mockDataHardCoded from '../data/serverlike/studentRecords/studentRecordsMockData';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const handlers = [
  // kinda used, but wrong path
  http.get(`${backendUrl}coaching/all-students`, () => {
    return HttpResponse.json(appUserTable);
  }),

  http.get(`${backendUrl}pmf/:studentId`, async ({ params }) => {
    const param = params.studentId as string;
    const studentId = Number.parseInt(param);
    if (getAppUserFromName('student-lcsp')?.recordId === studentId) {
      return HttpResponse.json({
        id: 1,
        relatedStudent: studentId,
        lastContactDate: new Date().toISOString(),
        hasTakenSurvey: false,
      });
    } else if (
      getAppUserFromName('student-ser-estar')?.recordId === studentId
    ) {
      return HttpResponse.json({
        id: 2,
        relatedStudent: studentId,
        lastContactDate: new Date(Date.now() - 7776000000).toISOString(),
        hasTakenSurvey: false,
      });
    }
    return HttpResponse.json(null);
  }),
  http.post(`${backendUrl}pmf/create`, async ({ request }) => {
    const body = (await request.json()) as {
      studentId: number;
      hasTakenSurvey: boolean;
    };
    return HttpResponse.json({
      id: 1,
      relatedStudent: body.studentId,
      lastContactDate: new Date().toISOString(),
      hasTakenSurvey: body.hasTakenSurvey,
    });
  }),
  http.post(`${backendUrl}pmf/update`, async ({ request }) => {
    const body = (await request.json()) as {
      recordId: number;
      studentId: number;
      hasTakenSurvey: boolean;
    };
    return HttpResponse.json({
      id: body.recordId,
      relatedStudent: body.studentId,
      lastContactDate: new Date().toISOString(),
      hasTakenSurvey: body.hasTakenSurvey,
    });
  }),

  // Coaching
  http.get(
    `${backendUrl}coaching/weeks/:startDate.:endDate`,
    async ({ params }) => {
      const startDate = params.startDate as string;
      const endDate = params.endDate as string;
      if (!startDate || !endDate) {
        return HttpResponse.json([]);
      }
      const filteredWeeks = generatedMockData.weeks.filter((week) => {
        const weekDate = new Date(week.weekStarts);
        return weekDate >= new Date(startDate) && weekDate <= new Date(endDate);
      });
      return HttpResponse.json(filteredWeeks);
    },
  ),

  http.get(
    `${backendUrl}coaching/assignments/:startDate.:endDate`,
    async ({ params }) => {
      const startDate = params.startDate as string;
      const endDate = params.endDate as string;
      if (!startDate || !endDate) {
        return HttpResponse.json([]);
      }
      const filteredAssignments = generatedMockData.assignments.filter(
        (assignment) => {
          const assignmentDate = new Date(assignment.weekStarts);
          return (
            assignmentDate >= new Date(startDate) &&
            assignmentDate <= new Date(endDate)
          );
        },
      );
      return HttpResponse.json(filteredAssignments);
    },
  ),

  http.get(
    `${backendUrl}coaching/private-calls/:startDate.:endDate`,
    async ({ params }) => {
      const startDate = params.startDate as string;
      const endDate = params.endDate as string;
      if (!startDate || !endDate) {
        return HttpResponse.json([]);
      }
      const filteredCalls = generatedMockData.calls.filter((call) => {
        const callDate = new Date(call.date);
        return callDate >= new Date(startDate) && callDate <= new Date(endDate);
      });
      return HttpResponse.json(filteredCalls);
    },
  ),

  http.get(
    `${backendUrl}coaching/group-sessions/:startDate.:endDate`,
    async ({ params }) => {
      const startDate = params.startDate as string;
      const endDate = params.endDate as string;
      if (!startDate || !endDate) {
        return HttpResponse.json([]);
      }
      const filteredSessions = generatedMockData.groupSessions.filter(
        (session) => {
          const sessionDate = new Date(session.date);
          return (
            sessionDate >= new Date(startDate) &&
            sessionDate <= new Date(endDate)
          );
        },
      );
      return HttpResponse.json(filteredSessions);
    },
  ),

  http.get(
    `${backendUrl}coaching/group-attendees/:startDate.:endDate`,
    async ({ params }) => {
      const startDate = params.startDate as string;
      const endDate = params.endDate as string;
      if (!startDate || !endDate) {
        return HttpResponse.json([]);
      }
      const filteredAttendees = generatedMockData.groupAttendees.filter(
        (attendee) => {
          const session = generatedMockData.groupSessions.find(
            (s) => s.recordId === attendee.groupSession,
          );
          if (!session) return false;
          const sessionDate = new Date(session.date);
          return (
            sessionDate >= new Date(startDate) &&
            sessionDate <= new Date(endDate)
          );
        },
      );
      return HttpResponse.json(filteredAttendees);
    },
  ),

  // Keep existing handlers for other coaching routes
  http.get(`${backendUrl}coaching/coaches`, async () => {
    return HttpResponse.json(generatedMockData.coachList);
  }),
  http.get(`${backendUrl}coaching/courses`, async () => {
    return HttpResponse.json(generatedMockData.courseList);
  }),
  http.get(
    `${backendUrl}coaching/active-memberships/:startDate.:endDate`,
    async () => {
      return HttpResponse.json(generatedMockData.memberships);
    },
  ),
  http.get(
    `${backendUrl}coaching/active-students:startDate.:endDate`,
    async () => {
      return HttpResponse.json(generatedMockData.studentList);
    },
  ),
  // TEMP, to get current tests to run
  http.get(`${backendUrl}coaching/lessons`, async () => {
    return HttpResponse.json([]);
  }),
  http.get(
    `${backendUrl}coaching/group-sessions/topic-field-options`,
    async () => {
      return HttpResponse.json([]);
    },
  ),

  http.get(`/api/courses-with-lessons`, () => {
    return HttpResponse.json(
      CourseWithLessonsSchema.parse(generatedMockData.courseList),
    );
  }),
];
