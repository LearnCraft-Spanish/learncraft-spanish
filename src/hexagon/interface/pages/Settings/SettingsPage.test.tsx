import {
  mockUseSettings,
  overrideMockUseSettings,
  resetMockUseSettings,
} from '@application/useCases/useSettings.mock';
import { SettingsPage } from '@interface/pages/Settings/SettingsPage';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useSettings', () => ({
  useSettings: mockUseSettings,
}));

function valueFor(term: string): HTMLElement {
  const label = screen.getByText(term);
  const value = label.nextElementSibling;
  if (!(value instanceof HTMLElement)) {
    throw new TypeError(`No value for ${term}`);
  }
  return value;
}

describe('settings page', () => {
  afterEach(() => {
    cleanup();
    resetMockUseSettings();
  });

  it('shows the full name and email as text', () => {
    render(<SettingsPage />);

    expect(
      screen.getByRole('heading', { name: 'Settings' }),
    ).toBeInTheDocument();
    expect(valueFor('Full name')).toHaveTextContent('Maria Silva');
    expect(valueFor('Email')).toHaveTextContent('maria@example.com');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('says when the name or email is missing', () => {
    overrideMockUseSettings({ fullName: null, email: null });

    render(<SettingsPage />);

    expect(valueFor('Full name')).toHaveTextContent('Not available');
    expect(valueFor('Email')).toHaveTextContent('Not available');
    expect(
      screen.getByRole('button', { name: 'Reset password' }),
    ).toBeDisabled();
  });

  it('asks the account to email a password reset link', async () => {
    const user = userEvent.setup();
    const requestPasswordReset = vi.fn();
    overrideMockUseSettings({ requestPasswordReset });

    render(<SettingsPage />);

    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(requestPasswordReset).toHaveBeenCalledOnce();
  });

  it('disables reset while the email is sending', () => {
    overrideMockUseSettings({ passwordResetStatus: 'sending' });

    render(<SettingsPage />);

    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
  });

  it('confirms when the reset email has been sent', () => {
    overrideMockUseSettings({ passwordResetStatus: 'sent' });

    render(<SettingsPage />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Check your email for a link to choose a new password.',
    );
  });

  it('shows an error when the reset email cannot be sent', () => {
    overrideMockUseSettings({ passwordResetStatus: 'error' });

    render(<SettingsPage />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      "We couldn't send the reset email. Please try again.",
    );
  });

  it('logs out from the page', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    overrideMockUseSettings({ logout });

    render(<SettingsPage />);

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(logout).toHaveBeenCalledOnce();
  });

  it('shows a loading message while the account is loading', () => {
    overrideMockUseSettings({ isLoading: true });

    render(<SettingsPage />);

    expect(screen.getByText('Loading settings...')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Settings' }),
    ).not.toBeInTheDocument();
  });
});
