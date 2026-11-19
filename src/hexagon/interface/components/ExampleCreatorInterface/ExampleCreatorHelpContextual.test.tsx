import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import { ExampleCreatorHelpContextual } from '@interface/components/ExampleCreatorInterface/ExampleCreatorHelpContextual';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

const helpHeading = 'Why your examples may not have saved';

function renderHelp() {
  return render(
    <ContextualMenuProvider>
      <ExampleCreatorHelpContextual />
    </ContextualMenuProvider>,
  );
}

describe('component ExampleCreatorHelpContextual', () => {
  it('shows a Help button and keeps the help text hidden until it is clicked', () => {
    renderHelp();

    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
    expect(screen.queryByText(helpHeading)).not.toBeInTheDocument();
  });

  it('explains why examples may not have saved when Help is clicked', async () => {
    const user = userEvent.setup();
    renderHelp();

    await user.click(screen.getByRole('button', { name: 'Help' }));

    expect(screen.getByText(helpHeading)).toBeInTheDocument();
    expect(
      screen.getByText(
        'The most common cause is a duplicate Spanish text already exists.',
      ),
    ).toBeInTheDocument();
  });

  it('hides the help text again when the popup is closed', async () => {
    const user = userEvent.setup();
    renderHelp();

    await user.click(screen.getByRole('button', { name: 'Help' }));
    await user.click(screen.getByAltText('close popup'));

    expect(screen.queryByText(helpHeading)).not.toBeInTheDocument();
  });
});
