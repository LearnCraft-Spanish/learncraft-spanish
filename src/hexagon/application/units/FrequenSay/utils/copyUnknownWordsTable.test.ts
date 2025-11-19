import { copyUnknownWordsTable } from '@application/units/FrequenSay/utils/copyUnknownWordsTable';
import { createMockWordCountList } from '@testing/factories/wordCountFactory';
import { beforeEach, describe, it, vi } from 'vitest';

describe('copyUnknownWordsTable', () => {
  beforeEach(() => {
    // This is probably not the best way to do this,
    //  but the react testing library is built for user interactions, not unit tests

    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn(),
      },
      writable: true,
    });
  });

  it('should copy the unknown words table to the clipboard, with correct format', () => {
    const unknownWords = createMockWordCountList(3);
    copyUnknownWordsTable(unknownWords);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `Word\tCount\n${unknownWords
        .map((word) => `${word.word}\t${word.count}`)
        .join('\n')}`,
    );
  });
});
