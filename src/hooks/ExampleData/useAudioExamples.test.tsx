import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { useAudioExamples } from 'src/hooks/ExampleData/useAudioExamples';
import MockAllProviders from 'mocks/Providers/MockAllProviders';

describe('useAudioExamples', () => {
  it('runs without crashing', async () => {
    const { result } = renderHook(() => useAudioExamples(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current.audioExamplesQuery.isSuccess).toBe(true);
    });
    expect(result.current.audioExamplesQuery.data).toBeDefined();
  });

  it('data length is greater than 0', async () => {
    const { result } = renderHook(() => useAudioExamples(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current.audioExamplesQuery.isSuccess).toBe(true);
    });
    expect(result.current.audioExamplesQuery.data?.length).toBeGreaterThan(0);
  });

  it('each example has englishAudio & spanishAudio', async () => {
    const { result } = renderHook(() => useAudioExamples(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current.audioExamplesQuery.isSuccess).toBe(true);
    });
    result.current.audioExamplesQuery.data?.forEach((example) => {
      expect(example.englishAudio).toBeDefined();
      expect(example.spanishAudioLa).toBeDefined();
    });
  });
});
