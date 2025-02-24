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

  it('should have no example selected by default', async () => {
    const { getByText } = getRenderedComponent();
    await waitFor(() => {
      expect(
        getByText('Please select an example to preview/edit'),
      ).toBeInTheDocument();
    });
  });
});
