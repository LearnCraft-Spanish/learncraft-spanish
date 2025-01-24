import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { setupMockAuth } from 'tests/setupMockAuth';
import MyFlashcardsQuiz from './ReviewMyFlashcards';

describe('menu for student flashcards', () => {
  it('shows three setting options', async () => {
    render(
      <MockAllProviders route="/myflashcards">
        <MyFlashcardsQuiz />
      </MockAllProviders>,
    );
    // wait for the menu to load
    await waitFor(() => {
      expect(screen.getByText(/srs quiz/i)).toBeInTheDocument();
      expect(screen.getByText(/start with spanish/i)).toBeInTheDocument();
      expect(screen.getByText(/custom only/i)).toBeInTheDocument();
      expect(screen.getByText(/number of flashcards/i)).toBeInTheDocument();
    });
  });
  it('shows start quiz button', async () => {
    render(
      <MockAllProviders route="/myflashcards" childRoutes>
        <MyFlashcardsQuiz />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText(/start quiz/i)).toBeInTheDocument();
    });
  });
  it('shows menu button', async () => {
    render(
      <MockAllProviders route="/myflashcards" childRoutes>
        <MyFlashcardsQuiz />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText(/back to home/i)).toBeInTheDocument();
    });
  });

  describe('no flashcards found', () => {
    beforeEach(() => {
      setupMockAuth({ userName: 'student-no-flashcards' });
    });
    it('shows no flashcards found message', async () => {
      render(
        <MockAllProviders route="/myflashcards" childRoutes>
          <MyFlashcardsQuiz />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(/no flashcards found/i)).toBeInTheDocument();
      });
    });
  });
});
