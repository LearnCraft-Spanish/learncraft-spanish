import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import serverlikeData from "../mocks/data/serverlike/serverlikeData";

import MockAllProviders from "../mocks/Providers/MockAllProviders";
import createMockAuth from "../mocks/hooks/useMockAuth";

import { useUserData } from "./hooks/useUserData";
import { useActiveStudent } from "./hooks/useActiveStudent";
import { useStudentFlashcards } from "./hooks/useStudentFlashcards";

import useAuth from "./hooks/useAuth";

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
  afterEach(async () => {
    vi.resetAllMocks();
    cleanup();
  });

  describe("case: Student non Admin", () => {
    beforeEach(async () => {
      const mockAuthRegularStudent = createMockAuth({
        isAuthenticated: true,
        isLoading: false,
        userName: "student-lcsp",
      });
      vi.mocked(useAuth).mockImplementation(() => mockAuthRegularStudent);
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
      const mockAuthLimitedStudent = createMockAuth({
        isAuthenticated: true,
        isLoading: false,
        userName: "limited",
      });
      vi.mocked(useAuth).mockImplementation(() => mockAuthLimitedStudent);
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
      const mockAuthNoneRole = createMockAuth({
        userName: "none-role",
        isAuthenticated: true,
        isLoading: false,
      });
      vi.mocked(useAuth).mockImplementation(() => mockAuthNoneRole);
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
    })
  });
});
