import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import Home from '@interface/pages/Home/Home';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

vi.mock('src/sections/Menu', () => ({
  default: () => <div data-testid="legacy-menu" />,
}));

vi.mock('@interface/pages/Home/HomeV2', () => ({
  HomeV2: () => <div data-testid="home-v2" />,
}));

describe('home page', () => {
  afterEach(() => {
    resetMockUseStudentUiVersion();
    cleanup();
  });

  it('renders the legacy Menu when the flag is off', () => {
    render(<Home />);

    expect(screen.getByTestId('legacy-menu')).toBeInTheDocument();
    expect(screen.queryByTestId('home-v2')).not.toBeInTheDocument();
  });

  it('renders HomeV2 when ui.student.home.v2 is on', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });

    render(<Home />);

    expect(screen.getByTestId('home-v2')).toBeInTheDocument();
    expect(screen.queryByTestId('legacy-menu')).not.toBeInTheDocument();
  });
});
