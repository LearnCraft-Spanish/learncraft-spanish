import { act, fireEvent, render, screen } from '@testing-library/react';
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
  handleSingleAdd: vi.fn(),
  lessonPopup: {
    lessonsByVocabulary: [],
    lessonsLoading: false,
  },
};

describe('exampleManagerExampleListItem', () => {
  it('should render', () => {
    render(<ExampleManagerExampleListItem {...mockProps} />);
    expect(screen.getByText('Expand')).toBeInTheDocument();
  });

  it('should render with more info closed by default', () => {
    render(<ExampleManagerExampleListItem {...mockProps} />);
    expect(screen.getByText('Expand')).toBeInTheDocument();
  });

  it('more info should open when clicked', () => {
    render(<ExampleManagerExampleListItem {...mockProps} />);
    const moreInfoButton = screen.getByText('Expand');
    act(() => {
      fireEvent.click(moreInfoButton);
    });
    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });
});
