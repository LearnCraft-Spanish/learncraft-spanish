import type {
  BasePrivateCall,
  CreatePrivateCallCommand,
  FurnishedWeekWithCoach,
  PrivateCallRating,
  PrivateCallType,
} from '@learncraft-spanish/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { act } from 'react';
import { basePrivateCallFactory } from 'src/hexagon/testing/factories/privateCallsFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PrivateCallsCell from './PrivateCallsCell';

const privateCallTestData = vi.hoisted(() => ({
  callRating: {
    callRatingId: 1,
    rating: 'Excellent',
  },
  callType: {
    callTypeId: 1,
    callType: 'Monthly Call',
  },
  caller: {
    coach_id: 3,
    fullName: 'Coach Example',
    email: 'coach@example.com',
  },
  createPrivateCallMutation: vi.fn(
    (
      _command: CreatePrivateCallCommand,
      options?: { onSuccess?: (call: BasePrivateCall) => void },
    ) => {
      options?.onSuccess?.({
        callId: 1,
      } as BasePrivateCall);
    },
  ),
}));

const callRating: PrivateCallRating = privateCallTestData.callRating;
const callType: PrivateCallType = privateCallTestData.callType;

const call: BasePrivateCall = basePrivateCallFactory({
  callId: 1,
  weekId: 12,
  caller: privateCallTestData.caller,
  callDate: '2026-07-08',
  callRating,
  callType,
  notes: 'Great progress this week',
  areasOfDifficulty: 'Preterite conjugation',
  recording: 'https://example.com/recording',
});

const week = {
  weekId: 12,
  weekStarts: '2026-07-05',
  student: {
    fullName: 'Student Example',
    email: 'student@example.com',
    student_id: 24,
  },
  privateCalls: [call],
} as FurnishedWeekWithCoach;

vi.mock('@application/adapters/authAdapter', () => ({
  useAuthAdapter: () => ({
    authUser: { email: 'coach@example.com' },
    isAdmin: true,
  }),
}));

vi.mock('@application/queries/CoachQueries/useAllCoachesQuery', () => ({
  useAllCoachesQuery: () => ({
    coaches: [privateCallTestData.caller],
    isLoading: false,
    error: null,
  }),
}));

vi.mock(
  '@application/queries/PrivateCallQueries/usePrivateCallLookupsQuery',
  () => ({
    usePrivateCallLookupsQuery: () => ({
      callRatings: [privateCallTestData.callRating],
      callTypes: [privateCallTestData.callType],
      isLoading: false,
      error: null,
    }),
  }),
);

vi.mock(
  '@application/queries/PrivateCallQueries/usePrivateCallMutations',
  () => ({
    usePrivateCallMutations: () => ({
      createPrivateCallMutation: {
        mutate: privateCallTestData.createPrivateCallMutation,
      },
      updatePrivateCallMutation: { mutate: vi.fn() },
      deletePrivateCallMutation: { mutate: vi.fn() },
    }),
  }),
);

describe('component PrivateCallsCell', () => {
  beforeEach(() => {
    privateCallTestData.createPrivateCallMutation.mockClear();
  });

  it('default view renders without crashing', async () => {
    render(
      <MockAllProviders>
        <PrivateCallsCell week={week} calls={[call]} tableEditMode={false} />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText(call.callRating.rating)).toBeInTheDocument();
    });
  });

  describe('contextual menu view', () => {
    it('contextual menu view renders without crashing', async () => {
      render(
        <MockAllProviders>
          <PrivateCallsCell week={week} calls={[call]} tableEditMode={false} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(call.callRating.rating)).toBeInTheDocument();
      });
      act(() => {
        screen.getByText(call.callRating.rating).click();
      });
      await waitFor(() => {
        expect(screen.getByText('Rating:')).toBeInTheDocument();
      });
    });

    it('contextual menu view renders the correct data', async () => {
      const requiredFields = ['Rating:', 'Notes:', 'Difficulties:'];
      render(
        <MockAllProviders>
          <PrivateCallsCell week={week} calls={[call]} tableEditMode={false} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(call.callRating.rating)).toBeInTheDocument();
      });
      act(() => {
        screen.getByText(call.callRating.rating).click();
      });
      await waitFor(() => {
        requiredFields.forEach((field) => {
          expect(screen.getByText(field)).toBeInTheDocument();
        });
      });
    });

    it('contextual menu view renders the session documents if they exist on the call', async () => {
      if (!call.recording) {
        throw new Error('No recording found in mock data');
      }
      render(
        <MockAllProviders>
          <PrivateCallsCell week={week} calls={[call]} tableEditMode={false} />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText(call.callRating.rating)).toBeInTheDocument();
      });
      act(() => {
        screen.getByText(call.callRating.rating).click();
      });
      await waitFor(() => {
        expect(screen.getByText('Recording Link')).toBeInTheDocument();
      });
    });

    it('opens the created call after creating a new private call', async () => {
      render(
        <MockAllProviders>
          <PrivateCallsCell week={week} calls={[call]} tableEditMode={false} />
        </MockAllProviders>,
      );

      act(() => {
        screen.getByText('New').click();
      });

      await waitFor(() => {
        expect(screen.getByText('Create Call')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText('Rating:'), {
        target: { value: callRating.rating },
      });

      act(() => {
        screen.getByText('Save').click();
      });

      await waitFor(() => {
        expect(
          privateCallTestData.createPrivateCallMutation,
        ).toHaveBeenCalled();
        expect(
          screen.getByText(`${week.student?.fullName} on July 8`),
        ).toBeInTheDocument();
      });
    });
  });
});
