import { render, screen, waitFor } from '@testing-library/react';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { overrideMockAuthAdapter } from 'src/hexagon/application/adapters/authAdapter.mock';
import { beforeEach, describe, expect, it } from 'vitest';
import FlashcardManager from './FlashcardManager';

/*
  Add test to check if removeAndUpdate is called on click
  once useStudentFlashcardStub is created
*/

// Also needs tests to check that sort order is correct

describe('component FlashcardManager', () => {
  it('renders without crashing, student has flashcards', async () => {
    render(<FlashcardManager />, { wrapper: MockAllProviders });
    await waitFor(() =>
      expect(screen.getByText('Flashcard Manager')).toBeInTheDocument(),
    );
    expect(screen.getByText('Flashcard Manager')).toBeInTheDocument();
  });
  describe('no flashcards found', () => {
    beforeEach(() => {
      overrideMockAuthAdapter({
        authUser: getAuthUserFromEmail('student-no-flashcards@fake.not')!,
        isAuthenticated: true,
        isAdmin: false,
        isCoach: false,
        isStudent: true,
        isLimited: false,
      });
    });
    it('shows no flashcards found message', async () => {
      render(<FlashcardManager />, { wrapper: MockAllProviders });
      await waitFor(() => {
        expect(screen.getByText(/no flashcards found/i)).toBeInTheDocument();
      });
    });
  });
});
