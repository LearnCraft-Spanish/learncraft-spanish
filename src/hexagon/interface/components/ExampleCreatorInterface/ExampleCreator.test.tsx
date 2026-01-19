import ExampleCreator from '@interface/components/ExampleCreatorInterface/ExampleCreator';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('component ExampleCreator', () => {
  it('should render', () => {
    render(<ExampleCreator />);
    expect(screen.getByText('Example Creator')).toBeInTheDocument();
  });
});
