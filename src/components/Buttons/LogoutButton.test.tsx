import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import createMockAuth from '../../../mocks/hooks/useMockAuth';
import useAuth from '../../hooks/useAuth';

import LogoutButton from './LogoutButton';

describe('logout button', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });
  it('renders without crashing', () => {
    render(<LogoutButton />);
    expect(screen.getByText('Log Out')).toBeTruthy();
  });
  it('does not render when not authenticated', () => {
    const loggedOutAuth = createMockAuth({ isAuthenticated: false });
    vi.mocked(useAuth).mockReturnValue(loggedOutAuth);
    render(<LogoutButton />);
    expect(screen.queryByText('Log Out')).toBeNull();
  });
  it('calls logout when clicked', () => {
    const loggedInAuth = createMockAuth({ isAuthenticated: true });
    vi.mocked(useAuth).mockReturnValue(loggedInAuth);
    render(<LogoutButton />);
    screen.getByText('Log Out').click();
    expect(loggedInAuth.logout).toHaveBeenCalled();
  });
});
