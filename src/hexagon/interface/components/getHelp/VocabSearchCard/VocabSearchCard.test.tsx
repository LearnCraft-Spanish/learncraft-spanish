import type { VocabInfo } from '@application/units/useVocabInfo';
import type { SkillTag, Vocabulary } from '@learncraft-spanish/shared';
import type { ComponentProps } from 'react';
import { VocabSearchCard } from '@interface/components/getHelp/VocabSearchCard/VocabSearchCard';
import { SkillType } from '@learncraft-spanish/shared';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const VOCABULARY = {
  id: 103,
  word: 'cuando',
  descriptor: '"cuando": "when"',
  type: 'nonverb',
  spellings: ['cuando'],
  subcategory: {
    id: 1003,
    name: 'Subordinating',
    category: 'Subordinating',
    partOfSpeech: 'Conjunction',
  },
  frequency: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
} as unknown as Vocabulary;

const SUGGESTIONS: SkillTag[] = [
  {
    type: SkillType.Vocabulary,
    key: 'Vocabulary-103',
    name: 'cuando',
    descriptor: 'when',
    vocabularyId: 103,
    subcategoryName: 'Subordinating',
    frequency: 10,
  },
  {
    type: SkillType.Idiom,
    key: 'Idiom-50',
    name: 'de vez en cuando',
    vocabularyId: 50,
    subcategoryName: 'Cluster, Idiom',
    frequency: 5,
  },
];

function vocabInfoHook(vocab: Vocabulary): VocabInfo {
  return {
    word: vocab.word,
    descriptor: vocab.descriptor,
    subcategory: vocab.subcategory,
    verb: null,
    conjugationTags: null,
    lessons: [{ id: 1, courseName: 'LearnCraft Spanish', lessonNumber: 28 }],
    lessonsLoading: false,
  } as unknown as VocabInfo;
}

