import mockUseVocabulary, {
  overrideMockUseVocabulary,
  resetMockUseVocabulary,
} from '@application/units/useVocabulary/useVocabulary.mock';
import {
  createMockExampleEditorRow,
  mockExampleEditorColumns,
  mockUseExampleEditor,
  overrideMockUseExampleEditor,
  resetMockUseExampleEditor,
} from '@application/useCases/useExampleEditor/useExampleEditor.mock';
import { ExampleEditor } from '@interface/components/ExampleEditorInterface/ExampleEditor';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useExampleEditor', () => ({
  useExampleEditor: () => mockUseExampleEditor(),
}));

vi.mock('@application/units/useVocabulary/useVocabulary', () => ({
  default: () => mockUseVocabulary,
}));

const spanishAudioUrl = 'https://example.com/ex1la.mp3';
const englishAudioUrl = 'https://example.com/ex1en.mp3';

const vocabulary = [
  createMockVocabulary({
    id: 1,
    word: 'hablar',
    descriptor: 'to speak',
    type: 'nonverb',
  }),
  createMockVocabulary({
    id: 2,
    word: 'comer',
    descriptor: 'to eat',
    type: 'nonverb',
  }),
  createMockVocabulary({
    id: 3,
    word: 'casa',
    descriptor: 'house',
    type: 'nonverb',
  }),
];

/** Overrides the use case with the given rows and a recording cell-change handler. */
function setRows(rows: ReturnType<typeof createMockExampleEditorRow>[]) {
  const onCellChange = vi.fn<(r: string, c: string, v: string) => void>();
  overrideMockUseExampleEditor({
    tableProps: {
      rows,
      columns: mockExampleEditorColumns,
      dirtyRowIds: new Set(),
      validationErrors: {},
      onCellChange,
      hasUnsavedChanges: false,
      isLoading: false,
      isSaving: false,
      isValid: true,
    },
  });
  return onCellChange;
}

function renderEditor(
  setHasUnsavedEditedExamples: (value: boolean) => void = vi.fn(),
) {
  return render(
    <MockAllProviders>
      <ExampleEditor
        setHasUnsavedEditedExamples={setHasUnsavedEditedExamples}
      />
    </MockAllProviders>,
  );
}

function addVocabulary(searchText: string, descriptor: string) {
  fireEvent.change(screen.getByPlaceholderText('Search vocabulary...'), {
    target: { value: searchText },
  });
  fireEvent.click(screen.getByText(descriptor));
}

