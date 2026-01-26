import {
  mockUseExampleAssigner,
  overrideMockUseExampleAssigner,
  resetMockUseExampleAssigner,
} from '@application/useCases/useExampleAssigner/useExampleAssigner.mock';
import ExampleAssigner from '@interface/components/ExampleManager/ExampleAssigner';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import {
  createMockFlashcard,
  createMockFlashcardList,
} from '@testing/factories/flashcardFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the use case hook
vi.mock('@application/useCases/useExampleAssigner/useExampleAssigner', () => ({
  useExampleAssigner: () => mockUseExampleAssigner,
}));

// Mock useModal
const mockOpenModal = vi.fn();
const mockCloseModal = vi.fn();

vi.mock('@interface/hooks/useModal', () => ({
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}));

describe('ExampleAssigner', () => {
  beforeEach(() => {
    resetMockUseExampleAssigner();
    mockOpenModal.mockClear();
    mockCloseModal.mockClear();
  });

  it('should show loading message when fetching selected examples', () => {
    overrideMockUseExampleAssigner({
      isFetchingSelectedExamples: true,
      selectedExamples: [],
    });

    render(
      <MockAllProviders>
        <ExampleAssigner />
      </MockAllProviders>,
    );

    expect(screen.getByText('Loading selected examples...')).toBeInTheDocument();
  });

  it('should show message when no examples are selected', () => {
    overrideMockUseExampleAssigner({
      selectedExamples: [],
      isFetchingSelectedExamples: false,
    });

    render(
      <MockAllProviders>
        <ExampleAssigner />
      </MockAllProviders>,
    );

    expect(screen.getByText('Assign Examples')).toBeInTheDocument();
    expect(
      screen.getByText(
        'No examples selected. Please select examples from the search page.',
      ),
    ).toBeInTheDocument();
  });

  it('should render all components when examples are selected', () => {
    const examples = createMockExampleWithVocabularyList(3);

    overrideMockUseExampleAssigner({
      selectedExamples: examples,
      isFetchingSelectedExamples: false,
      assignmentTypeSelectorProps: {
        assignmentType: 'students',
        onToggle: vi.fn(),
      },
      studentSelectionProps: {
        isLoading: false,
      },
      quizSelectionProps: {
        selectedCourseCode: 'none',
        onCourseCodeChange: vi.fn(),
        selectedQuizRecordId: undefined,
        onQuizRecordIdChange: vi.fn(),
        availableQuizzes: undefined,
        courseOptions: [],
      },
      unassignedExamplesProps: {
        examples,
        studentFlashcards: {} as any,
        lessonPopup: {
          lessonsByVocabulary: [],
          lessonsLoading: false,
        },
      },
      assignButtonProps: {
        assignmentType: 'students',
        unassignedCount: 3,
        isAssigning: false,
        canAssign: true,
        activeStudentName: 'Test Student',
        quizName: null,
        onClick: vi.fn(),
      },
      assigningError: null,
    });

    render(
      <MockAllProviders>
        <ExampleAssigner />
      </MockAllProviders>,
    );

    expect(screen.getByText('Assign Examples')).toBeInTheDocument();
    expect(
      screen.getByText('Switch to Quiz Assignment'),
    ).toBeInTheDocument();
  });

  it('should show student assignment selector when in student mode', () => {
    const examples = createMockExampleWithVocabularyList(2);

    overrideMockUseExampleAssigner({
      selectedExamples: examples,
      isFetchingSelectedExamples: false,
      assignmentTypeSelectorProps: {
        assignmentType: 'students',
        onToggle: vi.fn(),
      },
      studentSelectionProps: {
        isLoading: false,
      },
      quizSelectionProps: {
        selectedCourseCode: 'none',
        onCourseCodeChange: vi.fn(),
        selectedQuizRecordId: undefined,
        onQuizRecordIdChange: vi.fn(),
        availableQuizzes: undefined,
        courseOptions: [],
      },
      unassignedExamplesProps: {
        examples,
        studentFlashcards: {} as any,
        lessonPopup: {
          lessonsByVocabulary: [],
          lessonsLoading: false,
        },
      },
      assignButtonProps: {
        assignmentType: 'students',
        unassignedCount: 2,
        isAssigning: false,
        canAssign: true,
        activeStudentName: 'Test Student',
        quizName: null,
        onClick: vi.fn(),
      },
      assigningError: null,
    });

    render(
      <MockAllProviders>
        <ExampleAssigner />
      </MockAllProviders>,
    );

    expect(
      screen.getByText('Select a student to assign these examples to:'),
    ).toBeInTheDocument();
  });

  it('should show quiz assignment selector when in quiz mode', () => {
    const examples = createMockExampleWithVocabularyList(2);

    overrideMockUseExampleAssigner({
      selectedExamples: examples,
      isFetchingSelectedExamples: false,
      assignmentTypeSelectorProps: {
        assignmentType: 'quiz',
        onToggle: vi.fn(),
      },
      studentSelectionProps: {
        isLoading: false,
      },
      quizSelectionProps: {
        selectedCourseCode: 'SP101',
        onCourseCodeChange: vi.fn(),
        selectedQuizRecordId: 1,
        onQuizRecordIdChange: vi.fn(),
        availableQuizzes: [
          {
            recordId: 1,
            quizNickname: 'Quiz 1',
            quizNumber: 1,
            courseCode: 'SP101',
          },
        ],
        courseOptions: [{ code: 'SP101', name: 'Spanish 101' }],
      },
      unassignedExamplesProps: {
        examples,
        studentFlashcards: {} as any,
        lessonPopup: {
          lessonsByVocabulary: [],
          lessonsLoading: false,
        },
      },
      assignButtonProps: {
        assignmentType: 'quiz',
        unassignedCount: 2,
        isAssigning: false,
        canAssign: true,
        activeStudentName: null,
        quizName: 'Quiz 1',
        onClick: vi.fn(),
      },
      assigningError: null,
    });

    render(
      <MockAllProviders>
        <ExampleAssigner />
      </MockAllProviders>,
    );

    expect(
      screen.getByText('Select a quiz to assign these examples to:'),
    ).toBeInTheDocument();
  });

  it('should open modal when assign button is clicked', () => {
    const examples = createMockExampleWithVocabularyList(3);
    const assignExamplesMock = vi.fn(async () => Promise.resolve());

    overrideMockUseExampleAssigner({
      selectedExamples: examples,
      isFetchingSelectedExamples: false,
      assignmentTypeSelectorProps: {
        assignmentType: 'students',
        onToggle: vi.fn(),
      },
      studentSelectionProps: {
        isLoading: false,
      },
      quizSelectionProps: {
        selectedCourseCode: 'none',
        onCourseCodeChange: vi.fn(),
        selectedQuizRecordId: undefined,
        onQuizRecordIdChange: vi.fn(),
        availableQuizzes: undefined,
        courseOptions: [],
      },
      assignedStudentFlashcardsProps: {
        allFlashcards: createMockFlashcardList()(2),
        displayFlashcards: createMockFlashcardList()(2),
        paginationState: {
          totalItems: 2,
          pageNumber: 1,
          maxPageNumber: 1,
          startIndex: 0,
          endIndex: 2,
          pageSize: 50,
          isOnFirstPage: true,
          isOnLastPage: true,
          previousPage: vi.fn(),
          nextPage: vi.fn(),
          goToFirstPage: vi.fn(),
        },
        isLoading: false,
        error: null,
        targetName: 'Test Student',
        onGoingToQuiz: vi.fn(),
      },
      unassignedExamplesProps: {
        examples,
        studentFlashcards: {} as any,
        lessonPopup: {
          lessonsByVocabulary: [],
          lessonsLoading: false,
        },
      },
      assignButtonProps: {
        assignmentType: 'students',
        unassignedCount: 3,
        isAssigning: false,
        canAssign: true,
        activeStudentName: 'Test Student',
        quizName: null,
        onClick: vi.fn(),
      },
      assignExamples: assignExamplesMock,
      assigningError: null,
    });

    render(
      <MockAllProviders>
        <ExampleAssigner />
      </MockAllProviders>,
    );

    const assignButton = screen.getByText('Assign 3 Examples to Test Student');
    fireEvent.click(assignButton);

    expect(mockOpenModal).toHaveBeenCalledWith({
      title: 'Confirm Assignment',
      body: 'Are you sure you want to assign 3 examples to Test Student?',
      type: 'confirm',
      confirmFunction: expect.any(Function),
      cancelFunction: expect.any(Function),
    });
  });

  it('should display error message when assigningError exists', () => {
    const examples = createMockExampleWithVocabularyList(2);
    const error = new Error('Failed to assign examples');

    overrideMockUseExampleAssigner({
      selectedExamples: examples,
      isFetchingSelectedExamples: false,
      assignmentTypeSelectorProps: {
        assignmentType: 'students',
        onToggle: vi.fn(),
      },
      studentSelectionProps: {
        isLoading: false,
      },
      quizSelectionProps: {
        selectedCourseCode: 'none',
        onCourseCodeChange: vi.fn(),
        selectedQuizRecordId: undefined,
        onQuizRecordIdChange: vi.fn(),
        availableQuizzes: undefined,
        courseOptions: [],
      },
      unassignedExamplesProps: {
        examples,
        studentFlashcards: {} as any,
        lessonPopup: {
          lessonsByVocabulary: [],
          lessonsLoading: false,
        },
      },
      assignButtonProps: {
        assignmentType: 'students',
        unassignedCount: 2,
        isAssigning: false,
        canAssign: true,
        activeStudentName: 'Test Student',
        quizName: null,
        onClick: vi.fn(),
      },
      assigningError: error,
    });

    render(
      <MockAllProviders>
        <ExampleAssigner />
      </MockAllProviders>,
    );

    expect(
      screen.getByText('Error assigning examples: Failed to assign examples'),
    ).toBeInTheDocument();
  });
});
