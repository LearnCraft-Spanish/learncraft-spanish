import { useCustomQuizSettingsState } from '@application/units/CustomQuiz/useCustomQuizSettingsState';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useCustomQuizSettingsState', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useCustomQuizSettingsState());
    expect(result.current.quizLength).toBe(20);
    expect(result.current.spanishFirst).toBe(false);
    expect(result.current.audioOnly).toBe(false);
  });

  it('updates quizLength when setQuizLength is called', () => {
    const { result } = renderHook(() => useCustomQuizSettingsState());
    act(() => {
      result.current.setQuizLength(50);
    });
    expect(result.current.quizLength).toBe(50);
  });

  it('updates spanishFirst when setSpanishFirst is called', () => {
    const { result } = renderHook(() => useCustomQuizSettingsState());
    act(() => {
      result.current.setSpanishFirst(true);
    });
    expect(result.current.spanishFirst).toBe(true);
  });

  it('updates audioOnly when setAudioOnly is called', () => {
    const { result } = renderHook(() => useCustomQuizSettingsState());
    act(() => {
      result.current.setAudioOnly(true);
    });
    expect(result.current.audioOnly).toBe(true);
  });
});
