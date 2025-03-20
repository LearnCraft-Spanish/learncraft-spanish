import { render, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';

import { describe, expect, it } from 'vitest';
import ExampleManager from './ExampleManager';

function getRenderedComponent() {
  return render(
    <MockAllProviders route="/example-creator">
      <ExampleManager />
    </MockAllProviders>,
  );
}

describe('component ExampleManager', () => {
  it('should render', async () => {
    <ExampleManager />;
  });

  it('should render on /example-creator', async () => {
    render(
      <MockAllProviders route="/example-creator">
        <ExampleManager />
      </MockAllProviders>,
    );
    await waitFor(() =>
      expect(screen.getByText('Example Manager')).toBeInTheDocument(),
    );
  });

  it('should have input fields for example creator', async () => {
    const { getByText, getByRole } = getRenderedComponent();

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Example Manager')).toBeInTheDocument();
    });

    // Click the toggle button to switch to single example mode
    const toggleButton = getByRole('button', {
      name: /Create\/Edit Single Example/i,
    });
    toggleButton.click();

    // Wait for the fields to appear
    await waitFor(() => {
      const expectedFields = ['Spanish Example', 'English Translation'];

      expectedFields.forEach((field) => {
        expect(getByText(field)).toBeInTheDocument();
      });
    });
  });
});
