import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import MockAllProviders from "../mocks/Providers/MockAllProviders";
import { setupMockAuth } from "../tests/setupMockAuth";

import Menu from "./Menu";

// Helper Functions
async function renderMenuLoaded() {
  render(
    <MockAllProviders>
      <Menu />
    </MockAllProviders>,
  );
  // wait for the menu to load
  await waitFor(() => {
    expect(screen.queryByText("Official Quizzes")).toBeInTheDocument();
  });
}

describe("component Menu", () => {
  describe('isLoading', () => {
    beforeEach(() => {
      setupMockAuth({isLoading: true});
    });
    it('render "Loading Menu..."', async () => {
      render(
        <MockAllProviders>
          <Menu />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText("Loading Menu...")).toBeInTheDocument();
      });
      expect(screen.getByText("Loading Menu...")).toBeInTheDocument();

    });
  });

  describe("case: Student non Admin", () => {
    beforeEach(async () => {
      setupMockAuth({userName: "student-lcsp"});
    });

    it('render "My Flashcards" section', async () => {
      await renderMenuLoaded();
      expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
    });

    it('does NOT render "Staff Tools" section', async () => {
      await renderMenuLoaded()
      expect(screen.queryByText("Staff Tools")).toBeNull();
    });
  });

  describe("case: Limited Student", () => {
    beforeEach(() => {
      setupMockAuth({userName: "limited",});
    });

    it("render Audio Quiz and Comprehension Quiz", async () => {
      await renderMenuLoaded();
      expect(screen.getByText("Audio Quiz")).toBeInTheDocument();
      expect(screen.getByText("Comprehension Quiz")).toBeInTheDocument();
    });

    it('does NOT render "My Flashcards:" section', async () => {
      await renderMenuLoaded();
      expect(screen.queryByText("My Flashcards:")).toBeNull();
    });
  });

  describe("case: none role", () => {
    beforeEach(() => {
      setupMockAuth({userName: "none-role",});
    });

    it("render Official Quizzes", async () => {
      await renderMenuLoaded();
      expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
    });

    it('does NOT render "My Flashcards:" section', async () => {
      await renderMenuLoaded();
      expect(screen.queryByText("My Flashcards:")).toBeNull();
    });

    it('does NOT render "Audio Quiz" and "Comprehension Quiz"', async () => {
      await renderMenuLoaded();
      expect(screen.queryByText("Audio Quiz")).toBeNull();
      expect(screen.queryByText("Comprehension Quiz")).toBeNull();
    });

    it('does NOT render "Staff Tools" section', async () => {
      await renderMenuLoaded();
      expect(screen.queryByText("Staff Tools")).toBeNull();
    });
  });

  describe("case: empty role", () => {
    beforeEach(() => {
      setupMockAuth({userName: "empty-role",});
    });

    it("render Official Quizzes", async () => {
      await renderMenuLoaded();
      expect(screen.getByText("Official Quizzes")).toBeInTheDocument();
    });

    it('does NOT render "My Flashcards:" section', async () => {
      await renderMenuLoaded();
      expect(screen.queryByText("My Flashcards:")).toBeNull();
    });

    it('does NOT render "Audio Quiz" and "Comprehension Quiz"', async () => {
      await renderMenuLoaded();
      expect(screen.queryByText("Audio Quiz")).toBeNull();
      expect(screen.queryByText("Comprehension Quiz")).toBeNull();
    });

    it('does NOT render "Staff Tools" section', async () => {
      await renderMenuLoaded();
      expect(screen.queryByText("Staff Tools")).toBeNull();
    });
  });

  describe("case: Admin student", () => {
    beforeEach(() => {
      setupMockAuth({userName: "student-admin",});
    });

    it("does render My Flashcards", async () => {
      await renderMenuLoaded();
      expect(screen.getByText("My Flashcards:")).toBeInTheDocument();
    });
    
    it("doees render manage my flashcards", async () => {
      await renderMenuLoaded();
      expect(screen.getByText("Manage My Flashcards")).toBeInTheDocument();
    });

    it("does render Find Flashcards", async () => {
      await renderMenuLoaded();
      expect(screen.getByText("Find Flashcards")).toBeInTheDocument();
    });

    it('does render "Staff Tools" section', async () => {
      await renderMenuLoaded();
      expect(screen.queryByText("Staff Tools")).toBeInTheDocument();
    });
  });

  describe("case: Admin empty role", () => {
    beforeEach(() => {
      setupMockAuth({userName: "admin-empty-role",});
    });

    it("does render Find Flashcards", async () => {
      await renderMenuLoaded();
      expect(screen.getByText("Find Flashcards")).toBeInTheDocument();
    });

    it('does render "Staff Tools" section', async () => {
      await renderMenuLoaded();
      expect(screen.queryByText("Staff Tools")).toBeInTheDocument();
    });

    it("does NOT render My Flashcards", async () => {
      await renderMenuLoaded();
      expect(screen.queryByText("My Flashcards")).toBeNull();
    });

    it("does NOT render manage my flashcards", async () => {
      await renderMenuLoaded();
      expect(screen.queryByText("Manage My Flashcards")).toBeNull();
    });
  });
});
