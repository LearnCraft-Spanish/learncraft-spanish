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
} from '@interface/components/studentFlashcards/ResultsSection/ExampleRow';
import { PartOfSpeech } from '@learncraft-spanish/shared';
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
    type: 'nonverb',
    descriptor: 'that (demonstrative)',
    subcategory: {
      id: 1,
      name: 'Demonstratives',
      category: 'Pronouns',
      partOfSpeech: PartOfSpeech.Pronoun,
    },
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

describe('spanish sentence', () => {
  afterEach(() => {
    cleanup();
  });

  it('bolds Spanish and leaves asterisk-wrapped English at regular weight', () => {
    const { container } = render(<SpanishSentence spanish="Son de *wood.*" />);

    const runs = container.querySelectorAll(`.${rowStyles.sentence} > span`);
    expect(runs).toHaveLength(2);
    expect(runs[0]).toHaveClass(rowStyles.spanishRun);
    expect(runs[0]).toHaveTextContent('Son de');
    expect(runs[1]).toHaveClass(rowStyles.embeddedEnglish);
    expect(runs[1]).toHaveTextContent('wood.');
    expect(container.querySelector(`.${rowStyles.sentence}`)).toHaveTextContent(
      'Son de wood.',
    );
    expect(container.textContent).not.toContain('*');
  });

  it('bolds the full sentence when there is no embedded English', () => {
    const { container } = render(
      <SpanishSentence spanish="No quiero eso aquí." />,
    );

    const run = container.querySelector(`.${rowStyles.spanishRun}`);
    expect(run).toHaveTextContent('No quiero eso aquí.');
    expect(
      container.querySelector(`.${rowStyles.embeddedEnglish}`),
    ).not.toBeInTheDocument();
  });

  it('renders multiple English stretches and keeps surrounding Spanish bold', () => {
    const { container } = render(
      <SpanishSentence spanish="El *wood* es *hard*" />,
    );

    const runs = container.querySelectorAll(`.${rowStyles.sentence} > span`);
    expect(runs[0]).toHaveClass(rowStyles.spanishRun);
    expect(runs[1]).toHaveClass(rowStyles.embeddedEnglish);
    expect(runs[1]).toHaveTextContent('wood');
    expect(runs[2]).toHaveClass(rowStyles.spanishRun);
    expect(runs[3]).toHaveClass(rowStyles.embeddedEnglish);
    expect(runs[3]).toHaveTextContent('hard');
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

  it('lists every lesson the word is taught in', () => {
    const example = makeExample();
    render(
      <ContextualMenuProvider>
        <ExampleExpandPanel
          example={example}
          openVocabId={example.vocabulary[0].id}
          lessonPopup={{
            lessonsLoading: false,
            currentCourseName: 'Unit 1 · Demonstratives',
            lessonsByVocabulary: [
              { id: 2, courseName: 'Unit 1 · Demonstratives', lessonNumber: 2 },
              { id: 9, courseName: 'Later course', lessonNumber: 14 },
            ],
          }}
          studentFlashcards={makeFlashcards()}
          onToggleVocab={vi.fn()}
        />
      </ContextualMenuProvider>,
    );

    expect(screen.getByText('that (demonstrative)')).toBeInTheDocument();
    expect(screen.getByText('Part of Speech: Pronoun')).toBeInTheDocument();
    expect(screen.getByText('Category: Pronouns')).toBeInTheDocument();
    expect(screen.getByText('Taught in')).toBeInTheDocument();
    expect(screen.getByText('Lesson 2')).toBeInTheDocument();
    expect(screen.getByText('Unit 1 · Demonstratives')).toBeInTheDocument();
    expect(screen.getByText('Lesson 14')).toBeInTheDocument();
    expect(screen.getByText('Later course')).toBeInTheDocument();
  });

  it('marks lessons from the current course', () => {
    const example = makeExample();
    const { container } = render(
      <ContextualMenuProvider>
        <ExampleExpandPanel
          example={example}
          openVocabId={example.vocabulary[0].id}
          lessonPopup={{
            lessonsLoading: false,
            currentCourseName: 'Unit 1 · Demonstratives',
            lessonsByVocabulary: [
              { id: 2, courseName: 'Unit 1 · Demonstratives', lessonNumber: 2 },
              { id: 9, courseName: 'Later course', lessonNumber: 14 },
            ],
          }}
          studentFlashcards={makeFlashcards()}
          onToggleVocab={vi.fn()}
        />
      </ContextualMenuProvider>,
    );

    const items = container.querySelectorAll('li');
    expect(items[0]).toHaveClass(rowStyles.vocabLessonItemCurrent);
    expect(items[1]).not.toHaveClass(rowStyles.vocabLessonItemCurrent);
  });

  it('shows verb infinitive and conjugation notes for a verb tag', () => {
    const verb = createMockVocabulary({
      word: 'ser',
      spellings: ['ser'],
      type: 'verb',
      descriptor: 'to be (permanent)',
      conjugationTags: ['present'],
      verb: { id: 1, infinitive: 'ser' },
      subcategory: {
        id: 2,
        name: 'Ser and Estar',
        category: 'Verbs',
        partOfSpeech: PartOfSpeech.Verb,
      },
    });
    const example = makeExample({ vocabulary: [verb] });
    render(
      <ContextualMenuProvider>
        <ExampleExpandPanel
          example={example}
          openVocabId={verb.id}
          lessonPopup={emptyLessonPopup}
          studentFlashcards={makeFlashcards()}
          onToggleVocab={vi.fn()}
        />
      </ContextualMenuProvider>,
    );

    expect(screen.getByText('to be (permanent)')).toBeInTheDocument();
    expect(screen.getByText('Part of Speech: Verb')).toBeInTheDocument();
    expect(screen.getByText('Verb Infinitive: ser')).toBeInTheDocument();
    expect(screen.getByText('Conjugation Notes: present')).toBeInTheDocument();
    expect(screen.queryByText(/Category:/)).not.toBeInTheDocument();
  });

  it('dismisses the vocab popover on a click outside', async () => {
    const user = userEvent.setup();
    const onToggleVocab = vi.fn();
    const example = makeExample();
    render(
      <div>
        <span>outside</span>
        <ContextualMenuProvider>
          <ExampleExpandPanel
            example={example}
            openVocabId={example.vocabulary[0].id}
            lessonPopup={emptyLessonPopup}
            studentFlashcards={makeFlashcards()}
            onToggleVocab={onToggleVocab}
          />
        </ContextualMenuProvider>
      </div>,
    );

    await user.click(screen.getByText('outside'));

    expect(onToggleVocab).toHaveBeenCalledWith(example.vocabulary[0].id);
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

  it('disables collect while a flashcard is pending', async () => {
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

    expect(screen.getByRole('button', { name: 'Collect' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Collect' }));
    expect(studentFlashcards.createFlashcards).not.toHaveBeenCalled();
  });

  it('disables owned while a flashcard is being removed', () => {
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

    expect(screen.getByRole('button', { name: 'Owned' })).toBeDisabled();
  });

  it('hides play controls when the example has no audio links', () => {
    const row = buildExampleRow({
      example: makeExample({ spanishAudio: '', englishAudio: '' }),
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

    expect(
      screen.queryByRole('button', { name: 'Play Spanish' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Play English' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Expand row' }),
    ).toBeInTheDocument();
  });

  it('shows only the Spanish play control when only Spanish audio exists', () => {
    const row = buildExampleRow({
      example: makeExample({
        spanishAudio: 'https://cdn.example.com/es.mp3',
        englishAudio: '',
      }),
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

    expect(
      screen.getByRole('button', { name: 'Play Spanish' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Play English' }),
    ).not.toBeInTheDocument();
  });

  it('uses glyph-sized audio and expand controls, not 32px squares', () => {
    const row = buildExampleRow({
      example: makeExample({
        englishAudio: 'https://cdn.example.com/en.mp3',
      }),
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
