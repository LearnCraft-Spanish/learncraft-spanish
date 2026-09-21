import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import {
  PresetList,
  tagCountLabel,
} from '@interface/components/quizPresets/PresetList/PresetList';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import styles from './PresetList.module.scss';

describe('tagCountLabel', () => {
  it('singularizes one tag', () => {
    expect(tagCountLabel(1)).toBe('1 tag');
  });

  it('pluralizes the rest', () => {
    expect(tagCountLabel(2)).toBe('2 tags');
  });
});

describe('presetList', () => {
  it('lists every preset except None', () => {
    render(
      <PresetList
        filterPreset={PreSetQuizPreset.None}
        setFilterPreset={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: /Ser\/Estar/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^None/ })).toBeNull();
  });

  it('marks the applied preset as pressed', () => {
    render(
      <PresetList
        filterPreset={PreSetQuizPreset.Idioms}
        setFilterPreset={vi.fn()}
      />,
    );

    const idioms = screen.getByRole('button', { name: /Idioms/ });
    expect(idioms).toHaveAttribute('aria-pressed', 'true');
    expect(idioms).toHaveClass(styles.presetOn);
  });

  it('applies a preset on click', async () => {
    const setFilterPreset = vi.fn();
    render(
      <PresetList
        filterPreset={PreSetQuizPreset.None}
        setFilterPreset={setFilterPreset}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /Subjunctives/ }));

    expect(setFilterPreset).toHaveBeenCalledWith(PreSetQuizPreset.Subjunctives);
  });

  it('clicking the applied preset clears it', async () => {
    const setFilterPreset = vi.fn();
    render(
      <PresetList
        filterPreset={PreSetQuizPreset.Idioms}
        setFilterPreset={setFilterPreset}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /Idioms/ }));

    expect(setFilterPreset).toHaveBeenCalledWith(PreSetQuizPreset.None);
  });

  it('shows the hint only when given one', () => {
    const { rerender } = render(
      <PresetList
        filterPreset={PreSetQuizPreset.None}
        setFilterPreset={vi.fn()}
      />,
    );

    expect(screen.queryByText('One click applies a saved group.')).toBeNull();

    rerender(
      <PresetList
        filterPreset={PreSetQuizPreset.None}
        setFilterPreset={vi.fn()}
        hint="One click applies a saved group."
      />,
    );

    expect(
      screen.getByText('One click applies a saved group.'),
    ).toBeInTheDocument();
  });
});
