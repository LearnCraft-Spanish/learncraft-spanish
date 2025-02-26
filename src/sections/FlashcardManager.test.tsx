import { render, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';

import { setupMockAuth } from 'tests/setupMockAuth';
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
      setupMockAuth({ userName: 'student-no-flashcards' });
    });
    it('shows no flashcards found message', async () => {
      render(<FlashcardManager />, { wrapper: MockAllProviders });
      await waitFor(() => {
        expect(screen.getByText(/no flashcards found/i)).toBeInTheDocument();
      });
    });
  });
});
