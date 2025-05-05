import { render, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';
import { describe, expect, it } from 'vitest';

import FlashcardFinder from './FlashcardFinder';
describe.skip('flashcard finder', () => {
  it('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <FlashcardFinder />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('Flashcard Finder')).toBeInTheDocument();
    });
  });
});
