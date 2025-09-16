import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMockFlashcard } from 'src/hexagon/testing/factories/flashcardFactory';

import { vi } from 'vitest';
import FlashcardFinderExampleListItem from './FlashcardFinderExampleListItem';

const f = createMockFlashcard();

const mockProps = {
  example: f,
  isCollected: false,
  isAdding: false,
  isRemoving: false,
  handleAdd: vi.fn(),
  handleRemove: vi.fn(),
  lessonPopup: {
    lessonsByVocabulary: [],
    lessonsLoading: false,
  },
};

describe('flashcardFinderExampleListItem', () => {
  it('should render', () => {
    render(
      <ContextualMenuProvider>
        <FlashcardFinderExampleListItem {...mockProps} />
      </ContextualMenuProvider>,
    );
    expect(screen.getByText('Expand')).toBeInTheDocument();
  });

  it('should render with more info closed by default', () => {
    render(
      <ContextualMenuProvider>
        <FlashcardFinderExampleListItem {...mockProps} />
      </ContextualMenuProvider>,
    );
    expect(screen.getByText('Expand')).toBeInTheDocument();
  });

  it('more info should open when clicked', () => {
    render(
      <ContextualMenuProvider>
        <FlashcardFinderExampleListItem {...mockProps} />
      </ContextualMenuProvider>,
    );
    const moreInfoButton = screen.getByText('Expand');
    act(() => {
      fireEvent.click(moreInfoButton);
    });
    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });
});
