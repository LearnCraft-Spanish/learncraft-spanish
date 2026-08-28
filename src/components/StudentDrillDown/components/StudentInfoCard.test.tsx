import type { UseMutationResult } from '@tanstack/react-query';
import type {
  CoachingStudent,
  UpdateCoachingStudentCommand,
} from '@learncraft-spanish/shared';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMockCoachingStudent } from '@testing/factories/coachingStudentFactory';
import {
  mockUseAllTimeZonesQuery,
  resetMockUseAllTimeZonesQuery,
} from '@application/queries/CoachingStudentQueries/useAllTimeZonesQuery.mock';
import {
  mockUseUpdateCoachingStudentMutation,
  overrideMockUseUpdateCoachingStudentMutation,
  resetMockUseUpdateCoachingStudentMutation,
} from '@application/queries/CoachingStudentQueries/useUpdateCoachingStudentMutation.mock';
import {
  mockUseAllCoachesQuery,
  resetMockUseAllCoachesQuery,
} from '@application/queries/CoachQueries/useAllCoachesQuery.mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentInfoCard, {
  StudentInfoContextual,
} from './StudentInfoCard';

const openModal = vi.fn();
const closeContextual = vi.fn();
const mutate = vi.fn();

vi.mock('@application/queries/CoachingStudentQueries/useAllTimeZonesQuery', () => ({
  useAllTimeZonesQuery: () => mockUseAllTimeZonesQuery,
}));

vi.mock(
  '@application/queries/CoachingStudentQueries/useUpdateCoachingStudentMutation',
  () => ({
    useUpdateCoachingStudentMutation: () => mockUseUpdateCoachingStudentMutation,
  }),
);

vi.mock('@application/queries/CoachQueries/useAllCoachesQuery', () => ({
  useAllCoachesQuery: () => mockUseAllCoachesQuery,
}));

vi.mock('@interface/hooks/useModal', () => ({
  useModal: () => ({
    openModal,
    closeModal: vi.fn(),
    modal: null,
  }),
}));

vi.mock('@interface/hooks/useContextualMenu', () => ({
  useContextualMenu: () => ({
    contextual: '',
    openContextual: vi.fn(),
    closeContextual,
    setContextualRef: vi.fn(),
  }),
}));

vi.mock('./BundleCreditsSection', () => ({
  BundleCreditsSection: () => <div data-testid="bundle-credits" />,
}));

vi.mock(
  '@interface/components/CoachStudentDrillDown/CoachStudentDrillDown',
  () => ({
    default: () => <div data-testid="coach-student-drill-down" />,
  }),
);

vi.mock('src/components/FormComponents', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('src/components/FormComponents')>();
  return {
    ...actual,
    CoachDropdown: () => <div data-testid="coach-dropdown" />,
  };
});

describe('StudentInfoCard', () => {
  beforeEach(() => {
    resetMockUseAllTimeZonesQuery();
    resetMockUseUpdateCoachingStudentMutation();
    resetMockUseAllCoachesQuery();
    openModal.mockClear();
    closeContextual.mockClear();
    mutate.mockClear();
    overrideMockUseUpdateCoachingStudentMutation({
      updateCoachingStudentMutation: {
        ...mockUseUpdateCoachingStudentMutation.updateCoachingStudentMutation,
        mutate,
      } as unknown as UseMutationResult<
        CoachingStudent,
        Error,
        UpdateCoachingStudentCommand
      >,
    });
  });

  it('renders profile document as a clickable link when value starts with http', () => {
    const student = createMockCoachingStudent({
      profileDocument: 'https://example.com/profile.doc',
    });

    render(
      <StudentInfoCard
        student={student}
        currentCoach={student.primaryCoach}
        isAdmin={false}
      />,
    );

    const link = screen.getByRole('link', {
      name: 'https://example.com/profile.doc',
    });
    expect(link).toHaveAttribute('href', 'https://example.com/profile.doc');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('renders profile document as plain text when value does not start with http', () => {
    const student = createMockCoachingStudent({
      profileDocument: 'shared-drive/profile.doc',
    });

    render(
      <StudentInfoCard
        student={student}
        currentCoach={student.primaryCoach}
        isAdmin={false}
      />,
    );

    expect(screen.getByText('shared-drive/profile.doc')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('blocks save and opens an error modal when profile document is an invalid url', () => {
    const student = createMockCoachingStudent({
      profileDocument: 'not-a-url',
    });

    render(
      <StudentInfoContextual
        student={student}
        currentCoach={student.primaryCoach}
        isAdmin={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Profile Document/i), {
      target: { value: 'also-not-a-url' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(openModal).toHaveBeenCalledWith({
      title: 'Error',
      body: 'Profile Document must be a valid url',
      type: 'error',
    });
    expect(mutate).not.toHaveBeenCalled();
  });

  it('includes profileDocument in the update mutation when the url is valid', () => {
    const student = createMockCoachingStudent({
      profileDocument: '',
    });

    render(
      <StudentInfoContextual
        student={student}
        currentCoach={student.primaryCoach}
        isAdmin={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Profile Document/i), {
      target: { value: 'https://example.com/updated.doc' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(openModal).not.toHaveBeenCalled();
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: student.student_id,
        profileDocument: 'https://example.com/updated.doc',
      }),
      expect.any(Object),
    );
  });
});
