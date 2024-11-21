import { beforeEach, describe, expect, it } from 'vitest';
import {
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import { act } from 'react';
import { get } from 'lodash';
import MockAllProviders from '../../../mocks/Providers/MockAllProviders';
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
      'Spanglish',
    ];
    const { getByText } = getRenderedComponent();

    expectedFields.forEach((field) => {
      expect(getByText(field)).toBeInTheDocument();
    });
  });
});
