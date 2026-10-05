import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { SkillTag } from '@learncraft-spanish/shared';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { mockUseCombinedFilters } from '@application/units/Filtering/useCombinedFilters.mock';
import { TagsCard } from '@interface/components/customQuiz/TagsCard/TagsCard';
import { SkillType } from '@learncraft-spanish/shared';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const vocabularyTag: SkillTag = {
  type: SkillType.Vocabulary,
  key: 'Vocabulary-1',
  name: 'por',
  descriptor: 'for',
  vocabularyId: 1,
  subcategoryName: 'Prepositions',
  frequency: null,
};

const idiomTag: SkillTag = {
  type: SkillType.Idiom,
  key: 'Idiom-57',
  name: 'por eso',
  vocabularyId: 57,
  subcategoryName: 'Cluster, Idiom',
  frequency: null,
};

function createFilter(
  tagSearchTerm = '',
  overrides: Partial<UseCombinedFiltersReturnType> = {},
): UseCombinedFiltersReturnType {
  return {
    ...mockUseCombinedFilters,
    addSkillTagToFilters: vi.fn(),
    removeSkillTagFromFilters: vi.fn(),
    setFilterPreset: vi.fn(),
    skillTagSearch: {
      tagSearchTerm,
      tagSuggestions: [vocabularyTag, idiomTag],
      updateTagSearchTerm: vi.fn(),
      removeTagFromSuggestions: vi.fn(),
      addTagBackToSuggestions: vi.fn(),
      isLoading: false,
      error: null,
    },
    ...overrides,
  };
}

function searchInput(): HTMLElement {
  return screen.getByPlaceholderText('Search tags');
}

describe('tags card', () => {
  afterEach(() => {
    cleanup();
  });

  it('adds a picked tag and keeps the typed search with its other suggestions', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter('por');
    render(<TagsCard exampleFilter={exampleFilter} />);

    await user.click(screen.getByRole('option', { name: 'por vocabulary' }));

    expect(exampleFilter.addSkillTagToFilters).toHaveBeenCalledWith(
      vocabularyTag.key,
    );
    expect(
      exampleFilter.skillTagSearch.removeTagFromSuggestions,
    ).toHaveBeenCalledWith(vocabularyTag.key);
    expect(
      exampleFilter.skillTagSearch.updateTagSearchTerm,
    ).not.toHaveBeenCalled();
    expect(searchInput()).toHaveValue('por');
    expect(
      screen.getByRole('option', { name: 'por eso idiom' }),
    ).toBeInTheDocument();
  });

  it('lets a student pick several tags for the same search', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter('por');
    const { rerender } = render(<TagsCard exampleFilter={exampleFilter} />);

    await user.click(screen.getByRole('option', { name: 'por vocabulary' }));
    rerender(
      <TagsCard
        exampleFilter={{ ...exampleFilter, selectedSkillTags: [vocabularyTag] }}
      />,
    );

    expect(
      screen.queryByRole('option', { name: 'por vocabulary' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'por eso idiom' }));

    expect(exampleFilter.addSkillTagToFilters).toHaveBeenNthCalledWith(
      2,
      idiomTag.key,
    );
    expect(
      exampleFilter.skillTagSearch.updateTagSearchTerm,
    ).not.toHaveBeenCalled();
    expect(searchInput()).toHaveValue('por');
  });

  it('hides the clear button while the search is empty', () => {
    render(<TagsCard exampleFilter={createFilter()} />);

    expect(
      screen.queryByRole('button', { name: 'Clear tag search' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clears the search and returns focus to it', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter('por');
    render(<TagsCard exampleFilter={exampleFilter} />);

    await user.click(screen.getByRole('button', { name: 'Clear tag search' }));

    expect(
      exampleFilter.skillTagSearch.updateTagSearchTerm,
    ).toHaveBeenCalledOnce();
    expect(
      exampleFilter.skillTagSearch.updateTagSearchTerm,
    ).toHaveBeenCalledWith();
    expect(searchInput()).toHaveFocus();
  });

  it('forwards keystrokes and clears the search when the sheet is dismissed', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter('po');
    render(<TagsCard exampleFilter={exampleFilter} />);

    await user.type(searchInput(), 'r');
    expect(
      exampleFilter.skillTagSearch.updateTagSearchTerm,
    ).toHaveBeenCalledWith(expect.objectContaining({ value: 'por' }));

    await user.keyboard('{Escape}');
    expect(
      exampleFilter.skillTagSearch.updateTagSearchTerm,
    ).toHaveBeenLastCalledWith();
  });

  it('clears the search when switching to presets and back after picking one', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter('por');
    render(<TagsCard exampleFilter={exampleFilter} />);

    await user.click(screen.getByRole('radio', { name: 'Presets' }));

    expect(
      exampleFilter.skillTagSearch.updateTagSearchTerm,
    ).toHaveBeenCalledWith();
    expect(screen.queryByPlaceholderText('Search tags')).toBeNull();

    await user.click(screen.getByRole('button', { name: /Ser\/Estar/ }));

    expect(exampleFilter.setFilterPreset).toHaveBeenCalledWith(
      PreSetQuizPreset.SerEstar,
    );
    expect(searchInput()).toBeInTheDocument();
  });

  it('returns to the search from the presets without picking one', async () => {
    const user = userEvent.setup();
    render(<TagsCard exampleFilter={createFilter()} />);

    await user.click(screen.getByRole('radio', { name: 'Presets' }));
    await user.click(screen.getByRole('radio', { name: 'Search tags' }));

    expect(screen.getByRole('radio', { name: 'Search tags' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(searchInput()).toBeInTheDocument();
  });

  it('removes a selected tag and returns it to the suggestions', async () => {
    const user = userEvent.setup();
    const exampleFilter = createFilter('', {
      selectedSkillTags: [vocabularyTag],
    });
    render(<TagsCard exampleFilter={exampleFilter} showHeader />);

    expect(screen.getByText('1 selected')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Remove por · Vocabulary' }),
    );

    expect(exampleFilter.removeSkillTagFromFilters).toHaveBeenCalledWith(
      vocabularyTag.key,
    );
    expect(
      exampleFilter.skillTagSearch.addTagBackToSuggestions,
    ).toHaveBeenCalledWith(vocabularyTag.key);
  });
});
