import { describe, it, expect } from 'vitest';
import { render, waitFor, screen  } from '@testing-library/react';
import React from 'react';
import MockAllProviders from '../../../mocks/Providers/MockAllProviders';
import { ContextualMenuProvider } from '../../providers/ContextualMenuProvider';

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