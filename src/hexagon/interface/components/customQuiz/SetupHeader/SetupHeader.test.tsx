import { SetupHeader } from '@interface/components/customQuiz/SetupHeader/SetupHeader';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import styles from './SetupHeader.module.scss';

describe('setupHeader', () => {
  it('shows the step label and title', () => {
    render(
      <SetupHeader
        backLabel="Back to home"
        onBack={vi.fn()}
        eyebrow="Step 1 of 2"
        title="Set up your quiz"
      />,
    );

    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Set up your quiz' }),
    ).toBeInTheDocument();
  });

  it('renders the optional suffix inside the heading', () => {
    render(
      <SetupHeader
        backLabel="Back to setup"
        onBack={vi.fn()}
        eyebrow="Step 2 of 2"
        title="Choose tags"
        titleSuffix="(optional)"
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Choose tags (optional)' }),
    ).toBeInTheDocument();
  });

  it('goes back when the back affordance is used', async () => {
    const onBack = vi.fn();
    render(
      <SetupHeader
        backLabel="Back to home"
        onBack={onBack}
        eyebrow="Custom quiz"
        title="Set up your quiz"
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /back to home/i }),
    );

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('fills only the completed progress segments', () => {
    const { container } = render(
      <SetupHeader
        backLabel="Back to home"
        onBack={vi.fn()}
        eyebrow="Step 1 of 2"
        title="Set up your quiz"
        progress={{ total: 2, complete: 1 }}
      />,
    );

    const segments = container.querySelectorAll(`.${styles.segment}`);
    expect(segments).toHaveLength(2);
    expect(segments[0]).toHaveClass(styles.segmentOn);
    expect(segments[1]).not.toHaveClass(styles.segmentOn);
  });

  it('omits the progress bar when no steps are given', () => {
    const { container } = render(
      <SetupHeader
        backLabel="Back to home"
        onBack={vi.fn()}
        eyebrow="Custom quiz"
        title="Set up your quiz"
      />,
    );

    expect(container.querySelectorAll(`.${styles.segment}`)).toHaveLength(0);
  });
});
