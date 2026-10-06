import {
  mockUseStudentToolsAccess,
  overrideMockUseStudentToolsAccess,
  resetMockUseStudentToolsAccess,
} from '@application/useCases/useStudentToolsAccess.mock';
import { RequireStudentTools } from '@interface/components/RequireStudentTools';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useStudentToolsAccess', () => ({
  useStudentToolsAccess: mockUseStudentToolsAccess,
}));

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div>home</div>} />
        <Route
          path="/flashcardfinder"
          element={
            <RequireStudentTools scope="catalog">
              <div>finder</div>
            </RequireStudentTools>
          }
        />
        <Route
          path="/manage-flashcards"
          element={
            <RequireStudentTools>
              <div>manager</div>
            </RequireStudentTools>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('component RequireStudentTools', () => {
  afterEach(() => {
    resetMockUseStudentToolsAccess();
    mockUseStudentToolsAccess.mockClear();
  });

  it('asks for catalog access on a catalog route', () => {
    renderAt('/flashcardfinder');

    expect(mockUseStudentToolsAccess).toHaveBeenCalledWith('catalog');
  });

  it('asks for the default student scope when none is given', () => {
    renderAt('/manage-flashcards');

    expect(screen.getByText('manager')).toBeInTheDocument();
    expect(mockUseStudentToolsAccess).toHaveBeenCalledWith(undefined);
  });

  it('renders the route when student tools are allowed', () => {
    renderAt('/flashcardfinder');

    expect(screen.getByText('finder')).toBeInTheDocument();
  });

  it('redirects home when a coach is not using the app as a student', () => {
    overrideMockUseStudentToolsAccess({ allowed: false });

    renderAt('/manage-flashcards');

    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.queryByText('manager')).not.toBeInTheDocument();
  });

  it('renders nothing while auth is still loading', () => {
    overrideMockUseStudentToolsAccess({ allowed: false, isLoading: true });

    renderAt('/flashcardfinder');

    expect(screen.queryByText('home')).not.toBeInTheDocument();
    expect(screen.queryByText('finder')).not.toBeInTheDocument();
  });
});
