import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import { LoadingScreen } from '@interface/components/Loading/LoadingScreen';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

describe('component LoadingScreen', () => {
  afterEach(() => {
    resetMockUseStudentUiVersion();
    cleanup();
  });

  it('renders the v1 spinner without a page shell', () => {
    render(<LoadingScreen message="Loading Official Quizzes..." />);

    expect(screen.getByText('Loading Official Quizzes...')).toBeInTheDocument();
    expect(
      screen.getByText('Loading Official Quizzes...').closest('.column'),
    ).toBeNull();
  });

  it('wraps the v2 spinner in a page shell', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    render(<LoadingScreen message="Loading..." />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Loading...').closest('.column')).not.toBeNull();
  });
});
