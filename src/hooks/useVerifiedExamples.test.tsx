import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import type { WrapperProps } from "../../src/interfaceDefinitions";

import serverlikeData from "../../mocks/data/serverlike/serverlikeData";
import MockAllProviders from "../../mocks/Providers/MockAllProviders";
import { useVerifiedExamples } from "./useVerifiedExamples";

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

describe("useVerifiedExamples", () => {
  const wrapper = ({ children }: WrapperProps) => (
    <MockAllProviders>{children}</MockAllProviders>
  );

  it("runs without crashing", async () => {
    const { result } = renderHook(() => useVerifiedExamples(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it("data has length", async () => {
    const { result } = renderHook(() => useVerifiedExamples(), { wrapper });
    await waitFor(() => expect(result.current.data?.length).toBeGreaterThan(0));
  });
});
