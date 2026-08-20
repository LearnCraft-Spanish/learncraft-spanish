import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import { DataTable } from '@interface/components/general/DataTable/DataTable';
import iconButtonStyles from '@interface/components/general/IconButton/IconButton.module.scss';
import {
  buildExampleRow,
  ExampleExpandPanel,
  SpanishSentence,
  splitOnTargetWord,
} from '@interface/components/studentFlashcards/ResultsSection/ExampleRow';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';
import { afterEach, describe, expect, it, vi } from 'vitest';
import rowStyles from './ExampleRow.module.scss';

function makeFlashcards(
  overrides: Partial<UseStudentFlashcardsReturn> = {},
): UseStudentFlashcardsReturn {
  return {
    flashcards: undefined,
    flashcardsDueForReview: undefined,
    customFlashcards: undefined,
    customFlashcardsDueForReview: undefined,
    audioFlashcards: undefined,
    collectedExamples: undefined,
    getRandomFlashcards: vi.fn(() => []),
    isFlashcardCollected: vi.fn(() => false),
    isExampleCollected: vi.fn(() => false),
    isCustomFlashcard: vi.fn(() => false),
    isAddingFlashcard: vi.fn(() => false),
    isRemovingFlashcard: vi.fn(() => false),
    isPendingFlashcard: vi.fn(() => false),
    isLoading: false,
    error: null,
    createFlashcards: vi.fn(async () => []),
    deleteFlashcards: vi.fn(async () => 0),
    updateFlashcards: vi.fn(async () => []),
    updateFlashcardInterval: vi.fn(async () => 1),
    getFlashcardByExampleId: vi.fn(() => undefined),
    ...overrides,
  };
}

function makeExample(
  overrides: Partial<ExampleWithVocabulary> = {},
): ExampleWithVocabulary {
  const vocab = createMockVocabulary({
    word: 'eso',
    spellings: ['eso', 'esa'],
  });
  return {
    ...createMockExampleWithVocabularyList(1, {
      id: 11,
      spanish: 'No quiero eso aquí.',
      english: "I don't want that here.",
      spanishAudio: 'https://cdn.example.com/es.mp3',
      englishAudio: '',
      spanglish: false,
      vocabulary: [vocab],
    })[0],
    ...overrides,
  };
}

const emptyLessonPopup: LessonPopup = {
  lessonsByVocabulary: [],
  lessonsLoading: false,
};

describe('splitOnTargetWord', () => {
  afterEach(() => {
    cleanup();
  });

  it('emphasizes the vocabulary word that appears in the sentence', () => {
    const vocab = createMockVocabulary({
      word: 'eso',
      spellings: ['eso'],
    });

    expect(splitOnTargetWord('No quiero eso aquí.', [vocab])).toEqual({
      pre: 'No quiero ',
      word: 'eso',
      post: ' aquí.',
    });
  });

  it('matches a spelling and prefers the longest candidate', () => {
    const short = createMockVocabulary({
      word: 'es',
      spellings: ['es'],
    });
    const long = createMockVocabulary({
      word: 'eso',
      spellings: ['eso'],
    });

    expect(splitOnTargetWord('¿Encontraron eso?', [short, long])).toEqual({
      pre: '¿Encontraron ',
      word: 'eso',
      post: '?',
    });
  });

  it('returns null when no vocabulary word is in the sentence', () => {
    const vocab = createMockVocabulary({
      word: 'contigo',
      spellings: ['contigo'],
    });

    expect(splitOnTargetWord('No quiero eso aquí.', [vocab])).toBeNull();
  });

  it('ignores empty candidate strings', () => {
    const vocab = createMockVocabulary({
      word: '',
      spellings: [''],
    });

    expect(splitOnTargetWord('No quiero eso aquí.', [vocab])).toBeNull();
  });
});

describe('spanish sentence', () => {
  afterEach(() => {
    cleanup();
  });

  it('wraps the target word at weight 900', () => {
    const vocab = createMockVocabulary({
      word: 'eso',
      spellings: ['eso'],
    });
    const { container } = render(
      <SpanishSentence spanish="No quiero eso aquí." vocabulary={[vocab]} />,
    );

    expect(container.querySelector('strong')).toHaveTextContent('eso');
    expect(container.querySelector('strong')?.parentElement).toHaveClass(
      rowStyles.sentence,
    );
  });

  it('renders the full sentence when nothing can be emphasized', () => {
    const vocab = createMockVocabulary({
      word: 'contigo',
      spellings: ['contigo'],
    });
    const { container } = render(
      <SpanishSentence spanish="No quiero eso aquí." vocabulary={[vocab]} />,
    );

    expect(screen.getByText('No quiero eso aquí.')).toBeInTheDocument();
    expect(container.querySelector('strong')).not.toBeInTheDocument();
  });

  it('renders the full sentence when there is no vocabulary', () => {
    render(<SpanishSentence spanish="Hola." vocabulary={[]} />);

    expect(screen.getByText('Hola.')).toBeInTheDocument();
  });
});

