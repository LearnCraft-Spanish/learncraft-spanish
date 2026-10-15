import type * as CustomQuizUseCase from '@application/useCases/useCustomQuizV2';
import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { IsFlushingStudentFlashcardUpdatesProvider } from '@application/coordinators/providers/IsFlushingStudentFlashcardUpdatesProvider';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import { SelectedExamplesProvider } from '@application/coordinators/providers/SelectedExamplesProvider';
import { UsingAsStudentProvider } from '@application/coordinators/providers/UsingAsStudentProvider';
import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import { ModalProvider } from '@composition/providers/ModalProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import MockQueryClientProvider from 'mocks/Providers/MockQueryClient';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { overrideMockAuthAdapter } from 'src/hexagon/application/adapters/authAdapter.mock';
import {
  mockUseMyData,
  overrideMockUseMyData,
  resetMockUseMyData,
} from 'src/hexagon/application/queries/useMyData.mock';
import { mockUseCustomQuizV2 } from 'src/hexagon/application/useCases/useCustomQuizV2/useCustomQuizV2.mock';
import { mockUseLimitedAudioQuizV2 } from 'src/hexagon/application/useCases/useLimitedAudioQuizV2/useLimitedAudioQuizV2.mock';
import { createMockAppUser } from 'src/hexagon/testing/factories/appUserFactories';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('@application/queries/useMyData', () => ({
  useMyData: () => mockUseMyData,
}));

// Only the `/customquiz` routing tests reach these; each quiz's own example
// query is covered by its use case tests.
vi.mock('@application/useCases/useCustomQuizV2', async () => {
  const actual = await vi.importActual<typeof CustomQuizUseCase>(
    '@application/useCases/useCustomQuizV2',
  );
  return {
    ...actual,
    default: mockUseCustomQuizV2,
    useCustomQuizV2: mockUseCustomQuizV2,
  };
});

vi.mock('@application/useCases/useLimitedAudioQuizV2', () => ({
  default: mockUseLimitedAudioQuizV2,
  useLimitedAudioQuizV2: mockUseLimitedAudioQuizV2,
}));

// `MockAllProviders`'s `route` prop wraps `children` in its own extra
// `<Routes>` when `route !== '/'`. That's fine for a single leaf page, but
// `<App>` mounts `AppRoutes` (its own full `<Routes>` tree) internally, and
// nesting two absolute-path `<Routes>` trees means the inner one matches
// against whatever path is *left over* after the outer exact match — which
// is always empty, so it always resolves back to `/`. To land `<App>` on a
// non-root route in tests, mirror `MockAllProviders`'s provider stack under
// a single `MemoryRouter` instead, with no extra wrapping `<Routes>`.
function renderAppAtRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ContextualMenuProvider>
        <ModalProvider>
          <MockQueryClientProvider>
            <ActiveStudentProvider>
              <UsingAsStudentProvider>
                <SelectedCourseAndLessonsProvider>
                  <IsFlushingStudentFlashcardUpdatesProvider>
                    <SelectedExamplesProvider>
                      <App />
                    </SelectedExamplesProvider>
                  </IsFlushingStudentFlashcardUpdatesProvider>
                </SelectedCourseAndLessonsProvider>
              </UsingAsStudentProvider>
            </ActiveStudentProvider>
          </MockQueryClientProvider>
        </ModalProvider>
      </ContextualMenuProvider>
    </MemoryRouter>,
  );
}

function renderApp() {
  return render(
    <MockAllProviders>
      <App />
    </MockAllProviders>,
  );
}

/** A full student who is not in the beta: the rollout gives them v2 anyway. */
function asStudent(): void {
  overrideMockUseMyData({
    myData: createMockAppUser({ studentRole: 'student', betaTester: false }),
    isBetaTester: false,
  });
  overrideAuthAndAppUser(
    {
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAdmin: false,
      isCoach: false,
      isStudent: true,
      isLimited: false,
    },
    {
      isOwnUser: true,
    },
  );
}

function asLimited(): void {
  overrideMockAuthAdapter({
    authUser: getAuthUserFromEmail('limited@fake.not')!,
    isAuthenticated: true,
    isLoading: false,
    isAdmin: false,
    isCoach: false,
    isStudent: false,
    isLimited: true,
  });
}

function asFree(): void {
  overrideMockAuthAdapter({
    authUser: { email: 'free@fake.not', roles: [] },
    isAuthenticated: true,
    isLoading: false,
    isAdmin: false,
    isCoach: false,
    isStudent: false,
    isLimited: false,
  });
}

function asCoachWithStudentRole(): void {
  overrideMockAuthAdapter({
    authUser: getAuthUserFromEmail('student-admin@fake.not')!,
    isAuthenticated: true,
    isLoading: false,
    isAdmin: false,
    isCoach: true,
    isStudent: true,
    isLimited: false,
  });
}

