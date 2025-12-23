import type { OfficialQuizSetupMenuProps } from '@interface/pages/OfficialQuizzes/OfficialQuizSetupMenu';
import type { OfficialQuizRecord } from '@learncraft-spanish/shared';
import { OfficialQuizSetupMenu } from '@interface/pages/OfficialQuizzes/OfficialQuizSetupMenu';
import { officialQuizCourses } from '@learncraft-spanish/shared';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMockOfficialQuizRecord } from '@testing/factories/quizFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it, vi } from 'vitest';

function createQuizOptions(
  courseCode: string,
  count = 3,
): OfficialQuizRecord[] {
  return Array.from({ length: count }, (_, idx) =>
    createMockOfficialQuizRecord({
      id: idx + 1,
      courseCode,
      quizNumber: idx + 1,
      quizTitle: `${courseCode.toUpperCase()} ${idx + 1}`,
    }),
  );
}
const defaultProps: OfficialQuizSetupMenuProps = {
  courseCode: officialQuizCourses[0]?.code ?? 'lcsp',
  setUserSelectedCourseCode: vi.fn(),
  quizNumber: 0,
  setUserSelectedQuizNumber: vi.fn(),
  quizOptions: createQuizOptions(officialQuizCourses[0]?.code, 2),
  startQuiz: vi.fn(),
};

function renderWithOverrides(overrides?: Partial<OfficialQuizSetupMenuProps>) {
  return render(
    <MockAllProviders>
      <OfficialQuizSetupMenu {...defaultProps} {...(overrides ?? {})} />
    </MockAllProviders>,
  );
}

describe('officialQuizSetupMenu', () => {
  it('renders course and quiz selects with options', () => {
    const courseCode = officialQuizCourses[0]?.code ?? 'lcsp';
    const quizOptions = createQuizOptions(courseCode, 2);

    renderWithOverrides({
      courseCode,
      quizOptions,
    });

    expect(screen.getByText('Official Quizzes')).toBeInTheDocument();

    const courseSelect = screen.getByLabelText(
      'Select Course',
    ) as HTMLSelectElement;
    expect(courseSelect).toBeInTheDocument();
    expect(courseSelect.value).toBe(courseCode);
    // has all official courses
    for (const course of officialQuizCourses) {
      expect(
        screen.getByRole('option', { name: course.name }),
      ).toBeInTheDocument();
    }

    const quizSelect = screen.getByLabelText(
      'Select Quiz',
    ) as HTMLSelectElement;
    expect(quizSelect).toBeInTheDocument();
    // includes default option and provided quiz options
    expect(
      screen.getByRole('option', { name: 'Select a Quiz' }),
    ).toBeInTheDocument();
    for (const option of quizOptions) {
      expect(
        screen.getByRole('option', { name: option.quizTitle }),
      ).toBeInTheDocument();
    }

    // MenuButton stub rendered
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });

  it('changes course calls setUserSelectedCourseCode and resets quiz number', () => {
    const courseCode = officialQuizCourses[0]?.code ?? 'lcsp';
    const nextCourseCode = officialQuizCourses[1]?.code ?? courseCode;
    const quizOptions = createQuizOptions(courseCode, 2);
    const setUserSelectedCourseCode = vi.fn();
    const setUserSelectedQuizNumber = vi.fn();

    renderWithOverrides({
      courseCode,
      quizNumber: 2,
      quizOptions,
      setUserSelectedCourseCode,
      setUserSelectedQuizNumber,
    });

    const courseSelect = screen.getByLabelText(
      'Select Course',
    ) as HTMLSelectElement;
    fireEvent.change(courseSelect, { target: { value: nextCourseCode } });

    expect(setUserSelectedCourseCode).toHaveBeenCalledWith(nextCourseCode);
    expect(setUserSelectedQuizNumber).toHaveBeenCalledWith(0);
  });

  it('changes quiz calls setChosenQuizNumber', () => {
    const setUserSelectedQuizNumber = vi.fn();

    renderWithOverrides({ setUserSelectedQuizNumber });

    const quizSelect = screen.getByLabelText(
      'Select Quiz',
    ) as HTMLSelectElement;
    fireEvent.change(quizSelect, { target: { value: '2' } });

    expect(setUserSelectedQuizNumber).toHaveBeenCalledWith(2);
  });

  it('begin Review button enabled only when quiz selected is valid quiz', () => {
    const courseCode = officialQuizCourses[0]?.code ?? '';
    const quizOptions = createQuizOptions(courseCode || 'lcsp', 2);
    const setUserSelectedCourseCode = vi.fn();
    const setUserSelectedQuizNumber = vi.fn();
    const startQuiz = vi.fn();

    const { rerender } = render(
      <MockAllProviders>
        <OfficialQuizSetupMenu
          courseCode={''}
          setUserSelectedCourseCode={setUserSelectedCourseCode}
          quizNumber={0}
          setUserSelectedQuizNumber={setUserSelectedQuizNumber}
          quizOptions={quizOptions}
          startQuiz={startQuiz}
        />
      </MockAllProviders>,
    );

    const button = screen.getByRole('button', { name: 'Begin Review' });
    expect(button).toBeDisabled();

    rerender(
      <MockAllProviders>
        <OfficialQuizSetupMenu
          courseCode={courseCode}
          setUserSelectedCourseCode={setUserSelectedCourseCode}
          quizNumber={0}
          setUserSelectedQuizNumber={setUserSelectedQuizNumber}
          quizOptions={quizOptions}
          startQuiz={startQuiz}
        />
      </MockAllProviders>,
    );
    expect(button).toBeDisabled();

    rerender(
      <MockAllProviders>
        <OfficialQuizSetupMenu
          courseCode={courseCode}
          setUserSelectedCourseCode={setUserSelectedCourseCode}
          quizNumber={2}
          setUserSelectedQuizNumber={setUserSelectedQuizNumber}
          quizOptions={quizOptions}
          startQuiz={startQuiz}
        />
      </MockAllProviders>,
    );
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(startQuiz).toHaveBeenCalled();
  });
});
