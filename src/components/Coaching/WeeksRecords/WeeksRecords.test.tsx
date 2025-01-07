import { describe, it, vi, expect } from 'vitest';
import WeeksRecordsSection from './WeeksRecords';
import { render, waitFor, screen } from '@testing-library/react';

import MockAllProviders from '../../../../mocks/Providers/MockAllProviders';

describe('section WeeksRecordsSection', () => {
  it('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <WeeksRecordsSection />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('Coach:')).toBeInTheDocument();
    });
  });
});
