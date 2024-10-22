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
import { getUserDataFromName } from "../../../mocks/data/serverlike/studentTable";
import allStudentFlashcards from "../../../mocks/data/hooklike/studentFlashcardData";

import MockAllProviders from "../../../mocks/Providers/MockAllProviders";
import Quiz from "./QuizComponent";

const cleanupFunction = vi.fn();

const user = getUserDataFromName("student-admin");
if (!user) {
  throw new Error(`Student not found in allStudentsTable: student-admin`);
}
const userFlashcardData = allStudentFlashcards.find(
  (student) => student.userName === user.name,
)?.studentFlashcardData;
if (!userFlashcardData) {
  throw new Error(`Student flashcard data not found: student-admin`);
}

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
  if (!userFlashcardData) {
    throw new Error(`Student flashcard data not found in test setup function`);
  }

  render(
    <MockAllProviders>
      <Quiz
        quizTitle="Test Quiz"
        examplesToParse={userFlashcardData.examples}
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
  if (!userFlashcardData) {
    throw new Error(`Student flashcard data not found in test setup function`);
  }

  render(
    <MockAllProviders>
      <Quiz
        quizTitle="Test Quiz"
        examplesToParse={userFlashcardData.examples}
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
      // const flashcard = screen.getByLabelText("flashcard");
      // const initialText = flashcard.textContent;
      // // Simulate a click on the flashcard
      // act(() => {
      //   fireEvent.click(flashcard);
      // });
      const initialFlashcardText = screen.getByLabelText("flashcard").textContent;

      // Find the next button
      const nextButton = screen.getByRole("button", { name: "Next" });

      // Simulate a click on the next button
      act(() => {
        fireEvent.click(nextButton);
      });

      // Find the flashcard element again
      // const flashcard2 = screen.getByLabelText("flashcard");
      const nextFlashcardText =  screen.getByLabelText("flashcard").textContent;

      // Assert that the flashcard text content has changed
      // expect(flashcard2.textContent).not.toBe(initialText);
      expect(nextFlashcardText).not.toBe(initialFlashcardText);
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

  describe("isSrsQuiz is true", () => {
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
        expect(screen.getByText(/this was hard/i)).toBeInTheDocument();
        expect(screen.queryByText(/this was easy/i)).toBeInTheDocument();
      });
    });
  });
});
