import ExampleCreator from '@interface/components/ExampleCreatorInterface/ExampleCreator';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it, vi } from 'vitest';

function renderCreator() {
  const setHasUnsavedCreatedExamples = vi.fn();
  render(
    <MockAllProviders route="/example-creator">
      <ExampleCreator
        setHasUnsavedCreatedExamples={setHasUnsavedCreatedExamples}
      />
    </MockAllProviders>,
  );
  return { setHasUnsavedCreatedExamples };
}

function lastCallArg(fn: ReturnType<typeof vi.fn>): unknown {
  return fn.mock.calls.at(-1)?.[0];
}

describe('component ExampleCreator', () => {
  it('should render', () => {
    renderCreator();
    expect(screen.getByText('Example Creator')).toBeInTheDocument();
  });

  it('offers Spanish and English columns and a Help button', () => {
    renderCreator();

    expect(
      screen.getByRole('columnheader', { name: 'Spanish' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'English' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
  });

  it('reports no unsaved examples while the table is empty', () => {
    const { setHasUnsavedCreatedExamples } = renderCreator();

    expect(setHasUnsavedCreatedExamples).toHaveBeenCalled();
    expect(setHasUnsavedCreatedExamples).not.toHaveBeenCalledWith(true);
    expect(lastCallArg(setHasUnsavedCreatedExamples)).toBe(false);
  });

  it('reports unsaved examples once something is typed into the table', async () => {
    const user = userEvent.setup();
    const { setHasUnsavedCreatedExamples } = renderCreator();

    await user.type(
      screen.getAllByRole('textbox', { name: 'Spanish' })[0],
      'h',
    );

    expect(lastCallArg(setHasUnsavedCreatedExamples)).toBe(true);
  });

  it('reports no unsaved examples again after the table is reset', async () => {
    const user = userEvent.setup();
    const { setHasUnsavedCreatedExamples } = renderCreator();

    await user.type(
      screen.getAllByRole('textbox', { name: 'Spanish' })[0],
      'h',
    );
    expect(lastCallArg(setHasUnsavedCreatedExamples)).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(lastCallArg(setHasUnsavedCreatedExamples)).toBe(false);
  });

  it('opens the help explanation from the Help button', async () => {
    const user = userEvent.setup();
    renderCreator();

    await user.click(screen.getByRole('button', { name: 'Help' }));

    expect(
      screen.getByText('Why your examples may not have saved'),
    ).toBeInTheDocument();
  });
});
