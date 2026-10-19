import { shouldEnableQuizKeyboardShortcuts } from '@interface/functions/shouldEnableQuizKeyboardShortcuts';
import { describe, expect, it } from 'vitest';

describe('shouldEnableQuizKeyboardShortcuts', () => {
  it('enables shortcuts for a mouse-driven Windows desktop', () => {
    expect(
      shouldEnableQuizKeyboardShortcuts({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
        maxTouchPoints: 0,
        finePointer: true,
        canHover: true,
      }),
    ).toBe(true);
  });

  it('enables shortcuts for a Mac whose primary pointer is a mouse or trackpad', () => {
    expect(
      shouldEnableQuizKeyboardShortcuts({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 0,
        finePointer: true,
        canHover: true,
      }),
    ).toBe(true);
  });

  it('keeps shortcuts on a touchscreen laptop whose primary pointer is still a mouse', () => {
    expect(
      shouldEnableQuizKeyboardShortcuts({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
        maxTouchPoints: 10,
        finePointer: true,
        canHover: true,
      }),
    ).toBe(true);
  });

  it('disables shortcuts on iPadOS, which reports a Macintosh user agent and a fine pointer with a trackpad', () => {
    expect(
      shouldEnableQuizKeyboardShortcuts({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 5,
        finePointer: true,
        canHover: true,
      }),
    ).toBe(false);
  });

  it('disables shortcuts when the user agent names an iPad', () => {
    expect(
      shouldEnableQuizKeyboardShortcuts({
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15',
        platform: 'iPad',
        maxTouchPoints: 5,
        finePointer: false,
        canHover: false,
      }),
    ).toBe(false);
  });

  it('disables shortcuts on an iPad even if a keyboard makes the pointer look fine', () => {
    expect(
      shouldEnableQuizKeyboardShortcuts({
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 5,
        finePointer: true,
        canHover: true,
      }),
    ).toBe(false);
  });

  it('disables shortcuts on a touch tablet that is not an iPad', () => {
    expect(
      shouldEnableQuizKeyboardShortcuts({
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel Tablet)',
        platform: 'Linux armv8l',
        maxTouchPoints: 5,
        finePointer: false,
        canHover: false,
      }),
    ).toBe(false);
  });

  it('disables shortcuts on a phone', () => {
    expect(
      shouldEnableQuizKeyboardShortcuts({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5,
        finePointer: false,
        canHover: false,
      }),
    ).toBe(false);
  });

  it('disables shortcuts when the pointer is fine but cannot hover', () => {
    expect(
      shouldEnableQuizKeyboardShortcuts({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
        maxTouchPoints: 0,
        finePointer: true,
        canHover: false,
      }),
    ).toBe(false);
  });
});
