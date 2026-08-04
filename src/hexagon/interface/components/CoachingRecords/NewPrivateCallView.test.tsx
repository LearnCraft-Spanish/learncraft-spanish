import {
  mockAuthAdapter,
  resetMockAuthAdapter,
} from '@application/adapters/authAdapter.mock';
import mockUseAllCoachesQuery, {
  overrideMockUseAllCoachesQuery,
  resetMockUseAllCoachesQuery,
} from '@application/queries/CoachQueries/useAllCoachesQuery.mock';
import mockUsePrivateCallLookupsQuery, {
  overrideMockUsePrivateCallLookupsQuery,
  resetMockUsePrivateCallLookupsQuery,
} from '@application/queries/PrivateCallQueries/usePrivateCallLookupsQuery.mock';
import {
  mockUsePrivateCallMutations,
  overrideMockUsePrivateCallMutations,
  resetMockUsePrivateCallMutations,
} from '@application/queries/PrivateCallQueries/usePrivateCallMutations.mock';
import mockUseWeeksByStartDate, {
  overrideMockUseWeeksByStartDate,
  resetMockUseWeeksByStartDate,
} from '@application/queries/useWeeksByStartDate/useWeeksByStartDate.mock';
import { NewPrivateCallView } from '@interface/components/CoachingRecords/NewPrivateCallView';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { basePrivateCallFactory } from '@testing/factories/privateCallsFactory';
import { createMockFurnishedWeekWithCoach } from '@testing/factories/weekFactory';
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

vi.mock('@application/queries/useWeeksByStartDate/useWeeksByStartDate', () => ({
  useWeeksByStartDate: () => mockUseWeeksByStartDate,
}));

vi.mock('src/components/Coaching/general/CustomStudentSelector', () => ({
  CustomStudentSelector: ({
    weekStarts,
    onChange,
  }: {
    weekStarts: string;
    onChange: (weekId: number) => void;
  }) => (
    <button
      type="button"
      data-testid="select-student"
      data-week-starts={weekStarts}
      onClick={() => onChange(27)}
    >
      select student
    </button>
  ),
}));

const callRating = {
  callRatingId: 1,
  rating: 'Excellent',
};

const callType = {
  callTypeId: 1,
  callType: 'Monthly Call',
};

const caller = {
  coach_id: 3,
  fullName: 'Coach Example',
  email: mockAuthAdapter.authUser.email,
};

const createdCall = basePrivateCallFactory({
  callId: 99,
  weekId: 12,
  caller,
  callRating,
  callType,
});

const selectedWeek = createMockFurnishedWeekWithCoach({ weekId: 27 });

describe('component NewPrivateCallView', () => {
  beforeEach(() => {
    resetMockAuthAdapter();
    resetMockUsePrivateCallMutations();
    resetMockUsePrivateCallLookupsQuery();
    resetMockUseAllCoachesQuery();
    resetMockUseWeeksByStartDate();
    overrideMockUseAllCoachesQuery({ coaches: [caller] });
    overrideMockUsePrivateCallLookupsQuery({
      callRatings: [callRating],
      callTypes: [callType],
    });
    overrideMockUsePrivateCallMutations({
      createPrivateCallMutation: {
        ...mockUsePrivateCallMutations().createPrivateCallMutation,
        mutate: vi.fn((_command, options) => {
          options?.onSuccess?.(createdCall);
        }),
      },
    });
  });

  it('creates a private call on the week-provided path', async () => {
    const onSuccess = vi.fn();
    render(
      <MockAllProviders>
        <NewPrivateCallView
          week={{
            weekId: 12,
            studentName: 'Student Example',
            weekStarts: '2026-07-05',
          }}
          onSuccess={onSuccess}
        />
      </MockAllProviders>,
    );

    expect(screen.getByText('Create Call')).toBeInTheDocument();
    expect(screen.getByText('Student Example')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Rating:/), {
      target: { value: callRating.rating },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        mockUsePrivateCallMutations().createPrivateCallMutation.mutate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          weekId: 12,
          caller: caller.coach_id,
          callRating,
          callType,
        }),
        expect.any(Object),
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('resolves the selected student week on the selector path', async () => {
    overrideMockUseWeeksByStartDate({ weeks: [selectedWeek] });
    render(
      <MockAllProviders>
        <NewPrivateCallView weekStartsDefaultValue="2026-07-05" />
      </MockAllProviders>,
    );

    expect(screen.getByTestId('select-student')).toHaveAttribute(
      'data-week-starts',
      '2026-07-05',
    );
    fireEvent.click(screen.getByTestId('select-student'));
    fireEvent.change(screen.getByLabelText(/Rating:/), {
      target: { value: callRating.rating },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        mockUsePrivateCallMutations().createPrivateCallMutation.mutate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          weekId: 27,
          caller: caller.coach_id,
          callRating,
          callType,
        }),
        expect.any(Object),
      );
    });
  });
});
