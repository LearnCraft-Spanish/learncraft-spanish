import { Toggle } from '@interface/components/general/Toggle/Toggle';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('toggle', () => {
  afterEach(() => {
    cleanup();
  });

  it('is a switch named by its label', () => {
    render(
      <Toggle
        id="from-lesson"
        checked={false}
        onChange={vi.fn()}
        label="Set a starting lesson"
      />,
    );

    expect(
      screen.getByRole('switch', { name: 'Set a starting lesson' }),
    ).not.toBeChecked();
  });

  it('reports the new state when switched on', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(checked: boolean) => void>();
    render(
      <Toggle
        id="from-lesson"
        checked={false}
        onChange={onChange}
        label="Set a starting lesson"
      />,
    );

    await user.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is switched on by clicking its label text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(checked: boolean) => void>();
    render(
      <Toggle
        id="from-lesson"
        checked={false}
        onChange={onChange}
        label="Set a starting lesson"
      />,
    );

    await user.click(screen.getByText('Set a starting lesson'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is on when checked', () => {
    render(<Toggle id="from-lesson" checked onChange={vi.fn()} label="On" />);

    expect(screen.getByRole('switch', { name: 'On' })).toBeChecked();
  });

  it('keeps a hidden label available to assistive technology', () => {
    render(
      <Toggle
        id="from-lesson"
        checked={false}
        onChange={vi.fn()}
        label="Set a starting lesson"
        labelHidden
      />,
    );

    expect(
      screen.getByRole('switch', { name: 'Set a starting lesson' }),
    ).toBeInTheDocument();
  });

  it('does not report changes while disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(checked: boolean) => void>();
    render(
      <Toggle
        id="from-lesson"
        checked={false}
        onChange={onChange}
        label="Set a starting lesson"
        disabled
      />,
    );

    await user.click(screen.getByRole('switch'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders the label before the switch track so it reads label-then-switch', () => {
    const { container } = render(
      <Toggle
        id="from-lesson"
        checked={false}
        onChange={vi.fn()}
        label="Set a starting lesson"
      />,
    );

    const labelNode = screen.getByText('Set a starting lesson');
    // The switch track is the visually-hidden-from-AT wrapper around the
    // knob; it's the element carrying the visual on/off state.
    const trackNode = container.querySelector('[aria-hidden="true"]');

    expect(trackNode).not.toBeNull();
    // DOCUMENT_POSITION_FOLLOWING (4) means labelNode comes before trackNode.
    expect(
      labelNode.compareDocumentPosition(trackNode as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('renders label-before-switch consistently for stacked toggles with differing label lengths', () => {
    // Mirrors QuizOptionsCard's `.switches` column (display:flex;
    // flex-direction:column) with two toggles of very different label
    // lengths. jsdom does not compute real layout, so this cannot confirm
    // the switches are pixel-aligned — see the report for a recommended
    // manual check in a running browser. What this DOES verify: both
    // toggles independently keep the label-before-switch DOM order that
    // `justify-content: space-between` relies on to push each switch to
    // its own root's trailing edge (which stretches to match its
    // siblings' width under the column's default `align-items: stretch`).
    render(
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Toggle
          id="toggle-short"
          checked={false}
          onChange={vi.fn()}
          label="Autoplay"
        />
        <Toggle
          id="toggle-long"
          checked={false}
          onChange={vi.fn()}
          label="Start with Spanish and exclude Spanglish entirely"
        />
      </div>,
    );

    for (const labelText of [
      'Autoplay',
      'Start with Spanish and exclude Spanglish entirely',
    ]) {
      const labelNode = screen.getByText(labelText);
      const rootNode = labelNode.closest('label');
      const trackNode = rootNode?.querySelector('[aria-hidden="true"]');

      expect(trackNode).toBeTruthy();
      expect(
        labelNode.compareDocumentPosition(trackNode as Node) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });
});
