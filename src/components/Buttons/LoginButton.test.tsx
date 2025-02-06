import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import createMockAuth from 'mocks/hooks/useMockAuth';
import useAuth from 'src/hooks/useAuth';

import LoginButton from './LoginButton';

describe('login button', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders without crashing', () => {
    const loggedOutAuth = createMockAuth({ isAuthenticated: false });
    vi.mocked(useAuth).mockReturnValue(loggedOutAuth);
    render(<LoginButton />);
    expect(screen.getByText('Log in/Register')).toBeInTheDocument();
  });
  it('does not render when authenticated', () => {
    const loggedInAuth = createMockAuth({ isAuthenticated: true });
    vi.mocked(useAuth).mockReturnValue(loggedInAuth);
    render(<LoginButton />);
    expect(screen.queryByText('Log in/Register')).not.toBeInTheDocument();
  });
  it('calls loginWithRedirect when clicked', () => {
    const loggedOutAuth = createMockAuth({ isAuthenticated: false });
    vi.mocked(useAuth).mockReturnValue(loggedOutAuth);
    render(<LoginButton />);
    expect(screen.getByText('Log in/Register')).toBeInTheDocument();
    screen.getByText('Log in/Register').click();
    expect(loggedOutAuth.login).toHaveBeenCalled();
  });
});
