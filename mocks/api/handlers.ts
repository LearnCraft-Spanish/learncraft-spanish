import type { DefaultBodyType, StrictRequest } from 'msw';
import { HttpResponse, http } from 'msw';
import type { UserData } from 'src/types/interfaceDefinitions';
import newData from '../data/serverlike/serverlikeData';
import { generatedMockData } from '../data/serverlike/studentRecords/studentRecordsMockData';
import allStudentFlashcards from '../data/hooklike/studentFlashcardData';
import {
  allUsersTable,
  getUserDataFromName,
} from '../data/serverlike/userTable';

// import mockDataHardCoded from '../data/serverlike/studentRecords/studentRecordsMockData';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const apiData = newData().api;

function getEmailFromRequest(request: StrictRequest<DefaultBodyType>) {
  const fakeToken = request.headers.get('Authorization');
  const tokenParts = fakeToken?.split(' ');
  const emailAddress = tokenParts?.[1];
  if (!emailAddress) {
    throw new Error('Email address not found in token');
  }
  return emailAddress;
}

export const handlers = [
  http.get(`${backendUrl}public/programs`, () => {
    return HttpResponse.json(apiData.programsTable);
  }),

  http.get(`${backendUrl}public/lessons`, () => {
    return HttpResponse.json(apiData.lessonsTable);
  }),

  http.get(`${backendUrl}public/vocabulary`, () => {
    return HttpResponse.json(apiData.vocabularyTable);
  }),

  http.get(`${backendUrl}public/spellings`, () => {
    return HttpResponse.json(apiData.spellingsTable);
  }),

  http.get(`${backendUrl}public/verified-examples`, () => {
    return HttpResponse.json(apiData.verifiedExamplesTable);
  }),

  http.get(`${backendUrl}public/quizzes`, () => {
    return HttpResponse.json(apiData.quizzesTable);
  }),

  http.get(`${backendUrl}public/quizExamples/:quizId`, ({ params }) => {
    const paramString = params.quizId;
    const quizObject = apiData.quizzesTable.find((quiz) => {
      return quiz.recordId === Number(paramString);
    });
    if (!quizObject) {
      throw new Error('Quiz not found');
    }
    const quizExamplesObject = apiData.quizExamplesTableArray.find(
      (quizExamples) => {
        return quizExamples.quizNickname === quizObject.quizNickname;
      },
    );
    if (!quizExamplesObject) {
      throw new Error('Quiz examples not found');
    }
    const quizExamples = quizExamplesObject.quizExamplesTable;
    if (!quizExamples) {
      throw new Error('Quiz examples not found');
    }
    return HttpResponse.json(quizExamples);
  }),

  http.get(`${backendUrl}my-data`, ({ request }) => {
    const email = getEmailFromRequest(request);
    const student = allUsersTable.find(
      (student: UserData) => student.emailAddress === email,
    );
    return HttpResponse.json(student);
  }),

  http.get(`${backendUrl}all-students`, () => {
    return HttpResponse.json(apiData.allStudentsTable);
  }),

  http.get(`${backendUrl}unverified-examples`, () => {
    return HttpResponse.json(apiData.verifiedExamplesTable);
  }),

  http.get(`${backendUrl}recently-edited-examples`, () => {
    return HttpResponse.json(apiData.verifiedExamplesTable);
  }),

  http.get(`${backendUrl}single-example/:exampleId`, ({ params }) => {
    const exampleId = params.exampleId;
    const foundExample = apiData.verifiedExamplesTable.find((example) => {
      return example.recordId === Number(exampleId);
    });
    if (!foundExample) {
      throw new Error('Example not found');
    }
    return HttpResponse.json(foundExample);
  }),

  http.get(`${backendUrl}my-examples`, ({ request }) => {
    //Placeholder: We will fetch for different students soon
    const email = getEmailFromRequest(request);
    const studentFlashcards = allStudentFlashcards.find((student) => {
      return student.emailAddress === email;
    });
    if (!studentFlashcards) {
      throw new Error('Student not found');
    }
    return HttpResponse.json(studentFlashcards.studentFlashcardData);
  }),

  http.get(`${backendUrl}public/audio-examples`, () => {
    return HttpResponse.json(apiData.audioExamplesTable);
  }),

  // Get Active Examples of a student
  http.get(`${backendUrl}:studentId/examples`, ({ params, request }) => {
    // current temporary implementation, gets student-admin flashcard data, only flashcard data defined
    const studentId = params.studentId;
    const studentIdNumber = Number(studentId);
    if (!studentIdNumber) {
      throw new Error('Student not found');
    }
    const email = getEmailFromRequest(request);
    const studentFlashcards = allStudentFlashcards.find((student) => {
      return student.emailAddress === email;
    });
    if (!studentFlashcards) {
      throw new Error('Student not found');
    }
    return HttpResponse.json(studentFlashcards.studentFlashcardData);
  }),

  // Post Requests
  http.post(`${backendUrl}create-my-student-example`, async ({ request }) => {
    const exampleId = request.headers.get('exampleid');
    if (exampleId === '-1') {
      return HttpResponse.json('0');
    }
    const newRecordId = Math.floor(Math.random() * 1000);
    return HttpResponse.json([newRecordId]);
  }),

  http.post(`${backendUrl}create-student-example`, async ({ request }) => {
    const exampleId = request.headers.get('exampleid');
    const studentId = request.headers.get('studentid');
    if (exampleId === '-1' || studentId === '-1') {
      return HttpResponse.json('0');
    }
    const newRecordId = Math.floor(Math.random() * 1000);
    return HttpResponse.json([newRecordId]);
  }),

  http.post(`${backendUrl}update-my-student-example`, async ({ request }) => {
    const updateId = request.headers.get('updateid');
    if (updateId === '-1') {
      return HttpResponse.json('0');
    }
    return HttpResponse.json(updateId);
  }),
  http.post(`${backendUrl}update-student-example`, async ({ request }) => {
    const updateId = request.headers.get('updateid');
    if (updateId === '-1') {
      return HttpResponse.json('0');
    }
    return HttpResponse.json(updateId);
  }),

  // Delete Requests
  http.delete(`${backendUrl}delete-my-student-example`, async ({ request }) => {
    const exampleId = request.headers.get('deleteid');
    if (exampleId === '-1') {
      return HttpResponse.json('0');
    }
    return HttpResponse.json('1');
  }),

  http.delete(`${backendUrl}delete-student-example`, async ({ request }) => {
    const exampleId = request.headers.get('deleteid');
    if (exampleId === '-1') {
      return HttpResponse.json('0');
    }
    return HttpResponse.json('1');
  }),

  // TEMPORARY routes to silence warnings in console.
  // I will update these to be proper routes for testing
  // As I add testing to PMF data
  http.get(`${backendUrl}pmf/:studentId`, async ({ params }) => {
    const param = params.studentId as string;
    const studentId = Number.parseInt(param);
    if (getUserDataFromName('student-lcsp')?.recordId === studentId) {
      return HttpResponse.json({
        lastContactDate: new Date().toISOString(),
      });
    } else if (
      getUserDataFromName('student-ser-estar')?.recordId === studentId
    ) {
      return HttpResponse.json({
        lastContactDate: new Date(Date.now() - 7776000000).toISOString(),
      });
    }
    return HttpResponse.json('');
  }),
  http.post(`${backendUrl}pmf/create`, async () => {
    return HttpResponse.json(1);
  }),
  http.post(`${backendUrl}pmf/update`, async () => {
    return HttpResponse.json(1);
  }),

  // Coaching
  http.get(`${backendUrl}coaching/weeks`, async () => {
    return HttpResponse.json(generatedMockData.weeks);
  }),
  http.get(`${backendUrl}coaching/coaches`, async () => {
    return HttpResponse.json(generatedMockData.coachList);
  }),
  http.get(`${backendUrl}coaching/courses`, async () => {
    return HttpResponse.json(generatedMockData.courseList);
  }),
  http.get(`${backendUrl}coaching/active-memberships`, async () => {
    return HttpResponse.json(generatedMockData.memberships);
  }),
  http.get(`${backendUrl}coaching/active-students`, async () => {
    return HttpResponse.json(generatedMockData.studentList);
  }),
  http.get(`${backendUrl}coaching/group-sessions`, async () => {
    return HttpResponse.json(generatedMockData.groupSessions);
  }),
  http.get(`${backendUrl}coaching/group-attendees`, async () => {
    return HttpResponse.json(generatedMockData.groupAttendees);
  }),
  http.get(`${backendUrl}coaching/assignments`, async () => {
    return HttpResponse.json(generatedMockData.assignments);
  }),
  http.get(`${backendUrl}coaching/private-calls`, async () => {
    return HttpResponse.json(generatedMockData.calls);
  }),
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
];
