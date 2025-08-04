import { render, screen } from '@testing-library/react';
import { createMockFlashcard } from 'src/hexagon/testing/factories/flashcardFactory';
import { vi } from 'vitest';
import FlashcardFinderExampleListItem from './FlashcardFinderExampleListItem';

const f = createMockFlashcard();

const mockProps = {
  example: f,
  isCollected: false,
  isPending: false,
  handleAdd: vi.fn(),
  handleRemoveSelected: vi.fn(),
  handleSelect: vi.fn(),
  handleRemove: vi.fn(),
  bulkSelectMode: false,
  isSelected: false,
};

describe('flashcardFinderExampleListItem', () => {
  it('should render', () => {
    render(<FlashcardFinderExampleListItem {...mockProps} />);
  });
});
