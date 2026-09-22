import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import VocabLookup from '@interface/pages/GetHelp/VocabLookup/VocabLookup';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

vi.mock('@interface/pages/GetHelp/VocabLookup/VocabLookupV2', () => ({
  VocabLookupV2: () => <div>VocabLookupV2</div>,
  default: () => <div>VocabLookupV2</div>,
}));

vi.mock('@interface/pages/GetHelpPage', () => ({
  default: () => <div>GetHelpPage v1</div>,
}));

describe('vocab lookup switch', () => {
  beforeEach(() => {
    resetMockUseStudentUiVersion();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders VocabLookupV2 when the student UI is v2', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });

    render(
      <MemoryRouter>
        <VocabLookup />
      </MemoryRouter>,
    );

    expect(screen.getByText('VocabLookupV2')).toBeInTheDocument();
  });

  it('renders the legacy page when the student UI is v1', () => {
    overrideMockUseStudentUiVersion({ version: 'v1' });

    render(
      <MemoryRouter>
        <VocabLookup />
      </MemoryRouter>,
    );

    expect(screen.getByText('GetHelpPage v1')).toBeInTheDocument();
  });
});
