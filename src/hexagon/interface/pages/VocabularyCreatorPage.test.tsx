import { defaultResult as nonVerbCreationDefault } from '@application/useCases/useNonVerbCreation.mock';
import { defaultResult as verbCreationDefault } from '@application/useCases/useVerbCreation.mock';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VocabularyCreatorPage } from './VocabularyCreatorPage';

// Mock the useCase hooks with the proper return values
vi.mock('@application/useCases/useNonVerbCreation', () => ({
  useNonVerbCreation: () => nonVerbCreationDefault,
}));

vi.mock('@application/useCases/useVerbCreation', () => ({
  useVerbCreation: () => verbCreationDefault,
}));

describe('vocabularyCreatorPage', () => {
  // Helper to render with providers
  const renderPage = () => {
    return render(
      <TestQueryClientProvider>
        <VocabularyCreatorPage />
      </TestQueryClientProvider>,
    );
  };

  it('renders the vocabulary creation form', () => {
    renderPage();
    expect(screen.getByText(/Create Vocabulary/i)).toBeInTheDocument();
  });

  it('navigates to non-verb creation view', async () => {
    renderPage();

    // Click the non-verb button
    const nonVerbButton = screen.getByText(/Add Non-Verb Vocabulary/i);
    await userEvent.click(nonVerbButton);

    // Verify we see the non-verb creation view header
    expect(screen.getByText(/Add Non-Verb Vocabulary/i)).toBeInTheDocument();

    // Should render the subcategory selection
    expect(screen.getByLabelText(/Select Subcategory/i)).toBeInTheDocument();
  });

  it('navigates to verb creation view', async () => {
    renderPage();

    // Click the verb button
    const verbButton = screen.getByText(/Add New Verb/i);
    await userEvent.click(verbButton);

    // Verify we see the verb creation view header
    expect(screen.getByText(/Add New Verb/i)).toBeInTheDocument();
  });

  it('returns to the selection screen when clicking back', async () => {
    renderPage();

    // First navigate to non-verb view
    const nonVerbButton = screen.getByText(/Add Non-Verb Vocabulary/i);
    await userEvent.click(nonVerbButton);

    // Now click the back button
    const backButton = screen.getByText(/← Back/i);
    await userEvent.click(backButton);

    // Should be back at the selection screen
    expect(screen.getByText(/Add Non-Verb Vocabulary/i)).toBeInTheDocument();
    expect(screen.getByText(/Add New Verb/i)).toBeInTheDocument();
  });
});
