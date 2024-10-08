import { HttpResponse, http } from "msw";
import flashcardData from "../data/serverlike/mockStudentFlashcardData.json";
import newData from "../data/serverlike/serverlikeData";

const studentFlashcardData = flashcardData.studentFlashcardData;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const apiData = newData().api;

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
      throw new Error("Quiz not found");
    }
    const quizExamplesObject = apiData.quizExamplesTableArray.find(
      (quizExamples) => {
        return quizExamples.quizNickname === quizObject.quizNickname;
      },
    );
    if (!quizExamplesObject) {
      throw new Error("Quiz examples not found");
    }
    const quizExamples = quizExamplesObject.quizExamplesTable;
    if (!quizExamples) {
      throw new Error("Quiz examples not found");
    }
    return HttpResponse.json(quizExamples);
  }),

  http.get(`${backendUrl}my-data`, () => {
    return HttpResponse.json(apiData.allStudentsTable[0]);
  }),

  http.get(`${backendUrl}all-students`, () => {
    return HttpResponse.json(apiData.allStudentsTable);
  }),

  http.get(`${backendUrl}my-examples`, () => {
    return HttpResponse.json(studentFlashcardData);
  }),

  http.get(`${backendUrl}public/audio-examples`, () => {
    return HttpResponse.json(apiData.audioExamplesTable);
  }),

  // Post Requests
  http.post(`${backendUrl}create-my-student-example`, async ({ request }) => {
    const exampleId = request.headers.get("exampleid");
    if (exampleId === "-1") {
      return HttpResponse.json("0");
    }
    return HttpResponse.json("1");
  }),

  http.post(`${backendUrl}create-student-example`, async ({ request }) => {
    const exampleId = request.headers.get("exampleid");
    const studentId = request.headers.get("studentid");
    if (exampleId === "-1" || studentId === "-1") {
      return HttpResponse.json("0");
    }
    return HttpResponse.json("1");
  }),

  http.post(`${backendUrl}update-my-student-example`, async ({ request }) => {
    const updateId = request.headers.get("updateid");
    if (updateId === "-1") {
      return HttpResponse.json("0");
    }
    return HttpResponse.json(updateId);
  }),
  http.post(`${backendUrl}update-student-example`, async ({ request }) => {
    const updateId = request.headers.get("updateid");
    if (updateId === "-1") {
      return HttpResponse.json("0");
    }
    return HttpResponse.json(updateId);
  }),

  // Delete Requests
  http.delete(`${backendUrl}delete-my-student-example`, async ({ request }) => {
    const exampleId = request.headers.get("deleteid");
    if (exampleId === "-1") {
      return HttpResponse.json("0");
    }
    return HttpResponse.json("1");
  }),

  http.delete(`${backendUrl}delete-student-example`, async ({ request }) => {
    const exampleId = request.headers.get("deleteid");
    if (exampleId === "-1") {
      return HttpResponse.json("0");
    }
    return HttpResponse.json("1");
  }),
];
