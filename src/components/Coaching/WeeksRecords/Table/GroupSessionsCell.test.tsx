import { describe, it, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';

import MockAllProviders from '../../../../../mocks/Providers/MockAllProviders';
import GroupSessionsCell from './GroupSessionsCell';
import mockData from '../../../../../mocks/data/serverlike/studentRecords/studentRecordsMockData';

const week = mockData.lastThreeWeeks[0];
const relatedGroupSession = mockData.groupSessions[0];
describe('component StudentCell', () => {
  it('renders without crashing', async () => {
    render(
      <MockAllProviders>
        <GroupSessionsCell week={week} />
      </MockAllProviders>,
    );
    // groupSession.sessionType of a group session related to the week record
    await waitFor(() => {
      expect(
        screen.getByText(relatedGroupSession.sessionType),
      ).toBeInTheDocument();
    });
  });
});
