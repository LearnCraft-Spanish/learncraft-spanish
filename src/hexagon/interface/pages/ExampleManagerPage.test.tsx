import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { ExampleManagerRouter } from '@interface/pages/ExampleManagerPage';
import { render, screen, waitFor } from '@testing-library/react';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

describe('exampleManagerRouter', () => {
  beforeEach(() => {
    overrideMockAuthAdapter({
      authUser: getAuthUserFromEmail('admin-empty-role@fake.not')!,
      isAuthenticated: true,
      isLoading: false,
      isAdmin: true,
      isCoach: false,
      isStudent: false,
      isLimited: false,
    });
  });

  it('shows the ExampleManagerNav component', async () => {
    render(
      <MockAllProviders>
        <ExampleManagerRouter />
      </MockAllProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText('Select Examples')).toBeInTheDocument();
      expect(screen.getByText('Create New Examples')).toBeInTheDocument();
      expect(screen.getByText('Edit Selected Examples')).toBeInTheDocument();
      expect(screen.getByText('Assign Selected Examples')).toBeInTheDocument();
    });
  });
});
