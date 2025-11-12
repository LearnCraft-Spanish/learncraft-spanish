import mockAuthAdapter, {
  overrideMockAuthAdapter,
  resetMockAuthAdapter,
} from '@application/adapters/authAdapter.mock';
import { LogoutButton } from '@interface/components/general/Buttons';
import { cleanup, render, screen } from '@testing-library/react';

import React from 'react';

import { afterEach, describe, expect, it } from 'vitest';

describe('logout button', () => {
  afterEach(() => {
    resetMockAuthAdapter();
    cleanup();
  });
  it('renders without crashing', () => {
    overrideMockAuthAdapter({ isAuthenticated: true, isLoading: false });
    render(<LogoutButton />);
    expect(screen.getByText('Log Out')).toBeTruthy();
  });
  it('does not render when not authenticated', () => {
    overrideMockAuthAdapter({ isAuthenticated: false, isLoading: false });
    render(<LogoutButton />);
    expect(screen.queryByText('Log Out')).toBeNull();
  });
  it('calls logout when clicked', () => {
    overrideMockAuthAdapter({ isAuthenticated: true, isLoading: false });
    render(<LogoutButton />);
    screen.getByText('Log Out').click();
    expect(mockAuthAdapter.logout).toHaveBeenCalled();
  });
});
