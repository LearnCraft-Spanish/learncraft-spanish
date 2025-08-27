import type { Flashcard } from 'src/types/interfaceDefinitions';

import {
  cleanup,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';
import { sampleStudentFlashcardData } from 'tests/mockData';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { SRSButtons } from './SRSButtons';

// vi.mock('src/hooks/useStudentFlashcards', () => {
//   return {
//     useStudentFlashcards: () => ({
//       flashcardDataQuery: { data: sampleStudentFlashcardData },
//       updateFlashcardMutation: { mutate: vi.fn() },
//     }),
//   };
// });
// These examples could be defined in a better way
const currentExample: Flashcard = { ...sampleStudentFlashcardData.examples[0] };

const currentExampleEasy: Flashcard = { ...currentExample, difficulty: 'easy' };

const currentExampleHard: Flashcard = { ...currentExample, difficulty: 'hard' };

// const incrementExampleNumber = vi.fn(() => {})
let incrementExampleNumber = vi.fn();

describe('component SRSButtons', () => {
  beforeAll(() => {
    incrementExampleNumber = vi.fn(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('example difficulty is labeled easy, displays Labeled: easy', () => {
    render(
      <MockAllProviders>
        <SRSButtons
          currentExample={currentExampleEasy}
          answerShowing={false}
          incrementExampleNumber={incrementExampleNumber}
        />
      </MockAllProviders>,
    );
    expect(screen.getByText('Labeled: Easy')).toBeTruthy();
  });
  it('example difficulty is labeled hard, displays Labeled: Hard', async () => {
    render(
      <MockAllProviders>
        <SRSButtons
          currentExample={currentExampleHard}
          answerShowing={false}
          incrementExampleNumber={incrementExampleNumber}
        />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('Labeled: Hard')).toBeTruthy();
    });
  });

  it('answer showing and no difficulty set, shows setting buttons', async () => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isStudent: true,
      },
      {
        isOwnUser: true,
      },
    );
    render(
      <MockAllProviders>
        <SRSButtons
          currentExample={currentExample}
          answerShowing
          incrementExampleNumber={incrementExampleNumber}
        />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('This was easy')).toBeTruthy();
      expect(screen.getByText('This was hard')).toBeTruthy();
    });
  });

  /*
  Future Testing:
  - Test the onClick events for the buttons (unsure how to do it currently, as the functions passed in are called withen the component's own functions)
  */
  describe('onClick functions', () => {
    it('increaseDifficulty', async () => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
          isStudent: true,
        },
        {
          isOwnUser: true,
        },
      );
      const { result } = renderHook(() => useStudentFlashcards(), {
        wrapper: MockAllProviders,
      });
      await waitFor(() =>
        expect(result.current.flashcardDataQuery.isSuccess).toBe(true),
      );
      const example = result.current.flashcardDataQuery.data?.examples[0];
      if (!example) {
        throw new Error('example not found for test setup');
      }
      render(
        <MockAllProviders>
          <SRSButtons
            currentExample={example}
            answerShowing
            incrementExampleNumber={incrementExampleNumber}
          />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText('This was easy')).toBeTruthy();
      });
      screen.getByText('This was easy').click();
      expect(incrementExampleNumber).toHaveBeenCalled();
    });
    it('decreaseDifficulty', async () => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
          isStudent: true,
        },
        {
          isOwnUser: true,
        },
      );
      const { result } = renderHook(() => useStudentFlashcards(), {
        wrapper: MockAllProviders,
      });
      await waitFor(() =>
        expect(result.current.flashcardDataQuery.isSuccess).toBe(true),
      );
      const example = result.current.flashcardDataQuery.data?.examples[0];
      if (!example) {
        throw new Error('example not found for test setup');
      }
      render(
        <MockAllProviders>
          <SRSButtons
            currentExample={example}
            answerShowing
            incrementExampleNumber={incrementExampleNumber}
          />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText('This was hard')).toBeTruthy();
      });
      screen.getByText('This was hard').click();
      expect(incrementExampleNumber).toHaveBeenCalled();
    });
  });
  describe('handing of undefined values', () => {
    it('doesnt call incrementExample when error finding relatedExample', async () => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
          isStudent: true,
        },
        {
          isOwnUser: true,
        },
      );
      render(
        <MockAllProviders>
          <SRSButtons
            currentExample={{ ...currentExample, recordId: 999 }}
            answerShowing
            incrementExampleNumber={incrementExampleNumber}
          />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText('This was easy')).toBeTruthy();
      });
      screen.getByText('This was easy').click();
      expect(incrementExampleNumber).not.toHaveBeenCalled();
      screen.getByText('This was hard').click();
      expect(incrementExampleNumber).not.toHaveBeenCalled();
    });
  });
});
