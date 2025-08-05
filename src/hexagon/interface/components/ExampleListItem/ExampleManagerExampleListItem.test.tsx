import { render, screen } from '@testing-library/react';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import { vi } from 'vitest';
import ExampleManagerExampleListItem from './ExampleManagerExampleListItem';

const f = createMockFlashcard();

const mockProps = {
  example: f,
  isCollected: false,
  isPending: false,
  handleSelect: vi.fn(),
  handleRemoveSelected: vi.fn(),
  handleRemove: vi.fn(),
  bulkSelectMode: false,
  isSelected: false,
  handleAdd: vi.fn(),
};

describe('exampleManagerExampleListItem', () => {
  it('should render', () => {
    render(<ExampleManagerExampleListItem {...mockProps} />);
    expect(screen.getByText('Expand')).toBeInTheDocument();
  });
});
