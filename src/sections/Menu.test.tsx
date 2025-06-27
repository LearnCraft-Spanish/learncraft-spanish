import type { AppUser } from '@LearnCraft-Spanish/shared';
import type {
  TestUserEmails,
  TestUserNames,
} from 'mocks/data/serverlike/userTable';
import type { AuthUser } from 'src/hexagon/application/ports/authPort';

import { render, screen, waitFor } from '@testing-library/react';
import {
  appUserTable,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';
import { overrideMockAuthAdapter } from 'src/hexagon/application/adapters/authAdapter.mock';
import { overrideMockActiveStudent } from 'src/hexagon/application/coordinators/hooks/useActiveStudent.mock';
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
      overrideMockAuthAdapter({ isLoading: true });
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
      appUser: AppUser;
      authUser: AuthUser;
    }[] = [];

    appUserTable.forEach((user) => {
      const roles = [];
      if (user.studentRole) {
        roles.push(user.studentRole);
      }
      userCases.push({
        name: user.name as TestUserNames,
        roles,
        appUser: user,
        authUser: getAuthUserFromEmail(
          user.emailAddress as TestUserEmails,
        ) as AuthUser,
      });
    });

    userCases.forEach((userCase) => {
      describe(`case: ${userCase.name}`, () => {
        beforeEach(() => {
          overrideMockActiveStudent({
            appUser: userCase.appUser,
          });
          overrideMockAuthAdapter({
            authUser: userCase.authUser,
          });
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

        // Get Help (students only)
        const hasGetHelp =
          userCase.roles.includes('student') &&
          !userCase.roles.includes('admin') &&
          !userCase.roles.includes('coach');
        it(`${hasGetHelp ? 'does' : 'does NOT'} render "Need Help?"`, async () => {
          await renderMenuLoaded();
          if (hasGetHelp) {
            expect(screen.getByText('Need Help?')).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Need Help?')).toBeNull();
          }
        });

        // General Staff Tools
        const hasCoachingTools =
          userCase.roles.includes('admin') || userCase.roles.includes('coach');

        it(`${hasCoachingTools ? 'does' : 'does NOT'} render coaching tools`, async () => {
          await renderMenuLoaded();
          if (hasCoachingTools) {
            expect(screen.queryByText('Coaching Tools')).toBeInTheDocument();
            expect(screen.queryByText('FrequenSay')).toBeInTheDocument();
            expect(
              screen.queryByText('Weekly Records Interface'),
            ).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Coaching Tools')).toBeNull();
            expect(screen.queryByText('FrequenSay')).toBeNull();
            expect(screen.queryByText('Weekly Records Interface')).toBeNull();
          }
        });

        // Admin Staff Tools
        const hasAdminStaffTools = userCase.roles.includes('admin');

        it(`${hasAdminStaffTools ? 'does' : 'does NOT'} render admin specific staff tools`, async () => {
          await renderMenuLoaded();
          if (hasAdminStaffTools) {
            expect(screen.queryByText('Example Manager')).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Example Manager')).toBeNull();
          }
        });
      });
    });
  });
});
