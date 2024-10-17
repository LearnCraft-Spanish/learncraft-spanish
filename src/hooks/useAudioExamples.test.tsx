import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import MockAllProviders from "../../mocks/Providers/MockAllProviders";
import { useAudioExamples } from "./useAudioExamples";

interface WrapperProps {
  children: React.ReactNode;
}
vi.unmock("./useUserData");
vi.mock("./useUserData", () => ({
  useUserData: vi.fn(() => ({
    isSuccess: true,
  })),
}));

describe("useAudioExamples", () => {
  const wrapper = ({ children }: WrapperProps) => (
    <MockAllProviders>{children}</MockAllProviders>
  );
  it("runs without crashing", async () => {
    const { result } = renderHook(() => useAudioExamples(), { wrapper });
    await waitFor(() => {
      expect(result.current.audioExamplesQuery.isSuccess).toBe(true);
    });
    expect(result.current.audioExamplesQuery.data).toBeDefined();
  });

  it("data length is greater than 0", async () => {
    const { result } = renderHook(() => useAudioExamples(), { wrapper });
    await waitFor(() => {
      expect(result.current.audioExamplesQuery.isSuccess).toBe(true);
    });
    expect(result.current.audioExamplesQuery.data?.length).toBeGreaterThan(0);
  });

  it("each example has englishAudio & spanishAudio", async () => {
    const { result } = renderHook(() => useAudioExamples(), { wrapper });
    await waitFor(() => {
      expect(result.current.audioExamplesQuery.isSuccess).toBe(true);
    });
    result.current.audioExamplesQuery.data?.forEach((example) => {
      expect(example.englishAudio).toBeDefined();
      expect(example.spanishAudioLa).toBeDefined();
    });
  });
});
