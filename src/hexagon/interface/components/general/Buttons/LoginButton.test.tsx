import mockAuthAdapter, {
  overrideMockAuthAdapter,
  resetMockAuthAdapter,
} from '@application/adapters/authAdapter.mock';
import LoginButton from '@interface/components/general/Buttons/LoginButton';
import { cleanup, render, screen } from '@testing-library/react';

import React from 'react';

import { afterEach, describe, expect, it } from 'vitest';

describe('login button', () => {
  afterEach(() => {
    resetMockAuthAdapter();
    cleanup();
  });

  it('renders without crashing', () => {
    overrideMockAuthAdapter({ isAuthenticated: false, isLoading: false });
    render(<LoginButton />);
    expect(screen.getByText('Log in/Register')).toBeInTheDocument();
  });
  it('does not render when authenticated', () => {
    overrideMockAuthAdapter({ isAuthenticated: true, isLoading: false });
    render(<LoginButton />);
    expect(screen.queryByText('Log in/Register')).not.toBeInTheDocument();
  });
  it('calls loginWithRedirect when clicked', () => {
    overrideMockAuthAdapter({ isAuthenticated: false, isLoading: false });
    render(<LoginButton />);
    expect(screen.getByText('Log in/Register')).toBeInTheDocument();
    screen.getByText('Log in/Register').click();
    expect(mockAuthAdapter.login).toHaveBeenCalled();
  });
});
