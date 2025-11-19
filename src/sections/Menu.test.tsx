import type { AppUser } from '@learncraft-spanish/shared';
import type {
  TestUserEmail,
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
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
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
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
          isLoading: true,
        },
        { isOwnUser: true },
      );
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
          user.emailAddress as TestUserEmail,
        ) as AuthUser,
      });
    });

    userCases.forEach((userCase) => {
      describe(`case: ${userCase.name}`, () => {
        beforeEach(() => {
          overrideAuthAndAppUser(
            {
              authUser: userCase.authUser,
              isStudent: userCase.roles.includes('student'),
              isAdmin: userCase.authUser.roles.includes('Admin'),
              isCoach: userCase.authUser.roles.includes('Coach'),
              isLimited: userCase.roles.includes('limited'),
            },
            {
              isOwnUser: true,
            },
          );
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

        // Audio Quiz (only for limited users)
        const hasAudioQuiz = userCase.roles.includes('limited');

        it(`${hasAudioQuiz ? 'does' : 'does NOT'} render "Audio Quiz"`, async () => {
          await renderMenuLoaded();
          if (hasAudioQuiz) {
            expect(screen.getByText('Audio Quiz')).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Audio Quiz')).toBeNull();
          }
        });

        // Find Flashcards
        const hasFindFlashcards =
          userCase.roles.includes('student') ||
          userCase.authUser.roles.includes('Admin') ||
          userCase.authUser.roles.includes('Coach');

        it(`${hasFindFlashcards ? 'does' : 'does NOT'} render "Find Flashcards"`, async () => {
          await renderMenuLoaded();
          if (hasFindFlashcards) {
            expect(screen.getByText('Find Flashcards')).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Find Flashcards')).toBeNull();
          }
        });

        // Get Help (students only - not admin or coach)
        const hasGetHelp =
          userCase.roles.includes('student') &&
          !userCase.authUser.roles.includes('Admin') &&
          !userCase.authUser.roles.includes('Coach');
        it(`${hasGetHelp ? 'does' : 'does NOT'} render "Need Help?"`, async () => {
          await renderMenuLoaded();
          if (hasGetHelp) {
            expect(screen.getByText('Need Help?')).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Need Help?')).toBeNull();
          }
        });

        // Custom Quiz (students, admin, coach - but NOT limited)
        const hasCustomQuiz =
          userCase.roles.includes('student') ||
          userCase.authUser.roles.includes('Admin') ||
          userCase.authUser.roles.includes('Coach');
        it(`${hasCustomQuiz ? 'does' : 'does NOT'} render "Custom Quiz"`, async () => {
          await renderMenuLoaded();
          if (hasCustomQuiz) {
            expect(screen.getByText('Custom Quiz')).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Custom Quiz')).toBeNull();
          }
        });

        // General Staff Tools
        const hasCoachingTools =
          userCase.authUser.roles.includes('Admin') ||
          userCase.authUser.roles.includes('Coach');

        it(`${hasCoachingTools ? 'does' : 'does NOT'} render coaching tools`, async () => {
          await renderMenuLoaded();
          if (hasCoachingTools) {
            expect(screen.queryByText('Coaching Tools')).toBeInTheDocument();
            expect(screen.queryByText('FrequenSay')).toBeInTheDocument();
            expect(
              screen.queryByText('Weekly Records Interface'),
            ).toBeInTheDocument();
            expect(
              screen.queryByText('Student Drill Down'),
            ).toBeInTheDocument();
            expect(
              screen.queryByText('Coaching Dashboard'),
            ).toBeInTheDocument();
            expect(screen.queryByText('Get Help')).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Coaching Tools')).toBeNull();
            expect(screen.queryByText('FrequenSay')).toBeNull();
            expect(screen.queryByText('Weekly Records Interface')).toBeNull();
            expect(screen.queryByText('Student Drill Down')).toBeNull();
            expect(screen.queryByText('Coaching Dashboard')).toBeNull();
            expect(screen.queryByText('Get Help')).toBeNull();
          }
        });

        // Admin Staff Tools
        const hasAdminStaffTools = userCase.authUser.roles.includes('Admin');

        it(`${hasAdminStaffTools ? 'does' : 'does NOT'} render admin specific staff tools`, async () => {
          await renderMenuLoaded();
          if (hasAdminStaffTools) {
            expect(screen.queryByText('Admin Tools')).toBeInTheDocument();
            expect(screen.queryByText('Admin Dashboard')).toBeInTheDocument();
            expect(screen.queryByText('Example Manager')).toBeInTheDocument();
            expect(screen.queryByText('Database Tables')).toBeInTheDocument();
            expect(screen.queryByText('Create Vocabulary')).toBeInTheDocument();
          } else {
            expect(screen.queryByText('Admin Tools')).toBeNull();
            expect(screen.queryByText('Admin Dashboard')).toBeNull();
            expect(screen.queryByText('Example Manager')).toBeNull();
            expect(screen.queryByText('Database Tables')).toBeNull();
            expect(screen.queryByText('Create Vocabulary')).toBeNull();
          }
        });
      });
    });
  });
});
