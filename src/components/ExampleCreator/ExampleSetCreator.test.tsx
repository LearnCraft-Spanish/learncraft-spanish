import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it } from 'vitest';
import SetExampleCreator from './ExampleSetCreator';

function renderSetExampleCreator() {
  return render(
    <MockAllProviders route="/example-creator">
      <SetExampleCreator hasAccess />
    </MockAllProviders>,
  );
}

describe('setExampleCreator', () => {
  describe('input parsing and validation', () => {
    it('should trim whitespace from pasted input', async () => {
      renderSetExampleCreator();

      const textarea = screen.getByPlaceholderText(/Paste table here/i);
      const input =
        '  Hola mundo  \t  Hello world  \t  audio1.mp3  \t  audio2.mp3  ';

      fireEvent.change(textarea, { target: { value: input } });

      // Check the preview table
      await waitFor(() => {
        const spanishCell = screen.getByText('Hola mundo');
        const englishCell = screen.getByText('Hello world');
        expect(spanishCell).toBeInTheDocument();
        expect(englishCell).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      renderSetExampleCreator();

      const textarea = screen.getByPlaceholderText(/Paste table here/i);
      const input = '\t Hello world \nHola mundo \t';

      fireEvent.change(textarea, { target: { value: input } });

      // Check validation messages
      await waitFor(() => {
        expect(screen.getByText(/Missing Spanish text/)).toBeInTheDocument();
        expect(screen.getByText(/Missing English text/)).toBeInTheDocument();
      });
    });

    it('should identify duplicate Spanish examples', async () => {
      renderSetExampleCreator();

      const textarea = screen.getByPlaceholderText(/Paste table here/i);
      const input = 'Hola mundo\tHello world\nHola mundo\tHi world';

      fireEvent.change(textarea, { target: { value: input } });

      // Check for duplicate message
      await waitFor(() => {
        expect(
          screen.getByText(/This duplicate will be removed/),
        ).toBeInTheDocument();
      });
    });

    it('should show validation summary with correct counts', async () => {
      renderSetExampleCreator();

      const textarea = screen.getByPlaceholderText(/Paste table here/i);
      // First row valid, second duplicate (invalid), third and fourth missing required fields
      const input =
        'Hola\tHello\nHola\tHi\n\tMissing Spanish\nMissing English\t';

      fireEvent.change(textarea, { target: { value: input } });

      // Check validation summary - only first row is valid
      await waitFor(() => {
        expect(
          screen.getByText('Found 4 rows: 1 valid, 3 with errors'),
        ).toBeInTheDocument();
      });
    });

    it('should skip empty lines', async () => {
      renderSetExampleCreator();

      const textarea = screen.getByPlaceholderText(/Paste table here/i);
      const input = '\n\nHola\tHello\n\n\n';

      fireEvent.change(textarea, { target: { value: input } });

      // Check validation summary shows only 1 row
      await waitFor(() => {
        const summary = screen.getByText(/Found 1 rows?: 1 valid/);
        expect(summary).toBeInTheDocument();
      });
    });

    it('should save all valid rows when clicking Next', async () => {
      renderSetExampleCreator();

      const textarea = screen.getByPlaceholderText(/Paste table here/i);
      // Mix of valid, duplicate, and error rows
      const input = 'Hola\tHello\nAdios\tGoodbye\nHola\tHi\n\tMissing Spanish';

      fireEvent.change(textarea, { target: { value: input } });

      // Wait for validation and click Next
      await waitFor(() => {
        const nextButton = screen.getByText('Next');
        expect(nextButton).not.toBeDisabled();
        fireEvent.click(nextButton);
      });

      // Verify the invalid content is never shown
      await waitFor(() => {
        // The duplicate translation "Hi" should not appear as a value
        expect(screen.queryByDisplayValue('Hi')).not.toBeInTheDocument();
        // The row with missing Spanish should not appear as a value
        expect(screen.queryByDisplayValue('ERROR')).not.toBeInTheDocument();
        expect(
          screen.queryByDisplayValue('Missing Spanish'),
        ).not.toBeInTheDocument();

        // Check that invalid rows don't appear in the saved examples table
        const allTableCells = screen.queryAllByRole('cell');
        const invalidContent = allTableCells.filter(
          (cell) =>
            cell.textContent === 'Hi' ||
            cell.textContent === 'ERROR' ||
            cell.textContent === 'Missing Spanish',
        );
        expect(invalidContent).toHaveLength(0);
      });

      // Verify each valid Spanish example appears appropriately
      await waitFor(() => {
        // Check appearances in saved examples table (as text)
        const holaTextInstances = screen.queryAllByText('Hola');
        const adiosTextInstances = screen.queryAllByText('Adios');
        expect(holaTextInstances.length).toBeLessThanOrEqual(1);
        expect(adiosTextInstances.length).toBeLessThanOrEqual(1);

        // Check appearances in editable table (as input values)
        const holaInputs = screen.queryAllByDisplayValue('Hola');
        const adiosInputs = screen.queryAllByDisplayValue('Adios');
        expect(holaInputs.length).toBeLessThanOrEqual(1);
        expect(adiosInputs.length).toBeLessThanOrEqual(1);

        // Verify each example appears at least once somewhere
        const totalHola = holaTextInstances.length + holaInputs.length;
        const totalAdios = adiosTextInstances.length + adiosInputs.length;
        expect(totalHola).toBeGreaterThanOrEqual(1);
        expect(totalHola).toBeLessThanOrEqual(2);
        expect(totalAdios).toBeGreaterThanOrEqual(1);
        expect(totalAdios).toBeLessThanOrEqual(2);
      });
    });
  });
});
