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

    it('should not go beyond last example', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.exampleNumber).toBe(1);
      expect(result.current.quizLength).toBe(3);

      // Navigate step by step to understand the behavior
      act(() => {
        result.current.nextExample(); // Should go to 2
      });
      expect(result.current.exampleNumber).toBe(2);

      act(() => {
        result.current.nextExample(); // Should go to 3
      });
      expect(result.current.exampleNumber).toBe(3);

      // Try to go beyond - should stay at 3
      act(() => {
        result.current.nextExample();
      });
      expect(result.current.exampleNumber).toBe(3); // Should stay at last
    });

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
    it('should create correct question and answer for English->Spanish', () => {
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

    it('should create correct question and answer for Spanish->English', () => {
      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: true,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      const quizExample = result.current.quizExample;
      expect(quizExample).not.toBeNull();
      expect(quizExample!.question.spanish).toBe(true);
      expect(quizExample!.question.text).toBe(mockExamples[0].spanish);
      expect(quizExample!.answer.spanish).toBe(false);
      expect(quizExample!.answer.text).toBe(mockExamples[0].english);
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
    it('should correctly identify collected examples', () => {
      const mockIsExampleCollected = vi.fn().mockReturnValue(true);

      overrideMockUseStudentFlashcards({
        isExampleCollected: mockIsExampleCollected,
      });

      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.quizExample!.exampleIsCollected).toBe(true);
      expect(result.current.quizExample!.answer.owned).toBe(true);
    });

    it('should correctly identify custom flashcards', () => {
      const mockIsCustomFlashcard = vi.fn().mockReturnValue(true);

      overrideMockUseStudentFlashcards({
        isCustomFlashcard: mockIsCustomFlashcard,
      });

      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.quizExample!.exampleIsCustom).toBe(true);
    });

    it('should correctly identify adding flashcards', () => {
      const mockIsAddingFlashcard = vi.fn().mockReturnValue(true);

      overrideMockUseStudentFlashcards({
        isAddingFlashcard: mockIsAddingFlashcard,
      });

      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.quizExample!.exampleIsAdding).toBe(true);
    });
    it('should correctly identify removing flashcards', () => {
      const mockIsRemovingFlashcard = vi.fn().mockReturnValue(true);

      overrideMockUseStudentFlashcards({
        isRemovingFlashcard: mockIsRemovingFlashcard,
      });

      const { result } = renderHook(() =>
        useTextQuiz({
          examples: mockExamples,
          startWithSpanish: false,
          cleanupFunction: mockCleanupFunction,
        }),
      );

      expect(result.current.quizExample!.exampleIsRemoving).toBe(true);
    });
  });
});
