import MenuButton from '@interface/components/general/Buttons/MenuButton';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { afterEach, describe, expect, it } from 'vitest';

describe('menu button', () => {
  afterEach(() => {
    cleanup();
  });
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <MenuButton />
      </MemoryRouter>,
    );
    expect(screen.getByText('Back to Home')).toBeTruthy();
  });
});
