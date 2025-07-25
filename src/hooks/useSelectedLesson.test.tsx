// Types
// import type { AppUser } from '@LearnCraft-Spanish/shared';
// import { act, cleanup, renderHook, waitFor } from '@testing-library/react';

// import programsTable from 'mocks/data/hooklike/programsTable';
// import serverlikeData from 'mocks/data/serverlike/serverlikeData';

// import {
//   getAppUserFromName,
//   getAuthUserFromEmail,
// } from 'mocks/data/serverlike/userTable';
// import MockAllProviders from 'mocks/Providers/MockAllProviders';

// import MockQueryClientProvider from 'mocks/Providers/MockQueryClient';

// import { overrideMockAuthAdapter } from 'src/hexagon/application/adapters/authAdapter.mock';
// import { useSelectedCourseAndLessons } from 'src/hexagon/application/coordinators/hooks/useSelectedCourseAndLessons';
// import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

// const { api } = serverlikeData();

describe.skip('useSelectedLesson', () => {
  //   let student: AppUser | null;
  //   beforeEach(() => {
  //     overrideMockAuthAdapter({
  //       authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
  //       isAuthenticated: true,
  //       isAdmin: false,
  //       isCoach: false,
  //       isStudent: true,
  //       isLimited: false,
  //     });
  //     student = getAppUserFromName('student-lcsp');
  //   });
  //   afterEach(() => {
  //     cleanup();
  //   });
  //   describe.skip('filterExamplesBySelectedLesson', () => {
  //     it('filters the examples by the selected lesson', async () => {
  //       const result = await renderSelectedLesson();
  //       // set to lesson
  //       const program = result.current.selectedProgram;
  //       const newToLesson = program?.lessons[4].recordId;
  //       if (!newToLesson) {
  //         throw new Error('newFromLesson is null');
  //       }
  //       act(() => {
  //         result.current.setToLesson(newToLesson);
  //       });
  //       await waitFor(() => {
  //         expect(result.current.selectedToLesson?.recordId).toBe(newToLesson);
  //       });
  //       const examples = api.verifiedExamplesTable;
  //       const filteredExamples =
  //         result.current.filterExamplesBySelectedLesson(examples);
  //       expect(filteredExamples.length).toBeLessThan(examples.length);
  //       expect(filteredExamples.length).toBeGreaterThan(0);
  //     });
  //     it('returns an empty array if no vocabulary is learned between fromLesson & toLesson, inclusive', async () => {
  //       const result = await renderSelectedLesson();
  //       // set to & from lesson to the same lesson, with no vocabIncluded
  //       const program = result.current.selectedProgram;
  //       const lessonWithoutVocab = program?.lessons.find(
  //         (lesson) => lesson.vocabIncluded.length === 0,
  //       );
  //       if (!lessonWithoutVocab) {
  //         throw new Error('lessonWithoutVocab is null');
  //       }
  //       act(() => {
  //         result.current.setToLesson(lessonWithoutVocab.recordId);
  //         result.current.setFromLesson(lessonWithoutVocab.recordId);
  //       });
  //       await waitFor(
  //         () => {
  //           expect(result.current.selectedToLesson?.recordId).toBe(
  //             lessonWithoutVocab.recordId,
  //           );
  //         },
  //         { timeout: 1000 },
  //       );
  //       if (
  //         result.current.selectedToLesson?.vocabIncluded.length ||
  //         result.current.selectedFromLesson?.vocabIncluded.length
  //       ) {
  //         throw new Error('Bad data provided: VocabIncluded is not null');
  //       }
  //       const examples = api.verifiedExamplesTable;
  //       const filteredExamples =
  //         result.current.filterExamplesBySelectedLesson(examples);
  //       expect(filteredExamples.length).toBe(0);
  //     });
  //   });
  //   describe('allowed & required Vocabulary', async () => {
  //     // set up the the tests
  //     let res: any;
  //     beforeAll(async () => {
  //       const { result } = renderHook(() => useSelectedCourseAndLessons(), {
  //         wrapper: MockAllProviders,
  //       });
  //       await waitFor(() => {
  //         expect(result.current.course).not.toBeNull();
  //       });
  //       res = result;
  //       if (!result.current.course) {
  //         throw new Error('course is null');
  //       }
  //       result.current.updateFromLessonId(result.current.course.lessons[0].id);
  //       await waitFor(() => {
  //         expect(result.current.fromLesson).not.toBeNull();
  //       });
  //     });
  //     it('allowedVocabulary is an array with length', () => {
  //       expect(res.current.allowedVocabulary.length).toBeDefined();
  //     });
  //     it('requiredVocabulary is an array with length', () => {
  //       expect(res.current.requiredVocabulary.length).toBeDefined();
  //     });
  //     it('allowedVocabulary is a subset of requiredVocabulary', () => {
  //       expect(
  //         res.current.allowedVocabulary.every((word: any) =>
  //           res.current.requiredVocabulary.includes(word),
  //         ),
  //       );
  //     });
  //   });
});
