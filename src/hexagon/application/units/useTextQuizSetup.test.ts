import type { Flashcard } from '@learncraft-spanish/shared';
import { overrideMockUseStudentFlashcards } from '@application/units/useStudentFlashcards.mock';
import { useTextQuizSetup } from '@application/units/useTextQuizSetup';
import { act, renderHook } from '@testing-library/react';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * Who is logged in vs. who is the active student decides two things here:
 * - `canAccessSRS`: the SRS toggle is offered whenever the active user is a
 *   student quizzing their own flashcards — same rule for students, coaches
 *   and admins.
 * - `isSrsProgressTracked`: review progress is only saved when the logged-in
 *   user IS the active student (`isOwnUser`).
 */

function setUpStudentViewingSelf(): void {
  overrideAuthAndAppUser(
    {
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isStudent: true,
    },
    { isOwnUser: true },
  );
}

function setUpCoachUsingAppAsStudent(): void {
  overrideAuthAndAppUser(
    {
      authUser: getAuthUserFromEmail('empty-role@fake.not')!,
      isCoach: true,
    },
    {
      appUser: getAppUserFromEmail('student-lcsp@fake.not'),
      isOwnUser: false,
    },
  );
}

function setUpAdminUsingAppAsStudent(): void {
  overrideAuthAndAppUser(
    {
      authUser: getAuthUserFromEmail('admin-empty-role@fake.not')!,
      isAdmin: true,
    },
    {
      appUser: getAppUserFromEmail('student-lcsp@fake.not'),
      isOwnUser: false,
    },
  );
}

function setUpAdminWhoIsTheActiveStudent(): void {
  overrideAuthAndAppUser(
    {
      authUser: getAuthUserFromEmail('student-admin@fake.not')!,
      isAdmin: true,
      isStudent: true,
    },
    { isOwnUser: true },
  );
}

describe('useTextQuizSetup', () => {
  let flashcards: Flashcard[];
  let dueFlashcards: Flashcard[];

  beforeEach(() => {
    // Explicit ids: the factory does not guarantee unique example ids.
    flashcards = createMockFlashcardList()(3).map((flashcard, index) => ({
      ...flashcard,
      id: index + 1,
      custom: false,
      example: { ...flashcard.example, id: index + 101 },
    }));
    dueFlashcards = [flashcards[0]];
    overrideMockUseStudentFlashcards({
      flashcards,
      flashcardsDueForReview: dueFlashcards,
      customFlashcards: [],
      customFlashcardsDueForReview: [],
      isLoading: false,
      error: null,
    });
  });

  function renderSetup(ownedOnly = true) {
    return renderHook(() =>
      useTextQuizSetup({
        examples: flashcards.map((flashcard) => flashcard.example),
        ownedOnly,
      }),
    );
  }

  describe('a student quizzing their own flashcards', () => {
    beforeEach(setUpStudentViewingSelf);

    it('offers SRS, tracks progress, and starts with SRS on', () => {
      const { result } = renderSetup();

      expect(result.current.canAccessSRS).toBe(true);
      expect(result.current.isSrsProgressTracked).toBe(true);
      expect(result.current.srsQuiz).toBe(true);
    });

    it('draws only flashcards due for review while SRS is on', () => {
      const { result } = renderSetup();

      expect(result.current.examplesToQuiz.map((e) => e.id)).toEqual([
        dueFlashcards[0].example.id,
      ]);
    });
  });

  describe('a coach using the app as another student', () => {
    beforeEach(setUpCoachUsingAppAsStudent);

    it('offers SRS but does not track progress', () => {
      const { result } = renderSetup();

      expect(result.current.canAccessSRS).toBe(true);
      expect(result.current.isSrsProgressTracked).toBe(false);
    });

    it('starts with SRS off', () => {
      const { result } = renderSetup();

      expect(result.current.srsQuiz).toBe(false);
    });

    it("draws the student's due flashcards once SRS is switched on", () => {
      const { result } = renderSetup();

      act(() => {
        result.current.setSrsQuiz(true);
      });

      expect(result.current.srsQuiz).toBe(true);
      expect(result.current.examplesToQuiz.map((e) => e.id)).toEqual([
        dueFlashcards[0].example.id,
      ]);
    });
  });

  describe('an admin using the app as another student', () => {
    beforeEach(setUpAdminUsingAppAsStudent);

    it('offers SRS, does not track progress, and starts with SRS off', () => {
      const { result } = renderSetup();

      expect(result.current.canAccessSRS).toBe(true);
      expect(result.current.isSrsProgressTracked).toBe(false);
      expect(result.current.srsQuiz).toBe(false);
    });
  });

  describe('an admin who is also the active student', () => {
    beforeEach(setUpAdminWhoIsTheActiveStudent);

    it('offers SRS, tracks progress, and starts with SRS on', () => {
      const { result } = renderSetup();

      expect(result.current.canAccessSRS).toBe(true);
      expect(result.current.isSrsProgressTracked).toBe(true);
      expect(result.current.srsQuiz).toBe(true);
    });
  });

  describe('when SRS is not available', () => {
    it('hides SRS when the active user is not a student', () => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('admin-empty-role@fake.not')!,
          isAdmin: true,
        },
        { isOwnUser: true },
      );

      const { result } = renderSetup();

      expect(result.current.canAccessSRS).toBe(false);
      expect(result.current.srsQuiz).toBe(false);
    });

    it('hides SRS outside of the owned-flashcards quiz', () => {
      setUpCoachUsingAppAsStudent();

      const { result } = renderSetup(false);

      expect(result.current.canAccessSRS).toBe(false);
    });

    it('surfaces a flashcards error', () => {
      setUpStudentViewingSelf();
      const error = new Error('flashcards failed');
      overrideMockUseStudentFlashcards({ error });

      const { result } = renderSetup();

      expect(result.current.error).toBe(error);
    });
  });
});
