import { render, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';
import { ContextualMenuProvider } from 'src/providers/ContextualMenuProvider';
import { describe, expect, it } from 'vitest';

import FlashcardFinder from './FlashcardFinder';
describe('flashcard finder', () => {
  it('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <ContextualMenuProvider>
          <FlashcardFinder />
        </ContextualMenuProvider>
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('From:')).toBeInTheDocument();
    });
  });
});
