import { render, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';

import { describe, expect, it } from 'vitest';
import ExampleCreator from './ExampleCreator';

function getRenderedComponent() {
  return render(
    <MockAllProviders route="/example-creator">
      <ExampleCreator />
    </MockAllProviders>,
  );
}

describe('component ExampleCreator', () => {
  it('should render', async () => {
    <ExampleCreator />;
  });
  it('should render on /example-creator', async () => {
    render(
      <MockAllProviders route="/example-creator">
        <ExampleCreator />
      </MockAllProviders>,
    );
    await waitFor(() =>
      expect(screen.getByText('Example Creator')).toBeInTheDocument(),
    );
  });

  it('should have input fields for example creator', async () => {
    const expectedFields = [
      'Spanish Example',
      'English Translation',
      // 'Spanglish',
    ];
    const { getByText } = getRenderedComponent();

    expectedFields.forEach((field) => {
      expect(getByText(field)).toBeInTheDocument();
    });
  });
});
