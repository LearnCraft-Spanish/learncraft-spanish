import { SearchByText } from '@interface/components/ExampleSearchInterface/Filters/SearchByText';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('component: SearchByText', () => {
  it('should display both spanish and english input values', () => {
    const onSpanishInputChange = vi.fn();
    const onEnglishInputChange = vi.fn();
    const spanishValue = 'hola mundo';
    const englishValue = 'hello world';

    render(
      <SearchByText
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        spanishInput={spanishValue}
        englishInput={englishValue}
        onSpanishInputChange={onSpanishInputChange}
        onEnglishInputChange={onEnglishInputChange}
      />,
    );

    const spanishInput = screen.getByDisplayValue(
      'hola mundo',
    ) as HTMLInputElement;
    const englishInput = screen.getByDisplayValue(
      'hello world',
    ) as HTMLInputElement;

    expect(spanishInput.value).toBe(spanishValue);
    expect(englishInput.value).toBe(englishValue);
  });

  it('should call onSpanishInputChange when spanish input changes', async () => {
    const user = userEvent.setup();
    const onSpanishInputChange = vi.fn();
    const onEnglishInputChange = vi.fn();
    const spanishInputOriginalValue = '';

    render(
      <SearchByText
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        spanishInput={spanishInputOriginalValue}
        englishInput=""
        onSpanishInputChange={onSpanishInputChange}
        onEnglishInputChange={onEnglishInputChange}
      />,
    );

    const spanishInput = screen.getByPlaceholderText(
      'Search Spanish text (comma-separated for multiple)',
    );

    const newInput = 'test spanish';
    await user.type(spanishInput, newInput);
    newInput.split('').forEach((char) => {
      expect(onSpanishInputChange).toHaveBeenCalledWith(
        spanishInputOriginalValue + char,
      );
    });
    expect(onEnglishInputChange).not.toHaveBeenCalled();
  });

  it('should call onEnglishInputChange when english input changes', async () => {
    const user = userEvent.setup();
    const onSpanishInputChange = vi.fn();
    const onEnglishInputChange = vi.fn();
    const englishInputOriginalValue = '';

    render(
      <SearchByText
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
        spanishInput=""
        englishInput={englishInputOriginalValue}
        onSpanishInputChange={onSpanishInputChange}
        onEnglishInputChange={onEnglishInputChange}
      />,
    );

    const englishInput = screen.getByPlaceholderText(
      'Search English text (comma-separated for multiple)',
    );

    const newInput = 'test english';
    await user.type(englishInput, newInput);
    newInput.split('').forEach((char) => {
      expect(onEnglishInputChange).toHaveBeenCalledWith(
        englishInputOriginalValue + char,
      );
    });
    expect(onSpanishInputChange).not.toHaveBeenCalled();
  });
});
