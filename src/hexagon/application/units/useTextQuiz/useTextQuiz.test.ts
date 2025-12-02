import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { overrideMockUseStudentFlashcards } from '@application/units/useStudentFlashcards.mock';
import { useTextQuiz } from '@application/units/useTextQuiz/useTextQuiz';
import { act, renderHook } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useTextQuiz', () => {
  const mockCleanupFunction = vi.fn();
  const mockExamples: ExampleWithVocabulary[] =
    createMockExampleWithVocabularyList()(3);

  beforeEach(() => {
    mockCleanupFunction.mockClear();

    // Mock auth adapter - default to student
    overrideMockAuthAdapter({
      isStudent: true,
      isAuthenticated: true,
    });

    // Mock student flashcards with sensible defaults
    overrideMockUseStudentFlashcards({
      isExampleCollected: vi.fn().mockReturnValue(false),
      createFlashcards: vi.fn().mockResolvedValue([]),
      deleteFlashcards: vi.fn().mockResolvedValue(1),
      isCustomFlashcard: vi.fn().mockReturnValue(false),
      isPendingFlashcard: vi.fn().mockReturnValue(false),
    });
  });

  describe('initialization', () => {
    it('should initialize with first example and correct quiz length', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.exampleNumber).toBe(1);
      expect(result.current.quizLength).toBe(3);
      expect(result.current.currentExample).toBe(mockExamples[0]);
    });

    it('should handle null examples gracefully', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: null,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.exampleNumber).toBe(0);
      expect(result.current.quizLength).toBe(0);
      expect(result.current.currentExample).toBeNull();
      expect(result.current.quizExample).toBeNull();
    });

    it('should handle empty examples array', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: [],
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.exampleNumber).toBe(0);
      expect(result.current.quizLength).toBe(0);
      expect(result.current.currentExample).toBeNull();
    });
  });

  describe('navigation', () => {
    it('should navigate to next example', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.exampleNumber).toBe(1);

      act(() => {
        result.current.nextExample();
      });

      expect(result.current.exampleNumber).toBe(2);
      expect(result.current.currentExample).toBe(mockExamples[1]);
    });

    it('should navigate to previous example', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      // Go to second example first
      act(() => {
        result.current.nextExample();
      });

      expect(result.current.exampleNumber).toBe(2);

      // Then go back
      act(() => {
        result.current.previousExample();
      });

      expect(result.current.exampleNumber).toBe(1);
      expect(result.current.currentExample).toBe(mockExamples[0]);
    });

    // Note: "not go beyond last example" behavior is covered in 'quiz completion and restart' section
    // which also tests the isQuizComplete flag being set

    it('should not go before first example', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.exampleNumber).toBe(1);

      // Try to go before first
      act(() => {
        result.current.previousExample();
      });

      expect(result.current.exampleNumber).toBe(1); // Should stay at first
    });
  });

  describe('quiz display logic', () => {
    it('should create correct question and answer for start with english', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      const quizExample = result.current.quizExample;
      expect(quizExample).not.toBeNull();
      expect(quizExample!.question.spanish).toBe(false);
      expect(quizExample!.question.text).toBe(mockExamples[0].english);
      expect(quizExample!.answer.spanish).toBe(true);
      expect(quizExample!.answer.text).toBe(mockExamples[0].spanish);
    });

    it('should include vocabulary information in answer', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      const quizExample = result.current.quizExample;
      expect(quizExample!.answer.vocabulary).toBe(mockExamples[0].vocabulary);
      expect(quizExample!.answer.vocabComplete).toBe(
        mockExamples[0].vocabularyComplete,
      );
    });
  });

  describe('flashcard management for students', () => {
    it('should provide add/remove props for students', () => {
      overrideMockAuthAdapter({ isStudent: true });

      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.addPendingRemoveProps).toBeDefined();
    });

    it('should not provide add/remove props for non-students', () => {
      overrideMockAuthAdapter({ isStudent: false });

      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.addPendingRemoveProps).toBeUndefined();
    });

    it('should call createFlashcards when adding flashcard', () => {
      const mockCreateFlashcards = vi.fn().mockResolvedValue([]);
      const mockIsExampleCollected = vi.fn().mockReturnValue(false);

      overrideMockUseStudentFlashcards({
        createFlashcards: mockCreateFlashcards,
        isExampleCollected: mockIsExampleCollected,
      });

      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      act(() => {
        result.current.addPendingRemoveProps!.addFlashcard();
      });

      expect(mockCreateFlashcards).toHaveBeenCalledWith([mockExamples[0]]);
    });

    it('should call deleteFlashcards when removing flashcard', () => {
      const mockDeleteFlashcards = vi.fn().mockResolvedValue(1);
      const mockIsExampleCollected = vi.fn().mockReturnValue(true);

      overrideMockUseStudentFlashcards({
        deleteFlashcards: mockDeleteFlashcards,
        isExampleCollected: mockIsExampleCollected,
      });

      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      act(() => {
        result.current.addPendingRemoveProps!.removeFlashcard();
      });

      expect(mockDeleteFlashcards).toHaveBeenCalledWith([mockExamples[0].id]);
    });

    it('should not add flashcard if already collected', () => {
      const mockCreateFlashcards = vi.fn().mockResolvedValue([]);
      const mockIsExampleCollected = vi.fn().mockReturnValue(true); // Already collected

      overrideMockUseStudentFlashcards({
        createFlashcards: mockCreateFlashcards,
        isExampleCollected: mockIsExampleCollected,
      });

      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      act(() => {
        result.current.addPendingRemoveProps!.addFlashcard();
      });

      expect(mockCreateFlashcards).not.toHaveBeenCalled();
    });

    it('should not remove flashcard if not collected', () => {
      const mockDeleteFlashcards = vi.fn().mockResolvedValue(1);
      const mockIsExampleCollected = vi.fn().mockReturnValue(false); // Not collected

      overrideMockUseStudentFlashcards({
        deleteFlashcards: mockDeleteFlashcards,
        isExampleCollected: mockIsExampleCollected,
      });

      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      act(() => {
        result.current.addPendingRemoveProps!.removeFlashcard();
      });

      expect(mockDeleteFlashcards).not.toHaveBeenCalled();
    });
  });

  describe('flashcard status', () => {
    // Consolidated: Tests all flashcard status flags in one test
    it('should correctly pass through all flashcard status flags', () => {
      overrideMockUseStudentFlashcards({
        isExampleCollected: vi.fn().mockReturnValue(true),
        isCustomFlashcard: vi.fn().mockReturnValue(true),
        isAddingFlashcard: vi.fn().mockReturnValue(true),
        isRemovingFlashcard: vi.fn().mockReturnValue(true),
      });

      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.quizExample!.exampleIsCollected).toBe(true);
      expect(result.current.quizExample!.exampleIsCustom).toBe(true);
      expect(result.current.quizExample!.exampleIsAdding).toBe(true);
      expect(result.current.quizExample!.exampleIsRemoving).toBe(true);
      expect(result.current.quizExample!.answer.owned).toBe(true);
    });
  });

  describe('quiz completion and restart', () => {
    it('should set isQuizComplete when navigating past last example', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.isQuizComplete).toBe(false);

      // Navigate to last example (each act for each state change)
      act(() => {
        result.current.nextExample();
      });
      act(() => {
        result.current.nextExample();
      });

      expect(result.current.exampleNumber).toBe(3);
      expect(result.current.isQuizComplete).toBe(false);

      // Try to go beyond - should mark complete
      act(() => {
        result.current.nextExample();
      });

      expect(result.current.isQuizComplete).toBe(true);
      expect(result.current.exampleNumber).toBe(3); // Index stays at last
    });

    it('should reset quiz state with restartQuiz', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      // Navigate to complete quiz
      act(() => {
        result.current.nextExample();
      });
      act(() => {
        result.current.nextExample();
      });
      act(() => {
        result.current.nextExample(); // Marks complete
      });

      expect(result.current.isQuizComplete).toBe(true);
      expect(result.current.exampleNumber).toBe(3);

      // Restart
      act(() => {
        result.current.restartQuiz();
      });

      expect(result.current.isQuizComplete).toBe(false);
      expect(result.current.exampleNumber).toBe(1);
      expect(result.current.currentExample).toBe(mockExamples[0]);
    });

    it('should reset isQuizComplete when navigating back', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      // Navigate to end and mark complete
      act(() => {
        result.current.nextExample();
      });
      act(() => {
        result.current.nextExample();
      });
      act(() => {
        result.current.nextExample();
      });

      expect(result.current.isQuizComplete).toBe(true);

      // Go back
      act(() => {
        result.current.previousExample();
      });

      expect(result.current.isQuizComplete).toBe(false);
    });
  });

  describe('answer and help state', () => {
    it('should toggle answer visibility', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.answerShowing).toBe(false);

      act(() => {
        result.current.toggleAnswer();
      });

      expect(result.current.answerShowing).toBe(true);

      act(() => {
        result.current.toggleAnswer();
      });

      expect(result.current.answerShowing).toBe(false);
    });

    it('should hide answer and close help when navigating', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      // Show answer and open help
      act(() => {
        result.current.toggleAnswer();
        result.current.setGetHelpIsOpen(true);
      });

      expect(result.current.answerShowing).toBe(true);
      expect(result.current.getHelpIsOpen).toBe(true);

      // Navigate next - should reset both
      act(() => {
        result.current.nextExample();
      });

      expect(result.current.answerShowing).toBe(false);
      expect(result.current.getHelpIsOpen).toBe(false);

      // Show again and go previous
      act(() => {
        result.current.toggleAnswer();
        result.current.setGetHelpIsOpen(true);
      });

      act(() => {
        result.current.previousExample();
      });

      expect(result.current.answerShowing).toBe(false);
      expect(result.current.getHelpIsOpen).toBe(false);
    });
  });
});
