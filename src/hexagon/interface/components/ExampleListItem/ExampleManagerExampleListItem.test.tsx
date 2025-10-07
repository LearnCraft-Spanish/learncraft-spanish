import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import { vi } from 'vitest';
import ExampleManagerExampleListItem from './ExampleManagerExampleListItem';

const f = createMockFlashcard();

const mockProps = {
  flashcard: f,
  isCollected: false,
  isAdding: false,
  isCustom: false,
  isRemoving: false,
  handleSelect: vi.fn(),
  handleDeselect: vi.fn(),
  handleRemove: vi.fn(),
  bulkSelectMode: false,
  isSelected: false,
  handleAdd: vi.fn(),
  lessonPopup: {
    lessonsByVocabulary: [],
    lessonsLoading: false,
  },
};

describe('exampleManagerExampleListItem', () => {
  it('should render', () => {
    render(
      <ContextualMenuProvider>
        <ExampleManagerExampleListItem {...mockProps} />
      </ContextualMenuProvider>,
    );
    expect(screen.getByText('Expand')).toBeInTheDocument();
  });

  it('should render with more info closed by default', () => {
    render(
      <ContextualMenuProvider>
        <ExampleManagerExampleListItem {...mockProps} />
      </ContextualMenuProvider>,
    );
    expect(screen.getByText('Expand')).toBeInTheDocument();
  });

  it('more info should open when clicked', () => {
    render(
      <ContextualMenuProvider>
        <ExampleManagerExampleListItem {...mockProps} />
      </ContextualMenuProvider>,
    );
    const moreInfoButton = screen.getByText('Expand');
    act(() => {
      fireEvent.click(moreInfoButton);
    });
    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });
});
