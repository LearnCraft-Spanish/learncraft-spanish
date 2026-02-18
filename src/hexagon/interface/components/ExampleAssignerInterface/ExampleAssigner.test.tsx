import {
  mockUseExampleAssigner,
  overrideMockUseExampleAssigner,
  resetMockUseExampleAssigner,
} from '@application/useCases/useExampleAssigner/useExampleAssigner.mock';
import ExampleAssigner from '@interface/components/ExampleAssignerInterface/ExampleAssigner';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the use case hook
vi.mock('@application/useCases/useExampleAssigner/useExampleAssigner', () => ({
  useExampleAssigner: () => mockUseExampleAssigner(),
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

describe('exampleAssigner', () => {
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

    expect(
      screen.getByText('Loading selected examples...'),
    ).toBeInTheDocument();
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
        onTypeChange: vi.fn(),
      },
      studentSelectionProps: {
        isLoading: false,
      },
      quizSelectionProps: {
        selectedQuizGroupId: undefined,
        onQuizGroupIdChange: vi.fn(),
        selectedQuizRecordId: undefined,
        onQuizRecordIdChange: vi.fn(),
        availableQuizzes: undefined,
        quizGroupOptions: [],
      },
      unassignedExamplesProps: { examples },
      assignButtonProps: {
        assignmentType: 'students',
        unassignedCount: 3,
        isAssigning: false,
        canAssign: true,
        activeStudentName: 'Test Student',
        quizName: null,
        onClick: vi.fn(),
      },
      assignedStudentFlashcardsProps: {
        studentFlashcards: createMockFlashcardList()(2),
        isLoading: false,
        error: null,
        targetName: 'Test Student',
        lessonPopup: {
          lessonsByVocabulary: [],
          lessonsLoading: false,
        },
      },
      assigningError: null,
    });

    render(
      <MockAllProviders>
        <ExampleAssigner />
      </MockAllProviders>,
    );

    expect(screen.getByText('Assign Examples')).toBeInTheDocument();
    expect(screen.getByText('Quiz Assignment')).toBeInTheDocument();
  });

  it('should show student assignment selector when in student mode', () => {
    const examples = createMockExampleWithVocabularyList(2);

    overrideMockUseExampleAssigner({
      selectedExamples: examples,
      isFetchingSelectedExamples: false,
      assignmentTypeSelectorProps: {
        assignmentType: 'students',
        onTypeChange: vi.fn(),
      },
      studentSelectionProps: {
        isLoading: false,
      },
      quizSelectionProps: {
        selectedQuizGroupId: undefined,
        onQuizGroupIdChange: vi.fn(),
        selectedQuizRecordId: undefined,
        onQuizRecordIdChange: vi.fn(),
        availableQuizzes: undefined,
        quizGroupOptions: [],
      },
      unassignedExamplesProps: { examples },
      assignedStudentFlashcardsProps: {
        studentFlashcards: createMockFlashcardList()(2),
        isLoading: false,
        error: null,
        targetName: 'Test Student',
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
        onTypeChange: vi.fn(),
      },
      studentSelectionProps: {
        isLoading: false,
      },
      quizSelectionProps: {
        selectedQuizGroupId: 1,
        onQuizGroupIdChange: vi.fn(),
        selectedQuizRecordId: 1,
        onQuizRecordIdChange: vi.fn(),
        availableQuizzes: [
          {
            id: 1,
            published: true,
            quizTitle: 'Quiz 1',
            quizNumber: 1,
            relatedQuizGroupId: 1,
          },
        ],
        quizGroupOptions: [
          {
            id: 1,
            name: 'Spanish 101',
          },
          {
            id: 2,
            name: 'Spanish 102',
          },
        ],
      },
      unassignedExamplesProps: { examples },
      assignedStudentFlashcardsProps: {
        studentFlashcards: createMockFlashcardList()(2),
        isLoading: false,
        error: null,
        targetName: 'Test Student',
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

    expect(screen.getByText('Quiz Group:')).toBeInTheDocument();
    expect(screen.getByText('Quiz:')).toBeInTheDocument();
  });

  it('should open modal when assign button is clicked', () => {
    const examples = createMockExampleWithVocabularyList(3);
    const assignExamplesMock = vi.fn(async () => Promise.resolve());

    overrideMockUseExampleAssigner({
      selectedExamples: examples,
      isFetchingSelectedExamples: false,
      assignmentTypeSelectorProps: {
        assignmentType: 'students',
        onTypeChange: vi.fn(),
      },
      studentSelectionProps: {
        isLoading: false,
      },
      quizSelectionProps: {
        selectedQuizGroupId: undefined,
        onQuizGroupIdChange: vi.fn(),
        selectedQuizRecordId: undefined,
        onQuizRecordIdChange: vi.fn(),
        availableQuizzes: undefined,
        quizGroupOptions: [],
      },
      assignedStudentFlashcardsProps: {
        studentFlashcards: createMockFlashcardList()(2),
        isLoading: false,
        error: null,
        targetName: 'Test Student',
        lessonPopup: {
          lessonsByVocabulary: [],
          lessonsLoading: false,
        },
      },
      unassignedExamplesProps: { examples },
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
        onTypeChange: vi.fn(),
      },
      studentSelectionProps: {
        isLoading: false,
      },
      assignedStudentFlashcardsProps: {
        studentFlashcards: createMockFlashcardList()(2),
        isLoading: false,
        error: null,
        targetName: 'Test Student',
        lessonPopup: {
          lessonsByVocabulary: [],
          lessonsLoading: false,
        },
      },
      quizSelectionProps: {
        selectedQuizGroupId: undefined,
        onQuizGroupIdChange: vi.fn(),
        selectedQuizRecordId: undefined,
        onQuizRecordIdChange: vi.fn(),
        availableQuizzes: undefined,
        quizGroupOptions: [],
      },
      unassignedExamplesProps: { examples },
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
