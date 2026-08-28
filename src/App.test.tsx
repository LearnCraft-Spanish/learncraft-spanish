import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';
import { overrideMockAuthAdapter } from 'src/hexagon/application/adapters/authAdapter.mock';
import { overrideMockFeatureFlagAdapter } from 'src/hexagon/application/adapters/featureFlagAdapter.mock';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { describe, expect, it } from 'vitest';
import App from './App';

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

  it('shows a log in button when logged out', async () => {
    overrideMockAuthAdapter({ isAuthenticated: false });
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(getByText(/log in/i)).toBeInTheDocument();
    });
  });

  it("says it won't do anything if not logged in", async () => {
    overrideMockAuthAdapter({ isAuthenticated: false });
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(
        getByText('You must be logged in to use this app.'),
      ).toBeInTheDocument();
    });
  });

  it('shows welcome message', async () => {
    // const mockLimitedStudent = createMockAuth({ userName: "limited" });
    overrideMockAuthAdapter({
      authUser: getAuthUserFromEmail('limited@fake.not')!,
      isAuthenticated: true,
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
      expect(getByText(/welcome/i)).toBeInTheDocument();
    });
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