/** Stubs `matchMedia` (absent in jsdom) so `useMediaQuery` can match. */
function stubMobile(matches: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

type Props = ComponentProps<typeof VocabSearchCard>;

function renderCard(overrides: Partial<Props> = {}): {
  onSearchTermChange: ReturnType<typeof vi.fn>;
  onSelectTag: ReturnType<typeof vi.fn>;
  onClearSelection: ReturnType<typeof vi.fn>;
  onClosePanel: ReturnType<typeof vi.fn>;
  onToggleWordPanel: ReturnType<typeof vi.fn>;
} {
  const onSearchTermChange = vi.fn();
  const onSelectTag = vi.fn();
  const onClearSelection = vi.fn();
  const onClosePanel = vi.fn();
  const onToggleWordPanel = vi.fn();

  render(
    <VocabSearchCard
      searchTerm=""
      suggestions={[]}
      onSearchTermChange={onSearchTermChange}
      onSelectTag={onSelectTag}
      selectedVocabulary={null}
      selectionLoading={false}
      panelOpen
      onClosePanel={onClosePanel}
      onToggleWordPanel={onToggleWordPanel}
      vocabInfoHook={vocabInfoHook}
      onClearSelection={onClearSelection}
      {...overrides}
    />,
  );

  return {
    onSearchTermChange,
    onSelectTag,
    onClearSelection,
    onClosePanel,
    onToggleWordPanel,
  };
}

describe('vocab search card', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the empty search field', () => {
    stubMobile(false);
    renderCard();

    expect(
      screen.getByPlaceholderText('Search tags — vocabulary, idiom…'),
    ).toBeInTheDocument();
  });

  it('opens the suggestion sheet when a search term is set', () => {
    stubMobile(false);
    renderCard({ searchTerm: 'cuan', suggestions: SUGGESTIONS });

    expect(
      screen.getByRole('option', { name: /cuando vocabulary/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /de vez en cuando idiom/i }),
    ).toBeInTheDocument();
  });

  it('calls onSelectTag when a suggestion is chosen', async () => {
    stubMobile(false);
    const user = userEvent.setup();
    const { onSelectTag } = renderCard({
      searchTerm: 'cuan',
      suggestions: SUGGESTIONS,
    });

    await user.click(
      screen.getByRole('option', { name: /cuando vocabulary/i }),
    );

    expect(onSelectTag).toHaveBeenCalledWith(SUGGESTIONS[0]);
  });

  it('shows the selected word chip and desktop panel', () => {
    stubMobile(false);
    renderCard({ selectedVocabulary: VOCABULARY });

    expect(
      screen.getByRole('button', { name: 'cuando', pressed: true }),
    ).toBeInTheDocument();
    expect(screen.getByText('"cuando": "when"')).toBeInTheDocument();
    expect(
      screen.getByText(/LearnCraft Spanish lesson 28/),
    ).toBeInTheDocument();
  });

  it('toggles the word panel when the chip is clicked', async () => {
    stubMobile(false);
    const user = userEvent.setup();
    const { onToggleWordPanel } = renderCard({
      selectedVocabulary: VOCABULARY,
    });

    await user.click(
      screen.getByRole('button', { name: 'cuando', pressed: true }),
    );

    expect(onToggleWordPanel).toHaveBeenCalledOnce();
  });

  it('clears the selection when the panel close button is clicked', async () => {
    stubMobile(false);
    const user = userEvent.setup();
    const { onClearSelection } = renderCard({
      selectedVocabulary: VOCABULARY,
    });

    await user.click(
      screen.getByRole('button', { name: 'Close word details' }),
    );

    expect(onClearSelection).toHaveBeenCalledOnce();
  });

  it('hides the panel and un-selects the chip when panelOpen is false', () => {
    stubMobile(false);
    renderCard({ selectedVocabulary: VOCABULARY, panelOpen: false });

    expect(
      screen.getByRole('button', { name: 'cuando', pressed: false }),
    ).toBeInTheDocument();
    expect(screen.queryByText('"cuando": "when"')).not.toBeInTheDocument();
  });

  it('hides the mobile modal and un-selects the chip when panelOpen is false', () => {
    stubMobile(true);
    renderCard({ selectedVocabulary: VOCABULARY, panelOpen: false });

    expect(
      screen.getByRole('button', { name: 'cuando', pressed: false }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: 'Details for cuando' }),
    ).not.toBeInTheDocument();
  });

  it('closes the panel when the search field is focused', async () => {
    stubMobile(false);
    const user = userEvent.setup();
    const { onClosePanel } = renderCard({
      selectedVocabulary: VOCABULARY,
    });

    await user.click(
      screen.getByPlaceholderText('Search tags — vocabulary, idiom…'),
    );

    expect(onClosePanel).toHaveBeenCalledOnce();
  });

  it('shows a loading message while the selection is resolving', () => {
    stubMobile(false);
    renderCard({ selectionLoading: true, selectedVocabulary: null });

    expect(screen.getByText('Loading word details…')).toBeInTheDocument();
  });

  it('opens WordPanelModal on mobile instead of the inline panel', () => {
    stubMobile(true);
    renderCard({ selectedVocabulary: VOCABULARY });

    expect(
      screen.getByRole('dialog', { name: 'Details for cuando' }),
    ).toBeInTheDocument();
    expect(screen.getByText('"cuando": "when"')).toBeInTheDocument();
  });

  it('dismisses the suggestion sheet via onSearchTermChange', async () => {
    stubMobile(false);
    const user = userEvent.setup();
    const { onSearchTermChange } = renderCard({
      searchTerm: 'cuan',
      suggestions: SUGGESTIONS,
    });

    // Dismiss by clearing via typing empty — TextInput onChange with ''.
    // Popover onDismiss is also wired; click outside is hard in jsdom.
    // Typing into the field exercises setTagQuery → onSearchTermChange.
    const input = screen.getByPlaceholderText(
      'Search tags — vocabulary, idiom…',
    );
    await user.clear(input);

    expect(onSearchTermChange).toHaveBeenCalled();
  });
});