describe('app', () => {
  afterEach(() => {
    resetMockUseMyData();
  });

  it('renders without crashing', () => {
    renderApp();
  });

  describe('before login', () => {
    it('shows the v2 header with no nav or account, above the Log in screen', async () => {
      overrideMockAuthAdapter({ isAuthenticated: false });
      const { getByRole, getByText, queryByRole, queryByAltText } = renderApp();

      await waitFor(() => {
        expect(
          getByText('Please log in to access the LCS App'),
        ).toBeInTheDocument();
      });
      expect(getByText('LEARNCRAFT')).toBeInTheDocument();
      expect(getByRole('button', { name: 'Log in' })).toBeInTheDocument();
      expect(
        queryByRole('navigation', { name: 'Primary' }),
      ).not.toBeInTheDocument();
      expect(
        queryByRole('button', { name: 'Account' }),
      ).not.toBeInTheDocument();
      expect(queryByAltText('Learncraft Spanish Logo')).not.toBeInTheDocument();
      expect(
        queryByRole('button', { name: /log in\/register/i }),
      ).not.toBeInTheDocument();
    });

    it('keeps the v2 header up while logging in', async () => {
      overrideMockAuthAdapter({ isLoading: true, isAuthenticated: false });
      const { getByAltText, getByText } = renderApp();

      await waitFor(() => {
        expect(getByAltText('loading-spinner')).toBeInTheDocument();
      });
      expect(getByText('LEARNCRAFT')).toBeInTheDocument();
    });

    it('never paints the legacy chrome', async () => {
      overrideMockAuthAdapter({ isAuthenticated: false });
      const { getByText, queryByText } = renderApp();

      await waitFor(() => {
        expect(
          getByText('Please log in to access the LCS App'),
        ).toBeInTheDocument();
      });
      expect(
        queryByText('You must be logged in to use this app.'),
      ).not.toBeInTheDocument();
    });
  });

  describe('a student outside the beta', () => {
    it('gets the v2 header and student nav, with no legacy nav or sub header', async () => {
      asStudent();
      const { getByRole, queryByAltText, queryByText } = renderApp();

      await waitFor(() => {
        expect(
          getByRole('navigation', { name: 'Primary' }),
        ).toBeInTheDocument();
      });
      expect(queryByAltText('Learncraft Spanish Logo')).not.toBeInTheDocument();
      expect(queryByText(/welcome back/i)).not.toBeInTheDocument();
    });

    it('gets the v2 home', async () => {
      asStudent();
      const { getByText } = renderApp();

      await waitFor(() => {
        expect(getByText(/quiz my flashcards/i)).toBeInTheDocument();
      });
    });

    it('opens settings from the account menu, where Log out lives', async () => {
      const user = userEvent.setup();
      asStudent();
      const { getByRole, queryByRole } = renderApp();

      const accountTrigger = await waitFor(() =>
        getByRole('button', { name: 'Account' }),
      );
      await user.click(accountTrigger);

      expect(
        queryByRole('menuitem', { name: /log out/i }),
      ).not.toBeInTheDocument();
      await user.click(getByRole('menuitem', { name: /settings/i }));

      expect(
        await waitFor(() => getByRole('heading', { name: 'Settings' })),
      ).toBeInTheDocument();
      expect(getByRole('button', { name: /log out/i })).toBeInTheDocument();
    });

    it('opens the v2 Quizzes page instead of being redirected home', async () => {
      asStudent();
      const { getByRole } = renderAppAtRoute('/quizzes');

      await waitFor(() => {
        expect(getByRole('heading', { name: 'Quizzes' })).toBeInTheDocument();
      });
    });

    it('gets the v2 flashcard finder with no sub header', async () => {
      asStudent();
      const { getByRole, queryByText } = renderAppAtRoute('/flashcardfinder');

      await waitFor(
        () => {
          expect(
            getByRole('heading', { name: 'Flashcard Finder' }),
          ).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
      expect(queryByText(/welcome back/i)).not.toBeInTheDocument();
    });

    it('gets the v2 flashcard manager with no sub header', async () => {
      asStudent();
      const { getByRole, queryByText } = renderAppAtRoute('/manage-flashcards');

      await waitFor(
        () => {
          expect(
            getByRole('heading', { name: 'Flashcard Manager' }),
          ).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
      expect(queryByText(/welcome back/i)).not.toBeInTheDocument();
    });
  });

  describe('a limited user', () => {
    it('gets Audio Quiz and Official Quizzes CTAs on home, with no nav', async () => {
      asLimited();
      const { getByRole, queryByRole, getByText } = renderApp();

      await waitFor(() => {
        expect(getByRole('button', { name: 'Audio Quiz' })).toBeInTheDocument();
      });
      expect(
        getByRole('button', { name: 'Official Quizzes' }),
      ).toBeInTheDocument();
      expect(getByText('LEARNCRAFT')).toBeInTheDocument();
      expect(getByRole('button', { name: 'Account' })).toBeInTheDocument();
      expect(
        queryByRole('navigation', { name: 'Primary' }),
      ).not.toBeInTheDocument();
      expect(
        queryByRole('button', { name: /quiz my flashcards/i }),
      ).not.toBeInTheDocument();
    });

    it('goes from the Audio Quiz CTA to the v2 audio quiz setup', async () => {
      const user = userEvent.setup();
      asLimited();
      const { findByRole, getByRole, queryByRole } = renderAppAtRoute('/');

      await user.click(
        await findByRole('button', { name: 'Audio Quiz' }, { timeout: 5000 }),
      );

      expect(
        await findByRole(
          'radiogroup',
          { name: 'Audio quiz type' },
          { timeout: 5000 },
        ),
      ).toBeInTheDocument();
      expect(
        getByRole('heading', { name: 'Set up your quiz' }),
      ).toBeInTheDocument();
      expect(
        queryByRole('radiogroup', { name: 'Quiz type' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('a free user', () => {
    it('gets only the Official Quizzes CTA on home, with no nav', async () => {
      asFree();
      const { getByRole, getAllByRole, queryByRole } = renderApp();

      await waitFor(() => {
        expect(
          getByRole('button', { name: 'Official Quizzes' }),
        ).toBeInTheDocument();
      });
      expect(
        queryByRole('button', { name: 'Audio Quiz' }),
      ).not.toBeInTheDocument();
      expect(
        queryByRole('navigation', { name: 'Primary' }),
      ).not.toBeInTheDocument();
      // The account trigger and the one CTA.
      expect(getAllByRole('button')).toHaveLength(2);
      expect(getByRole('button', { name: 'Account' })).toBeInTheDocument();
    });
  });

  describe('a coach', () => {
    it('gets the v2 header with "Use as student" and only coaching tools', async () => {
      asCoachWithStudentRole();
      const { getByRole, getByText, queryByRole, queryByText } = renderApp();

      await waitFor(() => {
        expect(
          getByRole('button', { name: 'Use as student' }),
        ).toBeInTheDocument();
      });
      expect(getByText('LEARNCRAFT')).toBeInTheDocument();
      expect(
        queryByRole('navigation', { name: 'Primary' }),
      ).not.toBeInTheDocument();
      expect(getByText('Coaching Tools')).toBeInTheDocument();
      expect(queryByText(/quiz my flashcards/i)).not.toBeInTheDocument();
      expect(queryByText(/official quizzes/i)).not.toBeInTheDocument();
      expect(queryByText('Admin Tools')).not.toBeInTheDocument();
    });

    it('can open the Flashcard Finder without using the app as a student', async () => {
      asCoachWithStudentRole();
      const { getByRole, queryByText } = renderAppAtRoute('/flashcardfinder');

      await waitFor(
        () => {
          expect(
            getByRole('heading', { name: 'Flashcard Finder' }),
          ).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
      expect(queryByText('Coaching Tools')).not.toBeInTheDocument();
    });

    it('can open Custom Quiz without using the app as a student', async () => {
      asCoachWithStudentRole();
      const { getAllByRole, queryByText } = renderAppAtRoute('/customquiz');

      await waitFor(
        () => {
          expect(
            getAllByRole('heading', { name: 'Set up your quiz' }).length,
          ).toBeGreaterThan(0);
        },
        { timeout: 5000 },
      );
      expect(queryByText('Coaching Tools')).not.toBeInTheDocument();
    });

    it('goes from the Student Tools Custom Quiz button to the v2 quiz setup', async () => {
      asCoachWithStudentRole();
      const user = userEvent.setup();
      const { findByRole, findAllByRole, queryByText } = renderAppAtRoute('/');

      await user.click(
        await findByRole('link', { name: 'Custom Quiz' }, { timeout: 5000 }),
      );

      expect(
        (
          await findAllByRole(
            'heading',
            { name: 'Set up your quiz' },
            { timeout: 5000 },
          )
        ).length,
      ).toBeGreaterThan(0);
      expect(queryByText('Coaching Tools')).not.toBeInTheDocument();
    });

    it('is still sent away from other student tools until using the app as a student', async () => {
      asCoachWithStudentRole();
      const { getByText, queryByRole } = renderAppAtRoute('/manage-flashcards');

      await waitFor(
        () => {
          expect(getByText('Coaching Tools')).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
      expect(
        queryByRole('heading', { name: 'Flashcard Manager' }),
      ).not.toBeInTheDocument();
    });
  });

  it('gives an admin the admin tools', async () => {
    overrideMockAuthAdapter({
      authUser: getAuthUserFromEmail('admin-empty-role@fake.not')!,
      isAuthenticated: true,
      isLoading: false,
      isAdmin: true,
      isCoach: false,
      isStudent: false,
      isLimited: false,
    });
    const { getByText } = renderApp();

    await waitFor(() => {
      expect(getByText('Example Manager')).toBeInTheDocument();
    });
  });
});
