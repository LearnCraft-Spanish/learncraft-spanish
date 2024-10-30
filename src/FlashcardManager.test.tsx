import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import MockAllProviders from '../mocks/Providers/MockAllProviders';
import FlashcardManager from './FlashcardManager';

/*
  Add test to check if removeAndUpdate is called on click
  once useStudentFlashcardStub is created
*/

describe('component FlashcardManager', () => {
  it('renders without crashing, student has flashcards', async () => {
    render(<FlashcardManager />, { wrapper: MockAllProviders });
    await waitFor(() =>
      expect(screen.getByText('Flashcard Manager')).toBeInTheDocument(),
    );
    expect(screen.getByText('Flashcard Manager')).toBeInTheDocument();
    expect(screen.getByText(/total flashcards:/i)).toBeInTheDocument();
  });
});
