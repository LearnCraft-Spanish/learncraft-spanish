import type { UseCustomQuizV2Return } from '@application/useCases/useCustomQuizV2';
import { CustomQuizType } from '@application/useCases/useCustomQuizV2';
import { defaultMockUseCustomQuizV2 } from '@application/useCases/useCustomQuizV2/useCustomQuizV2.mock';
import { AudioQuizType } from '@domain/audioQuizzing';
import { CustomQuizSetup } from '@interface/components/customQuiz/CustomQuizSetup/CustomQuizSetup';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function renderSetup(
  overrides: Partial<UseCustomQuizV2Return> = {},
  onLeave = vi.fn(),
) {
  const quiz = { ...defaultMockUseCustomQuizV2, ...overrides };
  render(<CustomQuizSetup quiz={quiz} onLeave={onLeave} />);
  return { quiz, onLeave };
}

describe('customQuizSetup', () => {
  it('shows the course, its lesson range, and the match count', () => {
    renderSetup();

    expect(screen.getByText('LearnCraft Spanish')).toBeInTheDocument();
    expect(screen.getByText('From lesson lcsp 1')).toBeInTheDocument();
    expect(
      screen.getAllByText('6,992 flashcards found').length,
    ).toBeGreaterThan(0);
  });

  it('the CTA offers what will be drilled, not the total', () => {
    renderSetup();

    expect(
      screen.getAllByRole('button', { name: 'Quiz 20 flashcards' }).length,
    ).toBeGreaterThan(0);
  });

  it('leaves the page from the back affordance', async () => {
    const onLeave = vi.fn();
    renderSetup({}, onLeave);

    await userEvent.click(
      screen.getAllByRole('button', { name: /back to home/i })[0],
    );

    expect(onLeave).toHaveBeenCalled();
  });

  it('choosing audio calls back with the audio quiz type', async () => {
    const setQuizType = vi.fn();
    renderSetup({ setQuizType });

    await userEvent.click(screen.getByRole('radio', { name: 'Audio' }));

    expect(setQuizType).toHaveBeenCalledWith(CustomQuizType.Audio);
  });

  it('swaps the flashcard options for the audio ones', () => {
    renderSetup({ quizType: CustomQuizType.Audio, isAudioQuiz: true });

    expect(screen.queryByLabelText('Start with Spanish')).toBeNull();
    expect(screen.queryByLabelText('Exclude Spanglish')).toBeNull();

    expect(screen.getByRole('radio', { name: 'Speaking' })).toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'Listening' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Autoplay')).toBeChecked();
  });

  it('choosing a listening quiz calls back with the audio mode', async () => {
    const setAudioQuizType = vi.fn();
    renderSetup({
      quizType: CustomQuizType.Audio,
      isAudioQuiz: true,
      setAudioQuizType,
    });

    await userEvent.click(screen.getByRole('radio', { name: 'Listening' }));

    expect(setAudioQuizType).toHaveBeenCalledWith(AudioQuizType.Listening);
  });

  it('the quiz length select offers the lengths the set allows', () => {
    renderSetup({ quizLengthOptions: [10, 20, 50, 76], quizLength: 20 });

    const select = screen.getByLabelText('Quiz length');
    expect(
      [...select.querySelectorAll('option')].map((option) => option.value),
    ).toEqual(['10', '20', '50', '76']);
    expect(select).toHaveValue('20');
  });

  it('reports the chosen length back as a number', async () => {
    const setQuizLength = vi.fn();
    renderSetup({ quizLengthOptions: [10, 20, 50, 76], setQuizLength });

    await userEvent.selectOptions(screen.getByLabelText('Quiz length'), '76');

    expect(setQuizLength).toHaveBeenCalledWith(76);
  });

  it('starts on step one and advances to tags on Continue', async () => {
    renderSetup();

    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText('Step 2 of 2')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Choose tags (optional)' }),
    ).toBeInTheDocument();
  });

  it('goes back to setup from step two', async () => {
    renderSetup();

    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    // The header and the footer both offer the way back on step two.
    const backControls = screen.getAllByRole('button', {
      name: /back to setup/i,
    });
    expect(backControls).toHaveLength(2);

    await userEvent.click(backControls[0]);

    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
  });

  it('disables the CTA when nothing matches', () => {
    renderSetup({
      quizNotReady: true,
      totalCount: 0,
      effectiveCount: 0,
      countLabel: '0 flashcards found',
      ctaLabel: 'Quiz 0 flashcards',
    });

    screen
      .getAllByRole('button', { name: 'Quiz 0 flashcards' })
      .forEach((button) => expect(button).toBeDisabled());
  });

  it('opens the advanced settings panel without losing the card', async () => {
    renderSetup();

    const toggle = screen.getByRole('button', { name: /advanced settings/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByLabelText('From lesson')).toBeNull();

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Course')).toBeInTheDocument();
    expect(screen.getByLabelText('From lesson')).toBeInTheDocument();
    expect(screen.getByLabelText('Up to lesson')).toBeInTheDocument();
  });

  it('switches the tag card to presets and back', async () => {
    renderSetup();

    await userEvent.click(screen.getByRole('radio', { name: 'Presets' }));

    expect(
      screen.getByRole('button', { name: /Ser\/Estar/ }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Search tags' }));

    expect(screen.getByPlaceholderText('Search tags')).toBeInTheDocument();
  });

  it('reads out the empty tag state', () => {
    renderSetup();

    expect(
      screen.getByText('None — every lesson in range'),
    ).toBeInTheDocument();
  });
});
