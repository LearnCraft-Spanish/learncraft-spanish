import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import MockQueryClientProvider from "../../mocks/Providers/MockQueryClient";
import { getUserDataFromName } from "../../mocks/data/serverlike/studentTable";

import { useUserData } from "./useUserData";

describe("useUserData", () => {
  it("runs without crashing", async () => {
    const { result } = renderHook(() => useUserData(), {
      wrapper: MockQueryClientProvider,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it("data is useAuth0 mock data", async () => {
    const { result } = renderHook(() => useUserData(), {
      wrapper: MockQueryClientProvider,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const user = getUserDataFromName("student-admin");
    expect(result.current.data).toEqual(user);
  });
});
