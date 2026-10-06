import { useCustomQuizSettingsState } from '@application/units/CustomQuiz/useCustomQuizSettingsState';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useCustomQuizSettingsState', () => {
  it('starts at 20 cards, Spanish second, and audio off', () => {
    const { result } = renderHook(() => useCustomQuizSettingsState());

    expect(result.current.quizLength).toBe(20);
    expect(result.current.spanishFirst).toBe(false);
    expect(result.current.audioOnly).toBe(false);
  });

  it('updates each setting without changing the others', () => {
    const { result } = renderHook(() => useCustomQuizSettingsState());

    act(() => {
      result.current.setQuizLength(7);
    });
    expect(result.current.quizLength).toBe(7);
    expect(result.current.spanishFirst).toBe(false);
    expect(result.current.audioOnly).toBe(false);

    act(() => {
      result.current.setSpanishFirst(true);
    });
    expect(result.current.spanishFirst).toBe(true);
    expect(result.current.quizLength).toBe(7);
    expect(result.current.audioOnly).toBe(false);

    act(() => {
      result.current.setAudioOnly(true);
    });
    expect(result.current.audioOnly).toBe(true);
    expect(result.current.spanishFirst).toBe(true);
    expect(result.current.quizLength).toBe(7);

    act(() => {
      result.current.setQuizLength(20);
      result.current.setSpanishFirst(false);
      result.current.setAudioOnly(false);
    });
    expect(result.current.quizLength).toBe(20);
    expect(result.current.spanishFirst).toBe(false);
    expect(result.current.audioOnly).toBe(false);
  });
});
