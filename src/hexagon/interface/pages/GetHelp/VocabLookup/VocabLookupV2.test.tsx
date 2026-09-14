import {
  mockUseVocabLookup,
  overrideMockUseVocabLookup,
  resetMockUseVocabLookup,
} from '@application/useCases/useVocabLookup/useVocabLookup.mock';
import { VocabLookupV2 } from '@interface/pages/GetHelp/VocabLookup/VocabLookupV2';
import { SkillType } from '@learncraft-spanish/shared';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useVocabLookup', () => ({
  default: mockUseVocabLookup,
  useVocabLookup: mockUseVocabLookup,
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/get-help/vocab']}>
      <Routes>
        <Route path="/get-help" element={<div>Help hub</div>} />
        <Route path="/get-help/vocab" element={<VocabLookupV2 />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('vocab lookup v2', () => {
  beforeEach(() => {
    resetMockUseVocabLookup();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the title and search field', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Vocab lookup' }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search tags — vocabulary, idiom…'),
    ).toBeInTheDocument();
  });

  it('navigates back to the help hub', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole('button', { name: /Help & walkthroughs/ }),
    );

    expect(screen.getByText('Help hub')).toBeInTheDocument();
  });

  it('shows an error message from the use case', () => {
    overrideMockUseVocabLookup({
      error: new Error('catalog unavailable'),
    });

    renderPage();

    expect(screen.getByText('catalog unavailable')).toBeInTheDocument();
  });

  it('threads search suggestions into the card', () => {
    overrideMockUseVocabLookup({
      tagSearchTerm: 'cuan',
      tagSuggestions: [
        {
          type: SkillType.Vocabulary,
          key: 'Vocabulary-103',
          name: 'cuando',
          descriptor: 'when',
          vocabularyId: 103,
          subcategoryName: 'Subordinating',
          frequency: 10,
        },
      ],
    });

    renderPage();

    expect(
      screen.getByRole('option', { name: /cuando vocabulary/i }),
    ).toBeInTheDocument();
  });

  it('shows a selected vocabulary chip from the use case', () => {
    overrideMockUseVocabLookup({
      selectedVocabulary: createMockVocabulary({
        id: 103,
        word: 'cuando',
      }),
    });

    renderPage();

    expect(
      screen.getByRole('button', { name: 'cuando', pressed: true }),
    ).toBeInTheDocument();
  });
});
