import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import MockAllProviders from "../../mocks/Providers/MockAllProviders";
import { useVerifiedExamples } from "./useVerifiedExamples";

describe("useVerifiedExamples", () => {
  it("runs without crashing", async () => {
    const { result } = renderHook(() => useVerifiedExamples(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it("data has length", async () => {
    const { result } = renderHook(() => useVerifiedExamples(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => expect(result.current.data?.length).toBeGreaterThan(0));
  });
});
