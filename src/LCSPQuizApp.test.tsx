import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { aw } from "vitest/dist/chunks/reporters.DAfKSDh5";
import MockAllProviders from "../mocks/Providers/MockAllProviders";
import { setupMockAuth } from "../tests/setupMockAuth";
import LCSPQuizApp from "./LCSPQuizApp";

describe("official quiz component", () => {
  it("renders the title", async () => {
    render(
      <MockAllProviders>
        <LCSPQuizApp />
      </MockAllProviders>
    );

    await waitFor(() => {
      expect(screen.getByText(/official quizzes/i)).toBeInTheDocument();
    });
  });

  it("shows two menus", async () => {
    render(
      <MockAllProviders>
        <LCSPQuizApp />
      </MockAllProviders>
    );

    await waitFor(() => {
      expect(screen.getAllByRole("select")).toHaveLength(2);
    });
  });

  it("shows start button", async () => {
    render(
      <MockAllProviders>
        <LCSPQuizApp />
      </MockAllProviders>
    );

    await waitFor(() => {
      expect(screen.getByText(/begin review/i)).toBeInTheDocument();
    });
  });

  it("shows menu button", async () => {
    render(
      <MockAllProviders>
        <LCSPQuizApp />
      </MockAllProviders>
    );

    await waitFor(() => {
      expect(screen.getByText(/back to menu/i)).toBeInTheDocument();
    });
  });

  describe("my flashcards quiz", () => {
    it("shows a flashcard after clicking start", async () => {
      render(
        <MockAllProviders>
          <LCSPQuizApp />
        </MockAllProviders>
      );

      const startButton = await waitFor(() =>
        screen.getByText(/begin review/i)
      );
      await act(async () => {
        startButton.click();
      });
      const flashcard = await waitFor(() =>
        screen.getByLabelText(/flashcard/i)
      );
      await waitFor(() => {
        expect(flashcard).toBeInTheDocument();
      });
    });
  });
});
