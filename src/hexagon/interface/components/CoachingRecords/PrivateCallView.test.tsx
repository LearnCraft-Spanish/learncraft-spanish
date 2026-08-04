import {
  overrideMockAuthAdapter,
  resetMockAuthAdapter,
} from '@application/adapters/authAdapter.mock';
import mockUseAllCoachesQuery, {
  overrideMockUseAllCoachesQuery,
  resetMockUseAllCoachesQuery,
} from '@application/queries/CoachQueries/useAllCoachesQuery.mock';
import mockUsePrivateCallLookupsQuery, {
  resetMockUsePrivateCallLookupsQuery,
} from '@application/queries/PrivateCallQueries/usePrivateCallLookupsQuery.mock';
import {
  mockUsePrivateCallMutations,
  overrideMockUsePrivateCallMutations,
  resetMockUsePrivateCallMutations,
} from '@application/queries/PrivateCallQueries/usePrivateCallMutations.mock';
import { PrivateCallView } from '@interface/components/CoachingRecords/PrivateCallView';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { basePrivateCallFactory } from '@testing/factories/privateCallsFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/queries/PrivateCallQueries/usePrivateCallMutations',
  () => ({
    usePrivateCallMutations: mockUsePrivateCallMutations,
  }),
);

vi.mock(
  '@application/queries/PrivateCallQueries/usePrivateCallLookupsQuery',
  () => ({
    usePrivateCallLookupsQuery: () => mockUsePrivateCallLookupsQuery,
  }),
);

vi.mock('@application/queries/CoachQueries/useAllCoachesQuery', () => ({
  useAllCoachesQuery: () => mockUseAllCoachesQuery,
}));

const caller = {
  coach_id: 3,
  fullName: 'Coach Example',
  email: 'coach@example.com',
};

const callRating = {
  callRatingId: 1,
  rating: 'Excellent',
};

const callType = {
  callTypeId: 1,
  callType: 'Monthly Call',
};

const call = basePrivateCallFactory({
  callId: 15,
  weekId: 12,
  caller,
  callDate: '2026-07-08',
  callRating,
  callType,
  notes: 'Great progress this week',
  areasOfDifficulty: 'Preterite conjugation',
  recording: 'https://example.com/recording',
});

describe('component PrivateCallView', () => {
  beforeEach(() => {
    resetMockAuthAdapter();
    resetMockUsePrivateCallMutations();
    resetMockUsePrivateCallLookupsQuery();
    resetMockUseAllCoachesQuery();
    overrideMockUseAllCoachesQuery({ coaches: [caller] });
    overrideMockUsePrivateCallMutations({
      updatePrivateCallMutation: {
        ...mockUsePrivateCallMutations().updatePrivateCallMutation,
        mutate: vi.fn((_command, options) => {
          options?.onSuccess?.(call);
        }),
      },
      deletePrivateCallMutation: {
        ...mockUsePrivateCallMutations().deletePrivateCallMutation,
        mutate: vi.fn((_command, options) => {
          options?.onSuccess?.(undefined);
        }),
      },
    });
  });

  function renderView(): void {
    render(
      <MockAllProviders>
        <PrivateCallView
          call={call}
          displayContext={{ studentName: 'Student Example' }}
          tableEditMode={false}
        />
      </MockAllProviders>,
    );
  }

  async function enterEditMode(): Promise<void> {
    fireEvent.click(screen.getByAltText('edit record'));
    await waitFor(() => {
      expect(screen.getByText('Edit Call')).toBeInTheDocument();
    });
  }

  it('renders call details in read mode', () => {
    renderView();
    expect(screen.getByText(/Student Example on/)).toBeInTheDocument();
    expect(screen.getByText('Great progress this week')).toBeInTheDocument();
    expect(screen.getByText('Preterite conjugation')).toBeInTheDocument();
    expect(screen.getByText('Coach Example')).toBeInTheDocument();
  });

  it('submits an edit when notes change', async () => {
    const onSuccess = vi.fn();
    render(
      <MockAllProviders>
        <PrivateCallView
          call={call}
          displayContext={{ studentName: 'Student Example' }}
          tableEditMode={false}
          onSuccess={onSuccess}
        />
      </MockAllProviders>,
    );

    await enterEditMode();
    fireEvent.change(screen.getByLabelText(/Notes:/), {
      target: { value: 'Updated call notes' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        mockUsePrivateCallMutations().updatePrivateCallMutation.mutate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          callId: 15,
          notes: 'Updated call notes',
        }),
        expect.any(Object),
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows admin-gated delete and deletes the call', async () => {
    overrideMockAuthAdapter({ isAdmin: true });
    renderView();
    await enterEditMode();

    fireEvent.click(screen.getByRole('button', { name: 'Delete Record' }));
    await waitFor(() => {
      expect(
        screen.getByText('Are you sure you want to delete this record?'),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(
        mockUsePrivateCallMutations().deletePrivateCallMutation.mutate,
      ).toHaveBeenCalledWith({ callId: 15 }, expect.any(Object));
    });
  });

  it('hides delete when the user is not an admin', async () => {
    overrideMockAuthAdapter({ isAdmin: false });
    renderView();
    await enterEditMode();
    expect(
      screen.queryByRole('button', { name: 'Delete Record' }),
    ).not.toBeInTheDocument();
  });
});