describe('example expand panel', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows a loading line while lessonPopup is fetching', () => {
    const example = makeExample();
    render(
      <ContextualMenuProvider>
        <ExampleExpandPanel
          example={example}
          openVocabId={example.vocabulary[0].id}
          lessonPopup={{ lessonsByVocabulary: [], lessonsLoading: true }}
          studentFlashcards={makeFlashcards()}
          onToggleVocab={vi.fn()}
        />
      </ContextualMenuProvider>,
    );

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows that no lessons were found', () => {
    const example = makeExample();
    render(
      <ContextualMenuProvider>
        <ExampleExpandPanel
          example={example}
          openVocabId={example.vocabulary[0].id}
          lessonPopup={emptyLessonPopup}
          studentFlashcards={makeFlashcards()}
          onToggleVocab={vi.fn()}
        />
      </ContextualMenuProvider>,
    );

    expect(screen.getByText('No lessons found')).toBeInTheDocument();
  });

  it('sorts lessons so the earliest number is first taught', () => {
    const example = makeExample();
    render(
      <ContextualMenuProvider>
        <ExampleExpandPanel
          example={example}
          openVocabId={example.vocabulary[0].id}
          lessonPopup={{
            lessonsLoading: false,
            lessonsByVocabulary: [
              { id: 9, courseName: 'Later course', lessonNumber: 14 },
              { id: 2, courseName: 'Unit 1 · Demonstratives', lessonNumber: 2 },
            ],
          }}
          studentFlashcards={makeFlashcards()}
          onToggleVocab={vi.fn()}
        />
      </ContextualMenuProvider>,
    );

    expect(screen.getByText('Lesson 2')).toBeInTheDocument();
    expect(screen.queryByText('Lesson 14')).not.toBeInTheDocument();
  });

  it('omits the tag hint when the flashcard has no vocabulary', () => {
    render(
      <ContextualMenuProvider>
        <ExampleExpandPanel
          example={makeExample({ vocabulary: [] })}
          openVocabId={null}
          lessonPopup={emptyLessonPopup}
          studentFlashcards={makeFlashcards()}
          onToggleVocab={vi.fn()}
        />
      </ContextualMenuProvider>,
    );

    expect(
      screen.queryByText("Click a tag to see where it's taught."),
    ).not.toBeInTheDocument();
  });
});

describe('buildExampleRow', () => {
  afterEach(() => {
    cleanup();
  });

  it('disables add while a flashcard is pending', async () => {
    const user = userEvent.setup();
    const studentFlashcards = makeFlashcards({
      isAddingFlashcard: vi.fn(() => true),
    });
    const row = buildExampleRow({
      example: makeExample(),
      selected: false,
      expanded: false,
      playing: null,
      openVocabId: null,
      studentFlashcards,
      lessonPopup: emptyLessonPopup,
      onToggleSelected: vi.fn(),
      onToggleExpanded: vi.fn(),
      onTogglePlay: vi.fn(),
      onToggleVocab: vi.fn(),
    });

    render(
      <DataTable
        columns={[
          { id: 'select', header: '' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'english', header: 'English' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(studentFlashcards.createFlashcards).not.toHaveBeenCalled();
  });

  it('disables in-set while a flashcard is being removed', () => {
    const studentFlashcards = makeFlashcards({
      isExampleCollected: vi.fn(() => true),
      isRemovingFlashcard: vi.fn(() => true),
    });
    const row = buildExampleRow({
      example: makeExample(),
      selected: false,
      expanded: false,
      playing: null,
      openVocabId: null,
      studentFlashcards,
      lessonPopup: emptyLessonPopup,
      onToggleSelected: vi.fn(),
      onToggleExpanded: vi.fn(),
      onTogglePlay: vi.fn(),
      onToggleVocab: vi.fn(),
    });

    render(
      <DataTable
        columns={[
          { id: 'select', header: '' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'english', header: 'English' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    expect(screen.getByRole('button', { name: 'In set' })).toBeDisabled();
  });

  it('plays a clip with an empty url as visual-only state', async () => {
    const user = userEvent.setup();
    const onTogglePlay = vi.fn();
    const row = buildExampleRow({
      example: makeExample({ englishAudio: '' }),
      selected: false,
      expanded: false,
      playing: null,
      openVocabId: null,
      studentFlashcards: makeFlashcards(),
      lessonPopup: emptyLessonPopup,
      onToggleSelected: vi.fn(),
      onToggleExpanded: vi.fn(),
      onTogglePlay,
      onToggleVocab: vi.fn(),
    });

    render(
      <DataTable
        columns={[
          { id: 'select', header: '' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'english', header: 'English' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Play English' }));

    expect(onTogglePlay).toHaveBeenCalledWith('11:en', '');
  });

  it('uses glyph-sized audio and expand controls, not 32px squares', () => {
    const row = buildExampleRow({
      example: makeExample(),
      selected: false,
      expanded: false,
      playing: null,
      openVocabId: null,
      studentFlashcards: makeFlashcards(),
      lessonPopup: emptyLessonPopup,
      onToggleSelected: vi.fn(),
      onToggleExpanded: vi.fn(),
      onTogglePlay: vi.fn(),
      onToggleVocab: vi.fn(),
    });

    render(
      <DataTable
        columns={[
          { id: 'select', header: '' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'english', header: 'English' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    expect(screen.getByRole('button', { name: 'Play Spanish' })).toHaveClass(
      iconButtonStyles.fit,
    );
    expect(screen.getByRole('button', { name: 'Play English' })).toHaveClass(
      iconButtonStyles.fit,
    );
    expect(screen.getByRole('button', { name: 'Expand row' })).toHaveClass(
      iconButtonStyles.fit,
    );
    expect(
      screen.getByRole('button', { name: 'Play Spanish' }),
    ).not.toHaveClass(iconButtonStyles.sm);
  });
});
