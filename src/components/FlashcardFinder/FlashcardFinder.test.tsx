import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import MockAllProviders from '../../../mocks/Providers/MockAllProviders';
import { ContextualMenuProvider } from '../../providers/ContextualMenuProvider';

import FlashcardFinder from './FlashcardFinder';
describe('flashcard finder', () => {
  it('renders without crashing', () => {
    render(
      <MockAllProviders>
        <ContextualMenuProvider>
          <FlashcardFinder />
        </ContextualMenuProvider>
      </MockAllProviders>,
    );
  });
});
