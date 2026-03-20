import { SearchByMaxFrequency } from '@interface/components/ExampleSearchInterface/Filters/SearchByMaxFrequency';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('component: SearchByMaxFrequency', () => {
  it('should render selected max frequency and spanglish values', () => {
    render(
      <SearchByMaxFrequency
        highestFirst
        onHighestFirstChange={vi.fn()}
        spanglish="only-spanglish"
        onSpanglishChange={vi.fn()}
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('combobox', { name: 'Max Frequency Order:' }),
    ).toHaveValue('true');
    expect(screen.getByRole('combobox', { name: 'Spanglish:' })).toHaveValue(
      'only-spanglish',
    );
  });

  it('should call callbacks when dropdown values change', async () => {
    const user = userEvent.setup();
    const onHighestFirstChange = vi.fn();
    const onSpanglishChange = vi.fn();

    render(
      <SearchByMaxFrequency
        highestFirst
        onHighestFirstChange={onHighestFirstChange}
        spanglish="all"
        onSpanglishChange={onSpanglishChange}
        vocabularyComplete={undefined}
        onVocabularyCompleteChange={vi.fn()}
      />,
    );

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Max Frequency Order:' }),
      'false',
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Spanglish:' }),
      'no-spanglish',
    );

    expect(onHighestFirstChange).toHaveBeenCalledWith(false);
    expect(onSpanglishChange).toHaveBeenCalledWith('no-spanglish');
  });
});
