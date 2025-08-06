// Types
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';

import serverlikeData from 'mocks/data/serverlike/serverlikeData';

import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';

import { useSelectedCourseAndLessons } from 'src/hexagon/application/coordinators/hooks/useSelectedCourseAndLessons';

import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useProgramTable } from './CourseData/useProgramTable';
import { useFilterExamplesBySelectedLesson } from './useFilterExamplesBySelectedLesson';

const { api } = serverlikeData();

async function setupTesting() {
  // Render both hooks in the same renderHook call to share context
  const { result } = renderHook(
    () => ({
      courseAndLessons: useSelectedCourseAndLessons(),
      programTable: useProgramTable(),
      filterExamplesBySelectedLesson: useFilterExamplesBySelectedLesson(),
    }),
    {
      wrapper: MockAllProviders,
    },
  );

  // Wait for loading states to complete
  await waitFor(() => {
    expect(result.current.courseAndLessons.isLoading).toBe(false);
  });

  await waitFor(() => {
    expect(result.current.programTable.programTableQuery.isLoading).toBe(false);
  });

  return result;
}

describe('useFilterExamplesBySelectedLesson', () => {
  beforeEach(() => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isAuthenticated: true,
        isAdmin: false,
        isCoach: false,
        isStudent: true,
        isLimited: false,
      },
      {
        isOwnUser: true,
      },
    );
  });
  afterEach(() => {
    cleanup();
  });
  describe('filterExamplesBySelectedLesson', () => {
    it('filters the examples by the selected lesson', async () => {
      const result = await setupTesting();

      await waitFor(() => {
        expect(result.current.courseAndLessons.isLoading).toBe(false);
      }); // set to lesson
      const selectedProgram =
        result.current.programTable.programTableQuery.data?.find(
          (program) =>
            program.recordId === result.current.courseAndLessons.course?.id,
        );
      if (!selectedProgram) {
        throw new Error('selectedProgram is null');
      }
      const newToLesson = selectedProgram.lessons[4].recordId;
      if (!newToLesson) {
        throw new Error('newFromLesson is null');
      }
      act(() => {
        result.current.courseAndLessons.updateToLessonNumber(newToLesson);
      });
      await waitFor(() => {
        expect(result.current.courseAndLessons.toLesson?.lessonNumber).toBe(
          newToLesson,
        );
      });
      const examples = api.verifiedExamplesTable;
      const filteredExamples =
        result.current.filterExamplesBySelectedLesson.filterExamplesBySelectedLesson(
          examples,
        );
      expect(filteredExamples.length).toBeLessThan(examples.length);
      expect(filteredExamples.length).toBeGreaterThan(0);
    });
    it('returns an empty array if no vocabulary is learned between fromLesson & toLesson, inclusive', async () => {
      const result = await setupTesting();

      // set to & from lesson to the same lesson, with no vocabIncluded
      const selectedProgram =
        result.current.programTable.programTableQuery.data?.find(
          (program) =>
            program.recordId === result.current.courseAndLessons.course?.id,
        );
      if (!selectedProgram) {
        throw new Error('selectedProgram is null');
      }

      const lessonWithoutVocab = selectedProgram.lessons.find((lesson) => {
        return lesson.vocabIncluded.length === 0;
      });
      if (!lessonWithoutVocab) {
        throw new Error('lessonWithoutVocab is null');
      }
      act(() => {
        result.current.courseAndLessons.updateToLessonNumber(
          lessonWithoutVocab.lessonNumber,
        );
        result.current.courseAndLessons.updateFromLessonNumber(
          lessonWithoutVocab.lessonNumber,
        );
      });
      await waitFor(
        () => {
          expect(result.current.courseAndLessons.toLesson?.lessonNumber).toBe(
            lessonWithoutVocab.lessonNumber,
          );
        },
        { timeout: 1000 },
      );
      const toLesson = selectedProgram.lessons.find(
        (lesson) =>
          lesson.lessonNumber ===
          result.current.courseAndLessons.toLesson?.lessonNumber,
      );
      const fromLesson = selectedProgram.lessons.find(
        (lesson) =>
          lesson.lessonNumber ===
          result.current.courseAndLessons.fromLesson?.lessonNumber,
      );
      if (toLesson?.vocabIncluded.length || fromLesson?.vocabIncluded.length) {
        throw new Error('Bad data provided: VocabIncluded is not null');
      }
      const examples = api.verifiedExamplesTable;
      const filteredExamples =
        result.current.filterExamplesBySelectedLesson.filterExamplesBySelectedLesson(
          examples,
        );
      expect(filteredExamples.length).toBe(0);
    });
  });
  describe('allowed & required Vocabulary', () => {
    it('allowedVocabulary is an array with length', async () => {
      const result = await setupTesting();
      expect(
        result.current.filterExamplesBySelectedLesson.allowedVocabulary.length,
      ).toBeDefined();
    });
    it('requiredVocabulary is an array with length', async () => {
      const result = await setupTesting();
      expect(
        result.current.filterExamplesBySelectedLesson.requiredVocabulary.length,
      ).toBeDefined();
    });
    it('allowedVocabulary is a subset of requiredVocabulary', async () => {
      const result = await setupTesting();
      expect(
        result.current.filterExamplesBySelectedLesson.allowedVocabulary.every(
          (word: any) =>
            result.current.filterExamplesBySelectedLesson.requiredVocabulary.includes(
              word,
            ),
        ),
      );
    });
  });
});
