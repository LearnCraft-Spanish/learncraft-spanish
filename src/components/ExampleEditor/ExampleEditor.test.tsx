import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import ExampleEditor from './ExampleEditor';

function getRenderedComponent() {
  return render(
    <MockAllProviders route="/example-editor">
      <ExampleEditor />
    </MockAllProviders>,
  );
}

describe('component ExampleEditor', () => {
  it('should render', async () => {
    <ExampleEditor />;
  });
  it('should render on /example-editor', async () => {
    render(
      <MockAllProviders route="/example-editor">
        <ExampleEditor />
      </MockAllProviders>,
    );
    await waitFor(() =>
      expect(screen.getByText('Example Editor')).toBeInTheDocument(),
    );
  });

  it.skip('should have input fields for example editor', async () => {
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
