import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import MockAllProviders from "../../mocks/Providers/MockAllProviders";

import { useVocabulary } from "./useVocabulary";

describe("useVocabulary", () => {
  it("runs without crashing", async () => {
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current.vocabularyQuery.isSuccess).toBe(true);
    });
    expect(result.current.vocabularyQuery.data).toBeDefined();
  });

  it("vocabularyQuery data has length", async () => {
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current.vocabularyQuery.isSuccess).toBe(true);
    });
    expect(result.current.vocabularyQuery.data?.length).toBeGreaterThan(0);
  });
});
