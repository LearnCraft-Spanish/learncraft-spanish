// Types
import type { AppUser } from '@LearnCraft-Spanish/shared';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';

import programsTable from 'mocks/data/hooklike/programsTable';
import serverlikeData from 'mocks/data/serverlike/serverlikeData';

import {
  getAppUserFromName,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';

import MockQueryClientProvider from 'mocks/Providers/MockQueryClient';

import { overrideMockAuthAdapter } from 'src/hexagon/application/adapters/authAdapter.mock';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { useSelectedLesson } from './useSelectedLesson';

const { api } = serverlikeData();

async function renderSelectedLesson() {
  const { result } = renderHook(() => useSelectedLesson(), {
    wrapper: MockQueryClientProvider,
  });
  await waitFor(() => expect(result.current.selectedProgram).not.toBeNull());
  return result;
}

describe('useSelectedLesson', () => {
  let student: AppUser | null;

  beforeEach(() => {
    overrideMockAuthAdapter({
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAuthenticated: true,
      isAdmin: false,
      isCoach: false,
      isStudent: true,
      isLimited: false,
    });
    student = getAppUserFromName('student-lcsp');
  });

  afterEach(() => {
    cleanup();
  });

  describe('initial state', () => {
    it("selectedProgram is userData's related program", async () => {
      const result = await renderSelectedLesson();
      expect(result.current.selectedProgram?.recordId).toBe(student?.courseId);
    });
    it('selectedFromLesson is null in selectedProgram', async () => {
      const result = await renderSelectedLesson();
      expect(result.current.selectedFromLesson).toBe(null);
    });
    it('selectedToLesson is NOT null', async () => {
      const result = await renderSelectedLesson();
      expect(result.current.selectedToLesson).not.toBeNull();
    });
  });

  describe('setProgram', () => {
    it('sets the selected program', async () => {
      const result = await renderSelectedLesson();
      const newProgram = programsTable[programsTable.length - 1].recordId;
      // newProgram is not the current program
      expect(result.current.selectedProgram?.recordId).not.toBe(newProgram);
      // Set new program
      act(() => result.current.setProgram(newProgram.toString()));
      await waitFor(() => {
        expect(result.current.selectedProgram).not.toBeNull();
      });
      expect(result.current.selectedProgram?.recordId).toBe(newProgram);
      // Make sure fromLesson is reset
      expect(result.current.selectedFromLesson?.recordId).toBe(undefined);
      // should be active lesson
      expect(result.current.selectedToLesson?.recordId).toBeDefined();
    });
  });

  describe('setFromLesson', () => {
    it('sets the selected from lesson', async () => {
      const result = await renderSelectedLesson();
      // check original value
      expect(result.current.selectedFromLesson).toBeDefined();
      const currentProgram = result.current.selectedProgram;
      if (!currentProgram) {
        throw new Error('currentProgram is null');
      }
      const newFromLesson = currentProgram?.lessons[1].recordId;
      result.current.setFromLesson(newFromLesson.toString());
      await waitFor(() => {
        expect(result.current.selectedFromLesson).not.toBeNull();
      });
      expect(result.current.selectedFromLesson?.recordId).toBe(newFromLesson);
    });
  });

  describe('setToLesson', () => {
    it('sets the selected to lesson', async () => {
      const { result } = renderHook(() => useSelectedLesson(), {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() => {
        expect(result.current.selectedProgram).not.toBeNull();
      });
      // check original value
      expect(result.current.selectedToLesson).not.toBeNull();
      const currentProgram = result.current.selectedProgram;
      if (!currentProgram) {
        throw new Error('currentProgram is null');
      }
      const newToLesson = currentProgram.lessons[1].recordId;
      act(() => {
        result.current.setToLesson(newToLesson.toString());
      });
      await waitFor(() => {
        expect(result.current.selectedToLesson).not.toBeNull();
      });
      expect(result.current.selectedToLesson?.recordId).toBe(newToLesson);
    });
  });

  describe('filterExamplesBySelectedLesson', () => {
    it('filters the examples by the selected lesson', async () => {
      const result = await renderSelectedLesson();
      // set to lesson
      const program = result.current.selectedProgram;
      const newToLesson = program?.lessons[4].recordId;
      if (!newToLesson) {
        throw new Error('newFromLesson is null');
      }
      act(() => {
        result.current.setToLesson(newToLesson);
      });
      await waitFor(() => {
        expect(result.current.selectedToLesson?.recordId).toBe(newToLesson);
      });

      const examples = api.verifiedExamplesTable;
      const filteredExamples =
        result.current.filterExamplesBySelectedLesson(examples);
      expect(filteredExamples.length).toBeLessThan(examples.length);
      expect(filteredExamples.length).toBeGreaterThan(0);
    });
    it('returns an empty array if no vocabulary is learned between fromLesson & toLesson, inclusive', async () => {
      const result = await renderSelectedLesson();
      // set to & from lesson to the same lesson, with no vocabIncluded
      const program = result.current.selectedProgram;
      const lessonWithoutVocab = program?.lessons.find(
        (lesson) => lesson.vocabIncluded.length === 0,
      );
      if (!lessonWithoutVocab) {
        throw new Error('lessonWithoutVocab is null');
      }
      act(() => {
        result.current.setToLesson(lessonWithoutVocab.recordId);
        result.current.setFromLesson(lessonWithoutVocab.recordId);
      });
      await waitFor(
        () => {
          expect(result.current.selectedToLesson?.recordId).toBe(
            lessonWithoutVocab.recordId,
          );
        },
        { timeout: 1000 },
      );
      if (
        result.current.selectedToLesson?.vocabIncluded.length ||
        result.current.selectedFromLesson?.vocabIncluded.length
      ) {
        throw new Error('Bad data provided: VocabIncluded is not null');
      }
      const examples = api.verifiedExamplesTable;
      const filteredExamples =
        result.current.filterExamplesBySelectedLesson(examples);
      expect(filteredExamples.length).toBe(0);
    });
  });

  describe('allowed & required Vocabulary', async () => {
    // set up the the tests
    let res: any;
    beforeAll(async () => {
      const { result } = renderHook(() => useSelectedLesson(), {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() => {
        expect(result.current.selectedProgram).not.toBeNull();
      });
      res = result;
      if (!result.current.selectedProgram) {
        throw new Error('selectedProgram is null');
      }
      result.current.setFromLesson(
        result.current.selectedProgram.lessons[0].recordId,
      );
      await waitFor(() => {
        expect(result.current.selectedFromLesson).not.toBeNull();
      });
    });

    it('allowedVocabulary is an array with length', () => {
      expect(res.current.allowedVocabulary.length).toBeDefined();
    });
    it('requiredVocabulary is an array with length', () => {
      expect(res.current.requiredVocabulary.length).toBeDefined();
    });
    it('allowedVocabulary is a subset of requiredVocabulary', () => {
      expect(
        res.current.allowedVocabulary.every((word: any) =>
          res.current.requiredVocabulary.includes(word),
        ),
      );
    });
  });
});
