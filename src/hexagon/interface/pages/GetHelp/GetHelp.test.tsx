import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import GetHelp from '@interface/pages/GetHelp/GetHelp';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

vi.mock('@interface/pages/GetHelp/GetHelpV2', () => ({
  GetHelpV2: () => <div>GetHelpV2</div>,
  default: () => <div>GetHelpV2</div>,
}));

vi.mock('@interface/pages/GetHelpPage', () => ({
  default: () => <div>GetHelpPage v1</div>,
}));

describe('get help switch', () => {
  beforeEach(() => {
    resetMockUseStudentUiVersion();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the v2 hub when the flag is on', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });

    render(
      <MemoryRouter>
        <GetHelp />
      </MemoryRouter>,
    );

    expect(screen.getByText('GetHelpV2')).toBeInTheDocument();
  });

  it('renders the legacy page when the flag is off', () => {
    overrideMockUseStudentUiVersion({ version: 'v1' });

    render(
      <MemoryRouter>
        <GetHelp />
      </MemoryRouter>,
    );

    expect(screen.getByText('GetHelpPage v1')).toBeInTheDocument();
  });
});
