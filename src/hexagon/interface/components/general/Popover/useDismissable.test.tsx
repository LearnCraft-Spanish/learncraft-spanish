import type { JSX } from 'react';
import { useDismissable } from '@interface/components/general/Popover/useDismissable';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

function Probe({
  open,
  onDismiss,
}: {
  open: boolean;
  onDismiss: () => void;
}): JSX.Element {
  const { containerRef } = useDismissable(open, onDismiss);
  return (
    <div>
      <div ref={containerRef} data-testid="panel">
        inside
      </div>
      <button type="button">outside</button>
    </div>
  );
}

describe('useDismissable', () => {
  it('closes on a click outside the panel', () => {
    const onDismiss = vi.fn();
    render(<Probe open onDismiss={onDismiss} />);

    fireEvent.mouseDown(screen.getByRole('button', { name: 'outside' }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('stays open when the click is inside the panel', () => {
    const onDismiss = vi.fn();
    render(<Probe open onDismiss={onDismiss} />);

    fireEvent.mouseDown(screen.getByTestId('panel'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('closes when Escape is pressed', () => {
    const onDismiss = vi.fn();
    render(<Probe open onDismiss={onDismiss} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('ignores Escape while the surface is closed', () => {
    const onDismiss = vi.fn();
    render(<Probe open={false} onDismiss={onDismiss} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.mouseDown(screen.getByRole('button', { name: 'outside' }));

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
