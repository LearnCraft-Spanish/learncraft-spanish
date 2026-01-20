import ExampleCreator from '@interface/components/ExampleCreatorInterface/ExampleCreator';
import { render, screen } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it } from 'vitest';

describe('component ExampleCreator', () => {
  it('should render', () => {
    render(<MockAllProviders route="/example-creator">
      <ExampleCreator setHasUnsavedCreatedExamples={() => {}} />
    </MockAllProviders>,
    );
    expect(screen.getByText('Example Creator')).toBeInTheDocument();
  });
});
