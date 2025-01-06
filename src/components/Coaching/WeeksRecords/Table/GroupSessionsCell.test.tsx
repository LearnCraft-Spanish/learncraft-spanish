import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

import MockAllProviders from '../../../../../mocks/Providers/MockAllProviders';
import GroupSessionsCell from './GroupSessionsCell';

describe('component StudentCell', () => {
  it('renders without crashing', () => {
    render(
      <MockAllProviders>
        <GroupSessionsCell week={} />
      </MockAllProviders>,
    );
    // groupSession.sessionType of a group session related to the week record
    expect(screen.getByText()).toBeInTheDocument();
  });
});
