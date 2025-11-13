import UnknownWords from '@interface/components/frequensay/UnknownWords';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMockWordCountList } from '@testing/factories/wordCountFactory';
import { vi } from 'vitest';

const mockWordCountList = createMockWordCountList(1);
const mockCopyUnknownWordsTable = vi.fn();

const defaultProps = {
  unknownWordCount: mockWordCountList,
  copyUnknownWordsTable: mockCopyUnknownWordsTable,
};
describe('unknownWords', () => {
  it('should render', () => {
    render(<UnknownWords {...defaultProps} />);

    expect(
      screen.getByText(`${mockWordCountList.length} Unknown Words:`),
    ).toBeInTheDocument();
    expect(screen.getByText('Copy Word List')).toBeInTheDocument();
  });

  it('should call copyUnknownWordsTable when the button is clicked', () => {
    render(<UnknownWords {...defaultProps} />);
    const button = screen.getByText('Copy Word List');

    // Click the button
    fireEvent.click(button);

    // Verify the copy function was called
    expect(mockCopyUnknownWordsTable).toHaveBeenCalledTimes(1);
  });

  it('should render each unknown word with its count', () => {
    render(<UnknownWords {...defaultProps} />);

    // Check that each word from the mock list is displayed
    mockWordCountList.forEach((wordCount) => {
      expect(screen.getByText(wordCount.word)).toBeInTheDocument();
      expect(screen.getByText(wordCount.count.toString())).toBeInTheDocument();
    });
  });

  it('should not render anything when there are no unknown words', () => {
    const { container } = render(
      <UnknownWords
        unknownWordCount={[]}
        copyUnknownWordsTable={mockCopyUnknownWordsTable}
      />,
    );

    // Container should be empty
    expect(container.firstChild).toBeNull();
  });
});
