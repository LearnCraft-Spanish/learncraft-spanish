import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import MockAllProviders from "../mocks/Providers/MockAllProviders";
import { setupMockAuth } from "../tests/setupMockAuth";

import Menu from "./Menu";

/*
Things to test:
menuDataError + userDataQuery.isSuccess
- Error Loading Menu
menuDataLoading + userDataQuery.isSuccess
- Loading Menu...

menuDataReady
- Quizzing Tools
  - official Quizzes

at least limited
- audio QUiz, COmplrehensio Quiz

student or admin
- find flashcards

activeStudentQuery.data?.role === "student" && !!flashcardDataQuery.data?.studentExamples?.length
- My Flashcards:
  - Quiz My Flashcards
  - Manage My Flashcards


userDataQuery.data.isAdmin
- Staff Tools 
  - (currently only FrequenSay)
*/
// ------------------------------------------------------------------------------------------------------------------

describe("component Menu", () => {
  describe("case: Student non Admin", () => {
    beforeEach(async () => {
      setupMockAuth({
        isAuthenticated: true,
        isLoading: false,
        userName: "student-lcsp",
      });
    });

    it('render "My Flashcards" section', async () => {
      render(
        <MockAllProviders>
          <Menu />
        </MockAllProviders>,
      );
      // wait for the menu to load
      await waitFor(() => {
        expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
      });

      expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
    });

    it('does NOT render "Staff Tools" section', async () => {
      render(
        <MockAllProviders>
          <Menu />
        </MockAllProviders>,
      );
      // wait for the menu to load
      await waitFor(() => {
        expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
      });

      expect(screen.queryByText("Staff Tools")).toBeNull();
    });
  });

  describe("case: Limited Student", () => {
    beforeEach(() => {
      setupMockAuth({
        isAuthenticated: true,
        isLoading: false,
        userName: "limited",
      });
    });

    it("render Audio Quiz and Comprehension Quiz", async () => {
      render(
        <MockAllProviders>
          <Menu />
        </MockAllProviders>,
      );
      // wait for the menu to load
      await waitFor(() => {
        expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
      });

      expect(screen.getByText("Audio Quiz")).toBeInTheDocument();
      expect(screen.getByText("Comprehension Quiz")).toBeInTheDocument();
    });

    it('does NOT render "My Flashcards:" section', async () => {
      render(
        <MockAllProviders>
          <Menu />
        </MockAllProviders>,
      );
      // wait for the menu to load
      await waitFor(() => {
        expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
      });

      expect(screen.queryByText("My Flashcards:")).toBeNull();
    });
  });

  describe("case: none role", () => {
    beforeEach(() => {
      setupMockAuth({
        userName: "none-role",
        isAuthenticated: true,
        isLoading: false,
      });
    });

    it("render Official Quizzes", async () => {
      render(
        <MockAllProviders>
          <Menu />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
      });
      expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
    });

    it('does NOT render "My Flashcards:" section', async () => {
      render(
        <MockAllProviders>
          <Menu />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
      });
      expect(screen.queryByText("My Flashcards:")).toBeNull();
    });

    it('does NOT render "Audio Quiz" and "Comprehension Quiz"', async () => {
      render(
        <MockAllProviders>
          <Menu />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
      });
      expect(screen.queryByText("Audio Quiz")).toBeNull();
      expect(screen.queryByText("Comprehension Quiz")).toBeNull();
    });

    it('does NOT render "Staff Tools" section', async () => {
      render(
        <MockAllProviders>
          <Menu />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
      });
      expect(screen.queryByText("Staff Tools")).toBeNull();
    });
  });
});
