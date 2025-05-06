import { render, screen } from '@testing-library/react';
import UnknownWords from './UnknownWords';
import { vi } from 'vitest';
import { createMockWordCountList } from 'src/hexagon/testing/factories/wordCountFactory';

const mockWordCountList = createMockWordCountList(10);
const mockCopyUnknownWordsTable = vi.fn();

const defaultProps = {
  unknownWordCount: mockWordCountList,
  copyUnknownWordsTable: mockCopyUnknownWordsTable,
};
describe('UnknownWords', () => {
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
  });
});
