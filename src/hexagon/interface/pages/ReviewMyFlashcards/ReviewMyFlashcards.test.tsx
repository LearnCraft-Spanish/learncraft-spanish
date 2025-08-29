import { overrideMockFlashcardAdapter } from '@application/adapters/flashcardAdapter.mock';
import { render, screen, waitFor } from '@testing-library/react';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';
import { createMockFlashcardList } from 'src/hexagon/testing/factories/flashcardFactory';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { beforeEach, describe, expect, it } from 'vitest';
import MyFlashcardsQuiz from './ReviewMyFlashcards';

describe('menu for student flashcards', () => {
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

    overrideMockFlashcardAdapter({
      getMyFlashcards: () =>
        Promise.resolve(createMockFlashcardList(5)(5, { custom: true })),
      getStudentFlashcards: () =>
        Promise.resolve(createMockFlashcardList(5)(5, { custom: true })),
    });
  });
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
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-no-flashcards@fake.not')!,
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

      // Mock empty flashcards for the no-flashcards student
      overrideMockFlashcardAdapter({
        getMyFlashcards: () => Promise.resolve([]),
        getStudentFlashcards: () => Promise.resolve([]),
      });
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
