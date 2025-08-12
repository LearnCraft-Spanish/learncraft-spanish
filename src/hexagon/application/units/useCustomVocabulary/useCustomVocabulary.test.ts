import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useCustomVocabulary from './useCustomVocabulary';

describe('useCustomVocabulary', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCustomVocabulary());

    expect(result.current.addManualVocabulary).toBe(false);
    expect(result.current.userAddedVocabulary).toBe('');
    expect(typeof result.current.enableManualVocabulary).toBe('function');
    expect(typeof result.current.disableManualVocabulary).toBe('function');
    expect(typeof result.current.setUserAddedVocabulary).toBe('function');
  });

  it('should enable manual vocabulary when enableManualVocabulary is called', () => {
    const { result } = renderHook(() => useCustomVocabulary());

    act(() => {
      result.current.enableManualVocabulary();
    });

    expect(result.current.addManualVocabulary).toBe(true);
  });

  it('should disable manual vocabulary when disableManualVocabulary is called', () => {
    const { result } = renderHook(() => useCustomVocabulary());

    // First enable it
    act(() => {
      result.current.enableManualVocabulary();
    });

    // Then disable it
    act(() => {
      result.current.disableManualVocabulary();
    });

    expect(result.current.addManualVocabulary).toBe(false);
  });

  it('should update userAddedVocabulary when setUserAddedVocabulary is called', () => {
    const { result } = renderHook(() => useCustomVocabulary());
    const testVocabulary = 'hola amigo';

    act(() => {
      result.current.setUserAddedVocabulary(testVocabulary);
    });

    expect(result.current.userAddedVocabulary).toBe(testVocabulary);
  });
});
