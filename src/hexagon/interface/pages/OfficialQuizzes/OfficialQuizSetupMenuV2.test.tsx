import type { OfficialQuizSetupMenuProps } from '@interface/pages/OfficialQuizzes/OfficialQuizSetupMenu';
import type { QuizGroup } from '@learncraft-spanish/shared';
import { OfficialQuizSetupMenuV2 } from '@interface/pages/OfficialQuizzes/OfficialQuizSetupMenuV2';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  createMockOfficialQuizRecord,
  createMockQuizGroup,
} from '@testing/factories/quizFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it, vi } from 'vitest';

function createMockQuizGroups(): QuizGroup[] {
  return [
    createMockQuizGroup({
      id: 1,
      name: 'LearnCraft Spanish',
      urlSlug: 'lcsp',
      courseId: 1,
      published: true,
      quizzes: [
        createMockOfficialQuizRecord({
          id: 1,
          relatedQuizGroupId: 1,
          quizNumber: 1,
          quizTitle: 'LCSP - Lesson 1',
          published: true,
        }),
        createMockOfficialQuizRecord({
          id: 2,
          relatedQuizGroupId: 1,
          quizNumber: 2,
          quizTitle: 'LCSP - Lesson 2',
          published: true,
        }),
      ],
    }),
    createMockQuizGroup({
      id: 2,
      name: 'Spanish in One Month',
      urlSlug: 'si1m',
      courseId: 2,
      published: true,
      quizzes: [
        createMockOfficialQuizRecord({
          id: 101,
          relatedQuizGroupId: 2,
          quizNumber: 1,
          quizTitle: 'SI1M - Lesson 1',
          published: true,
        }),
      ],
    }),
  ];
}

const mockQuizGroups = createMockQuizGroups();
const lcspGroup = mockQuizGroups[0];

const defaultProps: OfficialQuizSetupMenuProps = {
  selectedQuizGroup: lcspGroup,
  setSelectedQuizGroup: vi.fn(),
  quizNumber: 0,
  setUserSelectedQuizNumber: vi.fn(),
  quizOptions: lcspGroup.quizzes,
  quizGroups: mockQuizGroups,
  startQuiz: vi.fn(),
};

function renderWithOverrides(overrides?: Partial<OfficialQuizSetupMenuProps>) {
  return render(
    <MockAllProviders>
      <OfficialQuizSetupMenuV2 {...defaultProps} {...(overrides ?? {})} />
    </MockAllProviders>,
  );
}

describe('component OfficialQuizSetupMenuV2', () => {
  describe('collapsed group row', () => {
    it('shows the selected group as text, not a select', () => {
      renderWithOverrides();

      expect(screen.getByText('LearnCraft Spanish')).toBeInTheDocument();
      expect(screen.queryByLabelText('Course')).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Change' }),
      ).toBeInTheDocument();
    });

    it('shows a fallback when no group is selected', () => {
      renderWithOverrides({ selectedQuizGroup: null });

      expect(screen.getByText('No course selected')).toBeInTheDocument();
    });
  });

  describe('changing the group', () => {
    it('reveals a course select when "Change" is clicked', () => {
      renderWithOverrides();

      fireEvent.click(screen.getByRole('button', { name: 'Change' }));

      const groupSelect = screen.getByLabelText('Course') as HTMLSelectElement;
      expect(groupSelect).toBeInTheDocument();
      expect(groupSelect.value).toBe('1');
      for (const group of mockQuizGroups) {
        expect(
          screen.getByRole('option', { name: group.name }),
        ).toBeInTheDocument();
      }
    });

    it('applies the new group immediately and collapses back to text', () => {
      const setSelectedQuizGroup = vi.fn();
      renderWithOverrides({ setSelectedQuizGroup });

      fireEvent.click(screen.getByRole('button', { name: 'Change' }));
      const groupSelect = screen.getByLabelText('Course') as HTMLSelectElement;
      fireEvent.change(groupSelect, { target: { value: '2' } });

      expect(setSelectedQuizGroup).toHaveBeenCalledWith(2);
      expect(screen.queryByLabelText('Course')).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Change' }),
      ).toBeInTheDocument();
    });

    it('cancels back to text without changing the group', () => {
      const setSelectedQuizGroup = vi.fn();
      renderWithOverrides({ setSelectedQuizGroup });

      fireEvent.click(screen.getByRole('button', { name: 'Change' }));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(setSelectedQuizGroup).not.toHaveBeenCalled();
      expect(screen.getByText('LearnCraft Spanish')).toBeInTheDocument();
      expect(screen.queryByLabelText('Course')).not.toBeInTheDocument();
    });
  });

  describe('quiz field', () => {
    it('lists a placeholder plus every quiz in the group when nothing is chosen', () => {
      renderWithOverrides({ quizNumber: 0 });

      const quizSelect = screen.getByLabelText('Quiz') as HTMLSelectElement;
      expect(quizSelect.value).toBe('0');
      expect(
        screen.getByRole('option', { name: 'Select a quiz' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'LCSP - Lesson 1' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'LCSP - Lesson 2' }),
      ).toBeInTheDocument();
    });

    it('calls setUserSelectedQuizNumber when a quiz is chosen', () => {
      const setUserSelectedQuizNumber = vi.fn();
      renderWithOverrides({ setUserSelectedQuizNumber });

      const quizSelect = screen.getByLabelText('Quiz') as HTMLSelectElement;
      fireEvent.change(quizSelect, { target: { value: '2' } });

      expect(setUserSelectedQuizNumber).toHaveBeenCalledWith(2);
    });

    it('is disabled when the group has no quizzes', () => {
      renderWithOverrides({ quizOptions: [] });

      const quizSelect = screen.getByLabelText('Quiz') as HTMLSelectElement;
      expect(quizSelect).toBeDisabled();
    });
  });

  describe('begin quiz button', () => {
    it('is disabled when no quiz is selected', () => {
      renderWithOverrides({ quizNumber: 0 });

      expect(screen.getByRole('button', { name: 'Begin quiz' })).toBeDisabled();
    });

    it('is disabled when the selected quiz number does not exist in the group', () => {
      renderWithOverrides({ quizNumber: 999 });

      expect(screen.getByRole('button', { name: 'Begin quiz' })).toBeDisabled();
    });

    it('is enabled and starts the quiz when a valid quiz is selected', () => {
      const startQuiz = vi.fn();
      renderWithOverrides({ quizNumber: 2, startQuiz });

      const button = screen.getByRole('button', { name: 'Begin quiz' });
      expect(button).toBeEnabled();

      fireEvent.click(button);
      expect(startQuiz).toHaveBeenCalledTimes(1);
    });
  });

  describe('leave home', () => {
    it('calls onLeave from the back affordance under Begin quiz', () => {
      const onLeave = vi.fn();
      renderWithOverrides({ onLeave });

      fireEvent.click(screen.getByRole('button', { name: /back to home/i }));

      expect(onLeave).toHaveBeenCalledTimes(1);
    });

    it('omits the back affordance when onLeave is not provided', () => {
      renderWithOverrides();

      expect(
        screen.queryByRole('button', { name: /back to home/i }),
      ).not.toBeInTheDocument();
    });
  });
});
