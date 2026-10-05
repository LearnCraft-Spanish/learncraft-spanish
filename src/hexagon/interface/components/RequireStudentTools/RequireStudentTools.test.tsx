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
            <RequireStudentTools>
              <div>finder</div>
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
  });

  it('renders the route when student tools are allowed', () => {
    renderAt('/flashcardfinder');

    expect(screen.getByText('finder')).toBeInTheDocument();
  });

  it('redirects home when a coach is not using the app as a student', () => {
    overrideMockUseStudentToolsAccess({ allowed: false });

    renderAt('/flashcardfinder');

    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.queryByText('finder')).not.toBeInTheDocument();
  });

  it('renders nothing while auth is still loading', () => {
    overrideMockUseStudentToolsAccess({ allowed: false, isLoading: true });

    renderAt('/flashcardfinder');

    expect(screen.queryByText('home')).not.toBeInTheDocument();
    expect(screen.queryByText('finder')).not.toBeInTheDocument();
  });
});
