import type { TestUserNames } from 'mocks/data/serverlike/userTable';
import { render, screen, waitFor } from '@testing-library/react';
import { allUsersTable } from 'mocks/data/serverlike/userTable';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';

import { setupMockAuth } from 'tests/setupMockAuth';
import { beforeEach, describe, expect, it } from 'vitest';
import Menu from './Menu';

// Helper Functions
async function renderMenuLoaded() {
  render(
    <MockAllProviders>
      <Menu />
    </MockAllProviders>,
  );
  // wait for the menu to load
  await waitFor(() => {
    expect(screen.queryByText('Official Quizzes')).toBeInTheDocument();
  });
}

describe('component Menu', () => {
  describe('loading', () => {
    beforeEach(() => {
      setupMockAuth({ isLoading: true });
    });
    it('render "Loading Menu..."', async () => {
      render(
        <MockAllProviders>
          <Menu />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText('Loading Menu...')).toBeInTheDocument();
      });
      expect(screen.getByText('Loading Menu...')).toBeInTheDocument();
    });
  });

  describe('roles', () => {
    const userCases: {
      name: TestUserNames;
      roles: string[];
    }[] = [];

    allUsersTable.forEach((user) => {
      const roles = [];
      if (user.roles.studentRole) {
        roles.push(user.roles.studentRole);
      }
      if (user.roles.adminRole) {
        roles.push(user.roles.adminRole);
      }
      userCases.push({
        name: user.name as TestUserNames,
        roles,
      });
    });

    userCases.forEach((userCase) => {
      describe(`case: ${userCase.name}`, () => {
        beforeEach(() => {
          setupMockAuth({ userName: userCase.name });
        });

        // My Flashcards
        const hasMyFlashcards = userCase.roles.includes('student');
        it(`${hasMyFlashcards ? 'does' : 'does NOT'} render "My Flashcards" section`, async () => {
          await renderMenuLoaded();
          if (hasMyFlashcards) {
            expect(screen.getByText('My Flashcards:')).toBeInTheDocument();
          } else {
            expect(screen.queryByText('My Flashcards:')).toBeNull();
          }
        });

        // Offficial Quizzes
        it('renders Official Quizzes', async () => {
          await renderMenuLoaded();
          expect(screen.getByText('Official Quizzes')).toBeInTheDocument();
        });

        // Audio Quizzing
        const hasAudioQuizzing =
          userCase.roles.includes('student') ||
          userCase.roles.includes('limited') ||
          userCase.roles.includes('admin') ||
          userCase.roles.includes('coach');

        it(`${hasAudioQuizzing ? 'does' : 'does NOT'} render "Audio Quiz"`, async () => {
          await renderMenuLoaded();
          if (hasAudioQuizzing) {
            expect(screen.getByText('Audio Quiz')).toBeInTheDocument();
            expect(screen.getByText('Comprehension Quiz')).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Audio Quiz')).toBeNull();
            expect(screen.queryByText('Comprehension Quiz')).toBeNull();
          }
        });

        // Find Flashcards
        const hasFindFlashcards =
          userCase.roles.includes('student') ||
          userCase.roles.includes('admin') ||
          userCase.roles.includes('coach');

        it(`${hasFindFlashcards ? 'does' : 'does NOT'} render "Find Flashcards"`, async () => {
          await renderMenuLoaded();
          if (hasFindFlashcards) {
            expect(screen.getByText('Find Flashcards')).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Find Flashcards')).toBeNull();
          }
        });

        // General Staff Tools
        const hasGeneralStaffTools =
          userCase.roles.includes('admin') || userCase.roles.includes('coach');

        it(`${hasGeneralStaffTools ? 'does' : 'does NOT'} render general staff tools`, async () => {
          await renderMenuLoaded();
          if (hasGeneralStaffTools) {
            expect(screen.queryByText('Staff Tools')).toBeInTheDocument();
            expect(screen.queryByText('FrequenSay')).toBeInTheDocument();
            expect(
              screen.queryByText('Weekly Records Interface'),
            ).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Staff Tools')).toBeNull();
            expect(screen.queryByText('FrequenSay')).toBeNull();
            expect(screen.queryByText('Weekly Records Interface')).toBeNull();
          }
        });

        // Admin Staff Tools
        const hasAdminStaffTools = userCase.roles.includes('admin');

        it(`${hasAdminStaffTools ? 'does' : 'does NOT'} render admin specific staff tools`, async () => {
          await renderMenuLoaded();
          if (hasAdminStaffTools) {
            expect(screen.queryByText('Example Creator')).toBeInTheDocument();
            expect(screen.queryByText('Example Editor')).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Example Creator')).toBeNull();
            expect(screen.queryByText('Example Editor')).toBeNull();
          }
        });
      });
    });
  });
});
