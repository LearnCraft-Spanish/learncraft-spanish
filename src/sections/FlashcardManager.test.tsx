import { render, screen, waitFor } from '@testing-library/react';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { beforeEach, describe, expect, it } from 'vitest';
import FlashcardManager from './FlashcardManager';

/*
  Add test to check if removeAndUpdate is called on click
  once useStudentFlashcardStub is created
*/

// Also needs tests to check that sort order is correct

describe('component FlashcardManager', () => {
  it('renders without crashing, student has flashcards', async () => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isLoading: false,
      },
      {
        isOwnUser: true,
      },
    );
    render(<FlashcardManager />, { wrapper: MockAllProviders });
    await waitFor(() =>
      expect(screen.getByText('Flashcard Manager')).toBeInTheDocument(),
    );
    expect(screen.getByText('Flashcard Manager')).toBeInTheDocument();
  });
  describe('no flashcards found', () => {
    beforeEach(() => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-no-flashcards@fake.not')!,
          isAuthenticated: true,
          isStudent: true,
          isAdmin: false,
          isCoach: false,
          isLimited: false,
        },
        {
          isOwnUser: true,
        },
      );
    });
    it('shows no flashcards found message', async () => {
      render(<FlashcardManager />, { wrapper: MockAllProviders });
      await waitFor(() => {
        expect(screen.getByText(/no flashcards found/i)).toBeInTheDocument();
      });
    });
  });
});
