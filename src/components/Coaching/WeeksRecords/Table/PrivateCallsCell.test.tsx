import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

import MockAllProviders from '../../../../../mocks/Providers/MockAllProviders';
import PrivateCallsCell from './PrivateCallsCell';
describe('component StudentCell', () => {
  it('renders without crashing', () => {
    render(
      <MockAllProviders>
        <PrivateCallsCell week={} />
      </MockAllProviders>,
    );
    // call.rating of a call related to the week record
    expect(screen.getByText()).toBeInTheDocument();
  });
});