describe('exampleEditor', () => {
  beforeEach(() => {
    resetMockUseExampleEditor();
    resetMockUseVocabulary();
    overrideMockUseVocabulary({ vocabulary });
  });

  describe('table', () => {
    it('shows each example under labelled columns', () => {
      setRows([
        createMockExampleEditorRow(4, {
          spanish: 'Hola amigo',
          english: 'Hello friend',
        }),
      ]);
      renderEditor();

      expect(
        screen.getByRole('heading', { name: 'Example Editor' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Related Vocabulary' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Spanish Audio' }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Spanish')).toHaveValue('Hola amigo');
      expect(screen.getByLabelText('English')).toHaveValue('Hello friend');
    });

    it('reports an edit to the spanish text for the row that was edited', () => {
      const onCellChange = setRows([
        createMockExampleEditorRow(1),
        createMockExampleEditorRow(2),
      ]);
      renderEditor();

      fireEvent.change(screen.getAllByLabelText('Spanish')[1], {
        target: { value: 'Texto nuevo' },
      });

      expect(onCellChange).toHaveBeenCalledTimes(1);
      expect(onCellChange).toHaveBeenCalledWith(
        'row-2',
        'spanish',
        'Texto nuevo',
      );
    });

    it('hands saving and discarding to the use case', () => {
      const onSave = vi.fn(async () => {});
      const onDiscard = vi.fn();
      overrideMockUseExampleEditor({
        tableProps: {
          ...mockUseExampleEditor().tableProps,
          hasUnsavedChanges: true,
          onSave,
          onDiscard,
        },
      });
      renderEditor();

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      fireEvent.click(screen.getByRole('button', { name: 'Discard' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onDiscard).toHaveBeenCalledTimes(1);
    });
  });

  describe('save error', () => {
    it('shows the error message when saving failed', () => {
      overrideMockUseExampleEditor({ saveError: new Error('Network down') });
      renderEditor();

      expect(
        screen.getByText('Error saving: Network down'),
      ).toBeInTheDocument();
    });

    it('shows no error message when there is no save error', () => {
      renderEditor();

      expect(screen.queryByText(/Error saving/)).not.toBeInTheDocument();
    });
  });

  describe('unsaved changes', () => {
    it('tells the parent there are no unsaved examples when nothing changed', () => {
      const setHasUnsavedEditedExamples = vi.fn();
      renderEditor(setHasUnsavedEditedExamples);

      expect(setHasUnsavedEditedExamples).toHaveBeenLastCalledWith(false);
    });

    it('tells the parent when there are unsaved examples', () => {
      overrideMockUseExampleEditor({
        tableProps: {
          ...mockUseExampleEditor().tableProps,
          hasUnsavedChanges: true,
        },
      });
      const setHasUnsavedEditedExamples = vi.fn();
      renderEditor(setHasUnsavedEditedExamples);

      expect(setHasUnsavedEditedExamples).toHaveBeenLastCalledWith(true);
    });

    it('treats a missing unsaved-changes flag as no unsaved examples', () => {
      overrideMockUseExampleEditor({
        tableProps: {
          ...mockUseExampleEditor().tableProps,
          hasUnsavedChanges: undefined,
        },
      });
      const setHasUnsavedEditedExamples = vi.fn();
      renderEditor(setHasUnsavedEditedExamples);

      expect(setHasUnsavedEditedExamples).toHaveBeenLastCalledWith(false);
    });

    it('updates the parent when the unsaved state changes', () => {
      const setHasUnsavedEditedExamples = vi.fn();
      const { rerender } = renderEditor(setHasUnsavedEditedExamples);
      expect(setHasUnsavedEditedExamples).toHaveBeenLastCalledWith(false);

      overrideMockUseExampleEditor({
        tableProps: {
          ...mockUseExampleEditor().tableProps,
          hasUnsavedChanges: true,
        },
      });
      rerender(
        <MockAllProviders>
          <ExampleEditor
            setHasUnsavedEditedExamples={setHasUnsavedEditedExamples}
          />
        </MockAllProviders>,
      );

      expect(setHasUnsavedEditedExamples).toHaveBeenLastCalledWith(true);
    });
  });

  describe('audio columns', () => {
    it('plays audio only for rows that have audio urls', () => {
      setRows([
        createMockExampleEditorRow(1, {
          hasAudio: 'true',
          spanishAudio: spanishAudioUrl,
          englishAudio: englishAudioUrl,
        }),
        createMockExampleEditorRow(2),
      ]);
      renderEditor();

      expect(screen.getAllByLabelText('Play/Pause')).toHaveLength(2);
    });

    it('reports audio load failures and successes by row and audio column', () => {
      overrideMockUseExampleEditor({
        audioErrorHandlers: {
          onAudioError: vi.fn(),
          onAudioSuccess: vi.fn(),
        },
      });
      const { audioErrorHandlers } = mockUseExampleEditor();
      setRows([
        createMockExampleEditorRow(1, {
          hasAudio: 'true',
          spanishAudio: spanishAudioUrl,
          englishAudio: englishAudioUrl,
        }),
      ]);
      const { container } = renderEditor();
      const [spanishAudio, englishAudio] = Array.from(
        container.querySelectorAll('audio'),
      );

      fireEvent.error(spanishAudio);
      fireEvent.canPlay(englishAudio);

      expect(audioErrorHandlers.onAudioError).toHaveBeenCalledTimes(1);
      expect(audioErrorHandlers.onAudioError).toHaveBeenCalledWith(
        'row-1',
        'spanishAudio',
      );
      expect(audioErrorHandlers.onAudioSuccess).toHaveBeenCalledTimes(1);
      expect(audioErrorHandlers.onAudioSuccess).toHaveBeenCalledWith(
        'row-1',
        'englishAudio',
      );
    });
  });

  describe('related vocabulary column', () => {
    it('shows the words for the related vocabulary ids of each example', () => {
      setRows([
        createMockExampleEditorRow(1, { relatedVocabulary: '[1,3]' }),
        createMockExampleEditorRow(2, { relatedVocabulary: '[2]' }),
      ]);
      renderEditor();

      expect(screen.getByText('hablar')).toBeInTheDocument();
      expect(screen.getByText('casa')).toBeInTheDocument();
      expect(screen.getByText('comer')).toBeInTheDocument();
    });

    it('adds a picked vocabulary item to the ones already related', () => {
      const onCellChange = setRows([
        createMockExampleEditorRow(1, { relatedVocabulary: '[1,2]' }),
      ]);
      renderEditor();

      addVocabulary('cas', 'house');

      expect(onCellChange).toHaveBeenCalledTimes(1);
      expect(onCellChange).toHaveBeenCalledWith(
        'row-1',
        'relatedVocabulary',
        '[1,2,3]',
      );
    });

    it('adds the first vocabulary item to an example with none', () => {
      const onCellChange = setRows([
        createMockExampleEditorRow(1, { relatedVocabulary: '' }),
      ]);
      renderEditor();

      addVocabulary('cas', 'house');

      expect(onCellChange).toHaveBeenCalledWith(
        'row-1',
        'relatedVocabulary',
        '[3]',
      );
    });

    it('adds vocabulary to the example whose cell was used', () => {
      const onCellChange = setRows([
        createMockExampleEditorRow(1, { relatedVocabulary: '[1]' }),
        createMockExampleEditorRow(2, { relatedVocabulary: '[2]' }),
      ]);
      renderEditor();

      const [, secondSearch] = screen.getAllByPlaceholderText(
        'Search vocabulary...',
      );
      fireEvent.change(secondSearch, { target: { value: 'cas' } });
      fireEvent.click(screen.getByText('house'));

      expect(onCellChange).toHaveBeenCalledWith(
        'row-2',
        'relatedVocabulary',
        '[2,3]',
      );
    });

    it('does not change the example when the picked vocabulary is already related', () => {
      const onCellChange = setRows([
        createMockExampleEditorRow(1, { relatedVocabulary: '[3]' }),
      ]);
      renderEditor();

      addVocabulary('cas', 'house');

      expect(onCellChange).not.toHaveBeenCalled();
    });

    it('removes only the vocabulary item whose remove button was clicked', () => {
      const onCellChange = setRows([
        createMockExampleEditorRow(1, { relatedVocabulary: '[1,2,3]' }),
      ]);
      renderEditor();

      fireEvent.click(
        screen.getAllByRole('button', { name: 'Remove vocabulary' })[1],
      );

      expect(onCellChange).toHaveBeenCalledTimes(1);
      expect(onCellChange).toHaveBeenCalledWith(
        'row-1',
        'relatedVocabulary',
        '[1,3]',
      );
    });

    it('removes vocabulary from the example whose tag was clicked', () => {
      const onCellChange = setRows([
        createMockExampleEditorRow(1, { relatedVocabulary: '[1]' }),
        createMockExampleEditorRow(2, { relatedVocabulary: '[1,2]' }),
      ]);
      renderEditor();

      fireEvent.click(
        screen.getAllByRole('button', { name: 'Remove vocabulary' })[1],
      );

      expect(onCellChange).toHaveBeenCalledWith(
        'row-2',
        'relatedVocabulary',
        '[2]',
      );
    });

    it('leaves an empty list when the last vocabulary item is removed', () => {
      const onCellChange = setRows([
        createMockExampleEditorRow(1, { relatedVocabulary: '[2]' }),
      ]);
      renderEditor();

      fireEvent.click(
        screen.getByRole('button', { name: 'Remove vocabulary' }),
      );

      expect(onCellChange).toHaveBeenCalledWith(
        'row-1',
        'relatedVocabulary',
        '[]',
      );
    });
  });
});
