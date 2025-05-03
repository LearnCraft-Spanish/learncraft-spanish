import { mockNonVerbCreation } from '@application/useCases/useNonVerbCreation.mock';
import { mockVerbCreation } from '@application/useCases/useVerbCreation.mock';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockSubcategory } from '@testing/factories/subcategoryFactories';
import { createTypedMock } from '@testing/utils/typedMock';
import React from 'react';
import { vi } from 'vitest';
import { VocabularyCreatorPage } from './VocabularyCreatorPage';

describe('vocabularyCreatorPage', () => {
  beforeEach(() => {
    // Setup default mocks for both creation pathways
    mockNonVerbCreation();
    mockVerbCreation();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render vocabulary creation form', async () => {
    render(<VocabularyCreatorPage />);

    // Verify the page renders with default data
    expect(screen.getByText(/Create Vocabulary/i)).toBeInTheDocument();
  });

  it('should display subcategories in dropdown when selecting non-verb creation', async () => {
    // Customize the mock data for this specific test
    const mockSubcategories = Array.from({ length: 3 }, (_, i) =>
      createMockSubcategory({ name: `Test Category ${i}` }),
    );

    // Override the mock using our established pattern
    mockNonVerbCreation({
      subcategories: {
        subcategories: mockSubcategories,
      },
    });

    render(<VocabularyCreatorPage />);

    // Navigate to non-verb creation
    const nonVerbButton = screen.getByText(/Add Non-Verb Vocabulary/i);
    await userEvent.click(nonVerbButton);

    // Open the subcategory dropdown
    const dropdown = screen.getByLabelText(/Category/i);
    await userEvent.click(dropdown);

    // Verify all mock categories are displayed
    mockSubcategories.forEach((category) => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
    });
  });

  it('should handle non-verb vocabulary creation', async () => {
    // Prepare typed mock for the save function
    const createNonVerbMock =
      createTypedMock<() => Promise<boolean>>().mockResolvedValue(true);

    // Set up the useCase mock with our configured save function
    mockNonVerbCreation({
      useCase: {
        saveVocabulary: createNonVerbMock,
      },
    });

    render(<VocabularyCreatorPage />);

    // Navigate to non-verb creation
    const nonVerbButton = screen.getByText(/Add Non-Verb Vocabulary/i);
    await userEvent.click(nonVerbButton);

    // Fill out the form - simplified for this test but should match actual form
    await userEvent.type(screen.getByLabelText(/Word/i), 'hola');
    await userEvent.type(screen.getByLabelText(/Translation/i), 'hello');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(submitButton);

    // Verify the saveVocabulary function was called
    expect(createNonVerbMock).toHaveBeenCalled();

    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText(/successfully created/i)).toBeInTheDocument();
    });
  });

  it('should display error message when non-verb creation fails', async () => {
    // Set up mocks for failed creation
    const errorMessage = 'Failed to create vocabulary';
    const createNonVerbMock = createTypedMock<
      () => Promise<boolean>
    >().mockRejectedValue(new Error(errorMessage));

    // Override the mock implementation using our established pattern
    mockNonVerbCreation({
      useCase: {
        saveVocabulary: createNonVerbMock,
        creationError: new Error(errorMessage),
      },
    });

    render(<VocabularyCreatorPage />);

    // Navigate to non-verb creation
    const nonVerbButton = screen.getByText(/Add Non-Verb Vocabulary/i);
    await userEvent.click(nonVerbButton);

    // Fill out the form
    await userEvent.type(screen.getByLabelText(/Word/i), 'hola');
    await userEvent.type(screen.getByLabelText(/Translation/i), 'hello');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(submitButton);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should handle verb vocabulary creation', async () => {
    // Prepare typed mock for the create verb function
    const createVerbMock =
      createTypedMock<(data: any) => Promise<boolean>>().mockResolvedValue(
        true,
      );

    // Set up the useCase mock with our configured create function
    mockVerbCreation({
      useCase: {
        createVerb: createVerbMock,
      },
    });

    render(<VocabularyCreatorPage />);

    // Navigate to verb creation
    const verbButton = screen.getByText(/Add New Verb/i);
    await userEvent.click(verbButton);

    // Fill out the verb form
    await userEvent.type(screen.getByLabelText(/Infinitive/i), 'hablar');
    await userEvent.type(screen.getByLabelText(/Translation/i), 'to speak');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(submitButton);

    // Verify the createVerb function was called
    expect(createVerbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        infinitive: 'hablar',
        translation: 'to speak',
      }),
    );

    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText(/successfully created/i)).toBeInTheDocument();
    });
  });
});
