import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import { DataTable } from '@interface/components/general/DataTable/DataTable';
import iconButtonStyles from '@interface/components/general/IconButton/IconButton.module.scss';
import {
  buildExampleRow,
  ExampleExpandPanel,
  exampleRowLabel,
  SpanishSentence,
} from '@interface/components/studentFlashcards/ResultsSection/ExampleRow';
import { PartOfSpeech } from '@learncraft-spanish/shared';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';
import { trackedRejection } from '@testing/utils/trackedRejection';
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

/** `makeExample` speaks this sentence, and every control is named after it. */
const EXPAND_LABEL = 'Expand row: No quiero eso aquí.';
/** Owned/Remove button keeps this accessible name at rest and on hover. */
const OWNED_REMOVE_NAME = 'Remove No quiero eso aquí. from your collection';

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

  it('leaves out the review-schedule column when no dates are given', () => {
    render(
      <ContextualMenuProvider>
        <ExampleExpandPanel
          example={makeExample()}
          openVocabId={null}
          lessonPopup={emptyLessonPopup}
          studentFlashcards={makeFlashcards()}
          onToggleVocab={vi.fn()}
        />
      </ContextualMenuProvider>,
    );

    expect(screen.queryByText('Review schedule')).not.toBeInTheDocument();
    expect(screen.queryByText('Added on:')).not.toBeInTheDocument();
    expect(screen.queryByText('Last Reviewed:')).not.toBeInTheDocument();
    expect(screen.queryByText('Next SRS Review:')).not.toBeInTheDocument();
  });

  it('shows the review-schedule dates when they are given', () => {
    render(
      <ContextualMenuProvider>
        <ExampleExpandPanel
          example={makeExample()}
          openVocabId={null}
          lessonPopup={emptyLessonPopup}
          studentFlashcards={makeFlashcards()}
          reviewSchedule={{
            addedOn: '2024-03-07T12:00:00Z',
            lastReviewed: '2024-11-21T12:00:00Z',
            nextReview: '2025-01-09T12:00:00Z',
          }}
          onToggleVocab={vi.fn()}
        />
      </ContextualMenuProvider>,
    );

    expect(screen.getByText('Review schedule')).toBeInTheDocument();
    expect(screen.getByText('Added on:')).toBeInTheDocument();
    expect(screen.getByText('03/07/2024')).toBeInTheDocument();
    expect(screen.getByText('Last Reviewed:')).toBeInTheDocument();
    expect(screen.getByText('11/21/2024')).toBeInTheDocument();
    expect(screen.getByText('Next SRS Review:')).toBeInTheDocument();
    expect(screen.getByText('01/09/2025')).toBeInTheDocument();
  });

  it('falls back to unknown, Never, and Today for missing dates', () => {
    render(
      <ContextualMenuProvider>
        <ExampleExpandPanel
          example={makeExample()}
          openVocabId={null}
          lessonPopup={emptyLessonPopup}
          studentFlashcards={makeFlashcards()}
          reviewSchedule={{
            addedOn: null,
            lastReviewed: '',
            nextReview: '',
          }}
          onToggleVocab={vi.fn()}
        />
      </ContextualMenuProvider>,
    );

    expect(screen.getByText('unknown')).toBeInTheDocument();
    expect(screen.getByText('Never')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
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

describe('exampleRowLabel', () => {
  it('names a row by what it says', () => {
    expect(exampleRowLabel(makeExample())).toBe('No quiero eso aquí.');
  });

  it('drops the asterisks around embedded English', () => {
    expect(exampleRowLabel(makeExample({ spanish: 'Son de *wood.*' }))).toBe(
      'Son de wood.',
    );
  });

  it('truncates a long sentence rather than reading a paragraph', () => {
    const label = exampleRowLabel(
      makeExample({
        spanish:
          'Cuando termine de trabajar voy a pasar por la tienda para comprar algo de cenar.',
      }),
    );

    expect(label).toBe(
      'Cuando termine de trabajar voy a pasar por la tienda para co…',
    );
    expect(label.length).toBeLessThanOrEqual(61);
  });

  it('falls back to the id so a name is never empty', () => {
    expect(exampleRowLabel(makeExample({ spanish: '   ' }))).toBe('example 11');
  });
});

describe('buildExampleRow', () => {
  afterEach(() => {
    cleanup();
  });

  it('names the checkbox and the chevron after the row, not the row number', () => {
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
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    // "Select example 8412" and 25 copies of "Expand row" identify nothing in
    // a screen-reader rotor listing.
    expect(
      screen.getByRole('checkbox', { name: 'Select No quiero eso aquí.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: EXPAND_LABEL }),
    ).toBeInTheDocument();
  });

  it('orders sentence cells English then Spanish', () => {
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
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    const dataRow = screen.getAllByRole('row')[1];
    const english = within(dataRow).getByText("I don't want that here.");
    const spanish = within(dataRow).getByText('No quiero eso aquí.');

    expect(
      english.compareDocumentPosition(spanish) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('names the chevron for collapsing once the row is open', () => {
    const row = buildExampleRow({
      example: makeExample(),
      selected: false,
      expanded: true,
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
      <ContextualMenuProvider>
        <DataTable
          columns={[
            { id: 'select', header: '' },
            { id: 'english', header: 'English' },
            { id: 'spanish', header: 'Spanish' },
            { id: 'actions', header: '' },
          ]}
          rows={[row]}
          columnTemplate="44px 1fr 1fr 132px"
          caption="Row"
        />
      </ContextualMenuProvider>,
    );

    expect(
      screen.getByRole('button', { name: 'Collapse row: No quiero eso aquí.' }),
    ).toBeInTheDocument();
  });

  it('hands focus off before a row Remove deletes the button holding it', async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    const studentFlashcards = makeFlashcards({
      isExampleCollected: vi.fn(() => true),
      deleteFlashcards: vi.fn(async () => {
        calls.push('delete');
        return 1;
      }),
    });
    const row = buildExampleRow({
      example: makeExample(),
      selected: false,
      expanded: false,
      playing: null,
      openVocabId: null,
      studentFlashcards,
      lessonPopup: emptyLessonPopup,
      rowAction: 'remove',
      onRemoveRequested: () => {
        calls.push('focus');
      },
      onToggleSelected: vi.fn(),
      onToggleExpanded: vi.fn(),
      onTogglePlay: vi.fn(),
      onToggleVocab: vi.fn(),
    });

    render(
      <DataTable
        columns={[
          { id: 'select', header: '' },
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    await user.click(screen.getByRole('button', { name: OWNED_REMOVE_NAME }));

    expect(calls).toEqual(['focus', 'delete']);
  });

  it('never asks for a focus hand-off under the finder row action', async () => {
    const user = userEvent.setup();
    const onRemoveRequested = vi.fn<() => void>();
    const studentFlashcards = makeFlashcards({
      isExampleCollected: vi.fn(() => true),
    });
    const row = buildExampleRow({
      example: makeExample(),
      selected: false,
      expanded: false,
      playing: null,
      openVocabId: null,
      studentFlashcards,
      lessonPopup: emptyLessonPopup,
      onRemoveRequested,
      onToggleSelected: vi.fn(),
      onToggleExpanded: vi.fn(),
      onTogglePlay: vi.fn(),
      onToggleVocab: vi.fn(),
    });

    render(
      <DataTable
        columns={[
          { id: 'select', header: '' },
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    // Owned swaps back to Add in place, so the button the student is
    // standing on survives and focus must not move.
    await user.click(screen.getByRole('button', { name: OWNED_REMOVE_NAME }));

    expect(studentFlashcards.deleteFlashcards).toHaveBeenCalledWith([11]);
    expect(onRemoveRequested).not.toHaveBeenCalled();
  });

  it('shows Add on an uncollected finder row and Owned at rest once collected', () => {
    const uncollected = buildExampleRow({
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

    const { rerender } = render(
      <DataTable
        columns={[
          { id: 'select', header: '' },
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'actions', header: '' },
        ]}
        rows={[uncollected]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: OWNED_REMOVE_NAME }),
    ).not.toBeInTheDocument();

    const collected = buildExampleRow({
      example: makeExample(),
      selected: false,
      expanded: false,
      playing: null,
      openVocabId: null,
      studentFlashcards: makeFlashcards({
        isExampleCollected: vi.fn(() => true),
      }),
      lessonPopup: emptyLessonPopup,
      onToggleSelected: vi.fn(),
      onToggleExpanded: vi.fn(),
      onTogglePlay: vi.fn(),
      onToggleVocab: vi.fn(),
    });

    rerender(
      <DataTable
        columns={[
          { id: 'select', header: '' },
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'actions', header: '' },
        ]}
        rows={[collected]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    const owned = screen.getByRole('button', { name: OWNED_REMOVE_NAME });
    expect(owned).toBeInTheDocument();
    // Accessible name stays the remove phrasing — never "Owned" or "Remove".
    expect(
      screen.queryByRole('button', { name: 'Owned' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove' }),
    ).not.toBeInTheDocument();
    // Finder keeps the Owned/Remove width-reservation stack; Manager does not.
    // This fails if someone later made the Finder show "Remove" at rest.
    expect(
      owned.querySelector(`.${rowStyles.ownedRestLabel}`),
    ).toHaveTextContent('Owned');
    expect(
      owned.querySelector(`.${rowStyles.ownedHoverLabel}`),
    ).toHaveTextContent('Remove');
    expect(owned.parentElement).toHaveClass(rowStyles.ownedAction);
    expect(owned.parentElement).not.toHaveClass(rowStyles.removeAction);
  });

  it('shows Adding... while an add is in flight', async () => {
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
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    const button = screen.getByRole('button', { name: 'Adding...' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(studentFlashcards.createFlashcards).not.toHaveBeenCalled();
  });

  it('shows Removing... while a removal is in flight on a collected finder row', () => {
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
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    expect(screen.getByRole('button', { name: 'Removing...' })).toBeDisabled();
  });

  it('shows always-visible Remove on a manager row, not Owned', async () => {
    const user = userEvent.setup();
    const studentFlashcards = makeFlashcards({
      isExampleCollected: vi.fn(() => true),
    });
    const row = buildExampleRow({
      example: makeExample(),
      selected: false,
      expanded: false,
      playing: null,
      openVocabId: null,
      studentFlashcards,
      lessonPopup: emptyLessonPopup,
      rowAction: 'remove',
      onToggleSelected: vi.fn(),
      onToggleExpanded: vi.fn(),
      onTogglePlay: vi.fn(),
      onToggleVocab: vi.fn(),
    });

    render(
      <DataTable
        columns={[
          { id: 'select', header: '' },
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Add' }),
    ).not.toBeInTheDocument();
    // Accessible name stays the per-row phrasing, never bare "Owned"/"Remove".
    expect(
      screen.queryByRole('button', { name: 'Owned' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove' }),
    ).not.toBeInTheDocument();

    const remove = screen.getByRole('button', { name: OWNED_REMOVE_NAME });
    expect(remove.parentElement).toHaveClass(rowStyles.removeAction);
    expect(remove.parentElement).not.toHaveClass(rowStyles.ownedAction);
    // Manager drops the Owned/Remove stack — visible label is Remove at rest.
    expect(remove.querySelector(`.${rowStyles.ownedRestLabel}`)).toBeNull();
    expect(remove.querySelector(`.${rowStyles.ownedHoverLabel}`)).toBeNull();
    expect(remove).toHaveTextContent('Remove');
    expect(remove).not.toHaveTextContent('Owned');
    expect(
      screen.getByRole('button', { name: EXPAND_LABEL }),
    ).toBeInTheDocument();

    await user.click(remove);

    expect(studentFlashcards.deleteFlashcards).toHaveBeenCalledWith([11]);
  });

  it.each([
    {
      name: OWNED_REMOVE_NAME,
      rowAction: 'remove' as const,
      collected: true,
    },
    {
      name: OWNED_REMOVE_NAME,
      rowAction: 'collect' as const,
      collected: true,
    },
    { name: 'Add', rowAction: 'collect' as const, collected: false },
  ])(
    'handles the rejection of $name instead of leaving it to escape',
    async ({ name, rowAction, collected }) => {
      const user = userEvent.setup();
      const rejection = trackedRejection('No access to this flashcard');
      const studentFlashcards = makeFlashcards({
        isExampleCollected: vi.fn(() => collected),
        deleteFlashcards: vi.fn(rejection.reject),
        createFlashcards: vi.fn(rejection.reject),
      });
      const row = buildExampleRow({
        example: makeExample(),
        selected: false,
        expanded: false,
        playing: null,
        openVocabId: null,
        studentFlashcards,
        lessonPopup: emptyLessonPopup,
        rowAction,
        onToggleSelected: vi.fn(),
        onToggleExpanded: vi.fn(),
        onTogglePlay: vi.fn(),
        onToggleVocab: vi.fn(),
      });

      render(
        <DataTable
          columns={[
            { id: 'select', header: '' },
            { id: 'english', header: 'English' },
            { id: 'spanish', header: 'Spanish' },
            { id: 'actions', header: '' },
          ]}
          rows={[row]}
          columnTemplate="44px 1fr 1fr 132px"
          caption="Row"
        />,
      );

      await user.click(screen.getByRole('button', { name }));

      expect(rejection.wasHandled()).toBe(true);
      // The query layer owns the failure toast, so the row itself must look
      // exactly as it did before the failed click.
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    },
  );

  it('reports a removal in flight and blocks a second click', async () => {
    const user = userEvent.setup();
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
      rowAction: 'remove',
      onToggleSelected: vi.fn(),
      onToggleExpanded: vi.fn(),
      onTogglePlay: vi.fn(),
      onToggleVocab: vi.fn(),
    });

    render(
      <DataTable
        columns={[
          { id: 'select', header: '' },
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    const button = screen.getByRole('button', { name: 'Removing...' });
    expect(button).toBeDisabled();

    await user.click(button);

    expect(studentFlashcards.deleteFlashcards).not.toHaveBeenCalled();
  });

  it('disables the owned button while the same example is being added', () => {
    const studentFlashcards = makeFlashcards({
      isExampleCollected: vi.fn(() => true),
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
      rowAction: 'remove',
      onToggleSelected: vi.fn(),
      onToggleExpanded: vi.fn(),
      onTogglePlay: vi.fn(),
      onToggleVocab: vi.fn(),
    });

    render(
      <DataTable
        columns={[
          { id: 'select', header: '' },
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
          { id: 'actions', header: '' },
        ]}
        rows={[row]}
        columnTemplate="44px 1fr 1fr 132px"
        caption="Row"
      />,
    );

    expect(
      screen.getByRole('button', { name: OWNED_REMOVE_NAME }),
    ).toBeDisabled();
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
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
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
      screen.getByRole('button', { name: EXPAND_LABEL }),
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
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
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
          { id: 'english', header: 'English' },
          { id: 'spanish', header: 'Spanish' },
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
    expect(screen.getByRole('button', { name: EXPAND_LABEL })).toHaveClass(
      iconButtonStyles.fit,
    );
    expect(
      screen.getByRole('button', { name: 'Play Spanish' }),
    ).not.toHaveClass(iconButtonStyles.sm);
  });
});
