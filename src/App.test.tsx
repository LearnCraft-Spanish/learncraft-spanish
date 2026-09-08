import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { IsFlushingStudentFlashcardUpdatesProvider } from '@application/coordinators/providers/IsFlushingStudentFlashcardUpdatesProvider';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import { SelectedExamplesProvider } from '@application/coordinators/providers/SelectedExamplesProvider';
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
import { overrideMockFeatureFlagAdapter } from 'src/hexagon/application/adapters/featureFlagAdapter.mock';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { describe, expect, it } from 'vitest';
import App from './App';

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
              <SelectedCourseAndLessonsProvider>
                <IsFlushingStudentFlashcardUpdatesProvider>
                  <SelectedExamplesProvider>
                    <App />
                  </SelectedExamplesProvider>
                </IsFlushingStudentFlashcardUpdatesProvider>
              </SelectedCourseAndLessonsProvider>
            </ActiveStudentProvider>
          </MockQueryClientProvider>
        </ModalProvider>
      </ContextualMenuProvider>
    </MemoryRouter>,
  );
}

// Waiting for userData context to be finished
describe('app', () => {
  it('renders without crashing', () => {
    render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );
  });

  it('shows a log out option in the account menu when logged in', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );
    const accountTrigger = await waitFor(() =>
      getByRole('button', { name: 'Account' }),
    );
    await user.click(accountTrigger);

    expect(getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
  });

  it('shows exactly one log in button when logged out', async () => {
    overrideMockAuthAdapter({ isAuthenticated: false });
    const { getAllByRole } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(getAllByRole('button', { name: /log in/i })).toHaveLength(1);
    });
  });

  it('shows the logged-out screen instead of the app when not logged in', async () => {
    overrideMockAuthAdapter({ isAuthenticated: false });
    const { getByText, queryByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(getByText('Please log in to use this app')).toBeInTheDocument();
    });
    expect(
      queryByText('You must be logged in to use this app.'),
    ).not.toBeInTheDocument();
  });

  it('hides the sub-header welcome message for a free/limited user', async () => {
    // Regression: the sub header used to greet free/limited users with a
    // "Welcome back!" message (its `freeUser` state). It's now role-gated
    // to coach/admin only, so a limited user should never see it — nothing
    // else in the app renders "welcome" text.
    overrideMockAuthAdapter({
      authUser: getAuthUserFromEmail('limited@fake.not')!,
      isAuthenticated: true,
      isAdmin: false,
      isCoach: false,
      isStudent: false,
      isLimited: true,
    });
    const { getByText, queryByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(getByText(/official quizzes/i)).toBeInTheDocument();
    });
    expect(queryByText(/welcome/i)).not.toBeInTheDocument();
  });

  it('shows a loading spinner when logging in', async () => {
    overrideMockAuthAdapter({ isLoading: true });
    const { getByAltText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(getByAltText('loading-spinner')).toBeInTheDocument();
    });
  });

  it('shows official quizzes button', async () => {
    overrideMockAuthAdapter({
      authUser: getAuthUserFromEmail('limited@fake.not')!,
      isAuthenticated: true,
      isLoading: false,
      isAdmin: false,
      isCoach: false,
      isStudent: false,
      isLimited: true,
    });
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(getByText(/official quizzes/i)).toBeInTheDocument();
    });
  });

  it('displays my flashcards', async () => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isAdmin: false,
        isStudent: true,
      },
      {
        isOwnUser: true,
      },
    );
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(getByText(/quiz my flashcards/i)).toBeInTheDocument();
    });
  });

  it('hides the sub-header on the v2 student home screen', async () => {
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isAdmin: false,
        isStudent: true,
      },
      {
        isOwnUser: true,
      },
    );
    const { getByRole, queryByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );

    await waitFor(() => {
      expect(getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    });
    expect(queryByText(/welcome back/i)).not.toBeInTheDocument();
  });

  it('hides the sub-header on the v2 flashcard finder screen', async () => {
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.flashcards.finder.v2',
    });
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isAdmin: false,
        isStudent: true,
      },
      {
        isOwnUser: true,
      },
    );
    const user = userEvent.setup();
    const { getByRole, queryByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );

    await waitFor(() => {
      expect(
        getByRole('link', { name: 'Flashcard Finder' }),
      ).toBeInTheDocument();
    });
    await user.click(getByRole('link', { name: 'Flashcard Finder' }));

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

  it('hides the sub-header on the v2 flashcard manager screen', async () => {
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.flashcards.manager.v2',
    });
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isAdmin: false,
        isStudent: true,
      },
      {
        isOwnUser: true,
      },
    );
    const user = userEvent.setup();
    const { getByRole, queryByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );

    await waitFor(() => {
      expect(getByRole('link', { name: 'My flashcards' })).toBeInTheDocument();
    });
    await user.click(getByRole('link', { name: 'My flashcards' }));

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

  it('hides the sub header for a student on the /get-help page', async () => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isAdmin: false,
        isCoach: false,
        isStudent: true,
      },
      {
        isOwnUser: true,
      },
    );
    const { getByRole, queryByText } = renderAppAtRoute('/get-help');

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Get Help' })).toBeInTheDocument();
    });
    expect(queryByText(/welcome back/i)).not.toBeInTheDocument();
    expect(queryByText(/using as/i)).not.toBeInTheDocument();
  });

  it('never shows the sub header for a student, even on a route with no v2 flag enabled', async () => {
    // Regression: before the role gate, this route's sub header was hidden
    // only by the `isFlashcardFinderV2` flag check, so a student without
    // the flag enabled would still fall through to the legacy sub header
    // here. The role gate must hide it unconditionally for students,
    // regardless of route or flag state.
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isAdmin: false,
        isCoach: false,
        isStudent: true,
      },
      {
        isOwnUser: true,
      },
    );
    const { getByRole, queryByText } = renderAppAtRoute('/flashcardfinder');

    await waitFor(() => {
      expect(
        getByRole('heading', { name: 'Flashcard Finder' }),
      ).toBeInTheDocument();
    });
    expect(queryByText(/welcome back/i)).not.toBeInTheDocument();
    expect(queryByText(/using as/i)).not.toBeInTheDocument();
  });

  it('still shows the coach/admin student selector for a coach with no student role', async () => {
    overrideMockAuthAdapter({
      authUser: getAuthUserFromEmail('admin-empty-role@fake.not')!,
      isAuthenticated: true,
      isLoading: false,
      isAdmin: false,
      isCoach: true,
      isStudent: false,
      isLimited: false,
    });
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(getByText('No student Selected')).toBeInTheDocument();
    });
    expect(getByText('Change')).toBeInTheDocument();
  });

  it('still shows the coach/admin student selector when the coach also holds the Student role', async () => {
    // Watch out: gate on `isCoach || isAdmin`, not `!isStudent` — a
    // coach/admin who also has the Student role must still get the
    // selector, not the student "Welcome back" message. Rendered on a
    // coach/admin-only route with no v2-flag exclusion of its own (unlike
    // `/`, `/flashcardfinder`, `/manage-flashcards`), so this isolates the
    // role check itself.
    overrideMockAuthAdapter({
      authUser: getAuthUserFromEmail('student-admin@fake.not')!,
      isAuthenticated: true,
      isLoading: false,
      isAdmin: false,
      isCoach: true,
      isStudent: true,
      isLimited: false,
    });
    const { getByText, queryByText } = renderAppAtRoute('/frequensay');
    await waitFor(() => {
      expect(getByText('No student Selected')).toBeInTheDocument();
    });
    expect(queryByText(/welcome back/i)).not.toBeInTheDocument();
  });

  it('displays example manager if admin', async () => {
    overrideMockAuthAdapter({
      authUser: getAuthUserFromEmail('admin-empty-role@fake.not')!,
      isAuthenticated: true,
      isLoading: false,
      isAdmin: true,
      isCoach: false,
      isStudent: false,
      isLimited: false,
    });
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(getByText('Example Manager')).toBeInTheDocument();
    });
  });
});
