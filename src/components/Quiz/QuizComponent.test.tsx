import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";

import { afterEach, describe, expect, it, vi } from "vitest";
import { sampleStudentFlashcardData } from "../../../tests/mockData";

import MockAllProviders from "../../../mocks/Providers/MockAllProviders";
import Quiz from "./QuizComponent";

const cleanupFunction = vi.fn();

// vi.mock('../hooks/useStudentFlashcards', () => {
//   return {
//     useStudentFlashcards: () => ({
//       flashcardDataQuery: { data: sampleStudentFlashcardData },
//       exampleIsCollected: { data: vi.fn(() => false) },
//     }),
//   }
// })
/*
  quizTitle,
  examplesToParse,
  startWithSpanish = false,
  quizOnlyCollectedExamples = false,
  isSrsQuiz = false,
  cleanupFunction,
  quizLength = 1000,
  */
function renderQuizNoSrs() {
  render(
    <MockAllProviders>
      <Quiz
        quizTitle="Test Quiz"
        examplesToParse={sampleStudentFlashcardData.examples}
        // startWithSpanish={false}
        // quizOnlyCollectedExamples={false}
        // isSrsQuiz={false}
        cleanupFunction={cleanupFunction}
        // quizLength={1000}
      />
    </MockAllProviders>,
  );
}
function renderQuizYesSrs({ params }: any = {}) {
  render(
    <MockAllProviders>
      <Quiz
        quizTitle="Test Quiz"
        examplesToParse={sampleStudentFlashcardData.examples}
        quizOnlyCollectedExamples
        isSrsQuiz
        cleanupFunction={cleanupFunction}
        {...params}
      />
    </MockAllProviders>,
  );
}

describe("component Quiz", () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });
  describe("isSrsQuiz is false", () => {
    it("renders", () => {
      const quizTitle = "Test Quiz";
      renderQuizNoSrs();
      // expect a div with class="quiz"
      expect(screen.getByText(quizTitle)).toBeTruthy();
    });

    it("calls cleanupFunction on unmount", () => {
      renderQuizNoSrs();
      act(() => {
        screen.getByText("Back").click();
      });
      expect(cleanupFunction).toHaveBeenCalledOnce();
    });

    it("changes flashcard on next button click", () => {
      renderQuizNoSrs();
      // Find the flashcard element
      // Get the initial text content of the flashcard
      const flashcard = screen.getByLabelText("flashcard");
      const initialText = flashcard.textContent;

      // Simulate a click on the flashcard
      act(() => {
        fireEvent.click(flashcard);
      });

      // Find the next button
      const nextButton = screen.getByRole("button", { name: "Next" });

      // Simulate a click on the next button
      act(() => {
        fireEvent.click(nextButton);
      });

      // Find the flashcard element again
      const flashcard2 = screen.getByLabelText("flashcard");

      // Assert that the flashcard text content has changed
      expect(flashcard2.textContent).not.toBe(initialText);
    });
    it("changes flashcard to previous on previous button click", async () => {
      renderQuizNoSrs();
      // Find the flashcard element
      const flashcard = screen.getByLabelText("flashcard");
      // Get the initial text content of the flashcard
      const initialText = flashcard.textContent;

      // Simulate a click on the flashcard
      act(() => {
        fireEvent.click(flashcard);
      });

      // Find the next button
      const nextButton = screen.getByRole("button", { name: "Next" });

      // Simulate a click on the next button
      act(() => {
        fireEvent.click(nextButton);
      });
      const flashcardNext = screen.getByLabelText("flashcard");
      const nextTest = flashcardNext.textContent;
      // Find the previous button
      const previousButton = screen.getByRole("button", { name: "Previous" });

      // Simulate a click on the previous button
      act(() => {
        fireEvent.click(previousButton);
      });
      await waitFor(() => {
        // Find the flashcard element again
        const flashcardPrevious = screen.getByLabelText("flashcard");

        // Assert that the flashcard text content has changed
        expect(flashcardPrevious.textContent).toBe(initialText);
        expect(flashcardPrevious.textContent).not.toBe(nextTest);
      });
    });
  });

  describe.skip("isSrsQuiz is true", () => {
    it("renders SrsButtons when isSrsQuiz is true", async () => {
      renderQuizYesSrs();
      await waitFor(() => {
        expect(screen.getByLabelText("flashcard")).toBeInTheDocument();
      });

      const flashcard = screen.getByLabelText("flashcard");
      act(() => {
        fireEvent.click(flashcard);
      });

      await waitFor(() => {
        const hardBtn = screen.getByText(/"this was hard"/i);
        const easyBtn = screen.getByText(/this was easy/i);

        expect(hardBtn).toBeInTheDocument();
        expect(easyBtn).toBeInTheDocument();
      });
    });
  });
});
