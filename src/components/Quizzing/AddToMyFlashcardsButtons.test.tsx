import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import allStudentFlashcards from 'mocks/data/hooklike/studentFlashcardData';
import serverlikeData from 'mocks/data/serverlike/serverlikeData';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { act } from 'react';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddToMyFlashcardsButtons from './AddToMyFlashcardsButtons';
/*      Testing Setup       */
const verifiedExamplesTable = serverlikeData().api.verifiedExamplesTable;
const studentWithFlashcards = allStudentFlashcards.find(
  (student) => student.userName === 'student-lcsp',
);
const collectedFlashcard =
  studentWithFlashcards?.studentFlashcardData.examples[0];
const notCollectedFlashcard = verifiedExamplesTable.find(
  (example) =>
    !studentWithFlashcards?.studentFlashcardData.examples.includes(example),
);

/**
 * NEXT STEPS: For Blake 12/12
 *  - refactor any parents that use addToMyFlashcardsButtons to allow the child to handle conditionally rendering itself if it makes sense?
 */
describe('component AddToMyFlashcardsButtons', () => {
  describe('user is student', () => {
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
    it('flashcard is collected: shows "Remove from my flashcards"', async () => {
      render(
        <MockAllProviders>
          <AddToMyFlashcardsButtons
            example={collectedFlashcard}
            incrementExampleNumber={() => {}}
            onRemove={() => {}}
          />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(/remove/i)).toBeInTheDocument();
      });
    });
    it('flashcard is NOT collected: shows "Add To My Flashcards"', async () => {
      render(
        <MockAllProviders>
          <AddToMyFlashcardsButtons
            example={notCollectedFlashcard}
            incrementExampleNumber={() => {}}
            onRemove={() => {}}
          />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(/add /i)).toBeInTheDocument();
      });
    });
    it.skip('when adding a flashcard (after clicking add): shows "Adding to Flashcards..."', async () => {
      // believed to be a limitation of the mock server
      // becuase we are adding, but the server is not actually adding
      // so the status gets reverted? after the optomistic update
      const incrementExampleFunction = vi.fn();
      render(
        <MockAllProviders>
          <AddToMyFlashcardsButtons
            example={notCollectedFlashcard}
            incrementExampleNumber={incrementExampleFunction}
            onRemove={() => {}}
          />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(/add to my flashcards/i)).toBeInTheDocument();
      });

      act(() => {
        fireEvent.click(screen.getByText(/add to my flashcards/i));
      });
      await waitFor(
        () => {
          expect(incrementExampleFunction).toHaveBeenCalled();
          expect(screen.getByText(/adding/i)).toBeInTheDocument();
        },
        { interval: 3 },
      );
    });
  });

  describe('user is NOT student', () => {
    beforeEach(() => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('limited@fake.not')!,
          isAuthenticated: true,
          isAdmin: false,
          isCoach: false,
          isStudent: false,
          isLimited: true,
        },
        {
          isOwnUser: true,
        },
      );
    });
    it('does not display any buttons', async () => {
      render(
        <MockAllProviders>
          <AddToMyFlashcardsButtons
            example={collectedFlashcard}
            incrementExampleNumber={() => {}}
            onRemove={() => {}}
          />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.queryByText(/remove/i)).toBeNull();
        expect(screen.queryByText(/add/i)).toBeNull();
        expect(screen.queryByText(/adding/i)).toBeNull();
      });
    });
  });
});
