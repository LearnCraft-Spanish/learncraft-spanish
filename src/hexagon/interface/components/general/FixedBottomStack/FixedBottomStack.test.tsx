import { FixedBottomStack } from '@interface/components/general/FixedBottomStack/FixedBottomStack';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('fixed bottom stack', () => {
  afterEach(() => {
    cleanup();
  });

  it('stacks its children in order', () => {
    render(
      <FixedBottomStack>
        <span>notice</span>
        <span>bulk bar</span>
      </FixedBottomStack>,
    );

    const column = screen.getByText('notice').parentElement;

    expect(column?.textContent).toBe('noticebulk bar');
  });
});
