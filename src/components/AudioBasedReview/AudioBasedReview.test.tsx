import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import serverlikeData from "../../../mocks/data/serverlike/serverlikeData";
import AudioBasedReview from "./AudioBasedReview";
interface WrapperProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();
const wrapper = ({ children }: WrapperProps) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
const api = serverlikeData().api;
const studentAdmin = api.allStudentsTable.find(
  (student) => student.role === "student" && student.isAdmin === true,
);

vi.unmock("./useUserData");
vi.mock("./useUserData", () => ({
  useUserData: vi.fn(() => ({
    isSuccess: true,
    data: studentAdmin,
  })),
}));

describe("component AudioBasedReview", () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });
  describe('initial state', () => {
    it("while waiting for data, shows loading", async () => {
      render(
        <MemoryRouter>
          <AudioBasedReview willAutoplay={false} />
        </MemoryRouter>,
        { wrapper }
      );
      expect(screen.getByText('Loading Audio...')).toBeInTheDocument();
    });
    it("await data load, component renders", async() => {
      render(
        <MemoryRouter>
          <AudioBasedReview willAutoplay={false} />
        </MemoryRouter>,
        { wrapper }
      );
      await waitFor(() => expect(screen.getByText('From:')).toBeInTheDocument());

      expect(screen.getByText("Comprehension Quiz")).toBeInTheDocument();
    });
  })
});