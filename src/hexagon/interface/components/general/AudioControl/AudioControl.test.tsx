import type { AudioControlHandle } from '@interface/components/general/AudioControl/AudioControl';
import AudioControl from '@interface/components/general/AudioControl/AudioControl';
import { act, render, renderHook, screen } from '@testing-library/react';
import React, { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

const audioLink = 'https://example.com/audio.mp3';

describe('audioControl', () => {
  it('should render', () => {
    render(<AudioControl audioLink={audioLink} />);

    expect(screen.getByLabelText('Play/Pause')).toBeInTheDocument();
  });

  it('should not render if audioLink is not valid', () => {
    render(<AudioControl audioLink={'not-a-valid-audio-link'} />);

    expect(screen.queryByLabelText('Play/Pause')).not.toBeInTheDocument();
    expect(screen.queryByText('error')).toBeInTheDocument();
  });
  it('should render nothing if audioLink is not provided', () => {
    render(<AudioControl audioLink={''} />);

    expect(screen.queryByLabelText('Play/Pause')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('audioError')).not.toBeInTheDocument();
  });

  describe('forwardRef handle', () => {
    it('exposes playAudio, pauseAudio, and isPlaying through ref', () => {
      const { result } = renderHook(() => useRef<AudioControlHandle>(null));
      const ref = result.current;
      render(<AudioControl ref={ref} audioLink={audioLink} />);

      expect(ref.current).not.toBeNull();
      expect(typeof ref.current?.playAudio).toBe('function');
      expect(typeof ref.current?.pauseAudio).toBe('function');
      expect(typeof ref.current?.isPlaying).toBe('boolean');
      expect(ref.current?.isPlaying).toBe(false);
    });

    it('calling playAudio through ref invokes the underlying media play', async () => {
      const mockPlay = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(HTMLMediaElement.prototype, 'play', {
        configurable: true,
        value: mockPlay,
      });

      const { result } = renderHook(() => useRef<AudioControlHandle>(null));
      const ref = result.current;
      render(<AudioControl ref={ref} audioLink={audioLink} />);

      await act(async () => {
        await ref.current?.playAudio();
      });

      expect(mockPlay).toHaveBeenCalled();
    });

    it('resets isPlaying to false when audioLink changes mid-playback', async () => {
      const mockPlay = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(HTMLMediaElement.prototype, 'play', {
        configurable: true,
        value: mockPlay,
      });

      const { result } = renderHook(() => useRef<AudioControlHandle>(null));
      const ref = result.current;
      const { rerender } = render(
        <AudioControl ref={ref} audioLink={audioLink} />,
      );

      await act(async () => {
        await ref.current?.playAudio();
      });
      expect(ref.current?.isPlaying).toBe(true);

      act(() => {
        rerender(
          <AudioControl
            ref={ref}
            audioLink="https://example.com/other-audio.mp3"
          />,
        );
      });

      expect(ref.current?.isPlaying).toBe(false);
    });

    it('handle is still exposed when audioLink is empty, but no audio plays', async () => {
      const mockPlay = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(HTMLMediaElement.prototype, 'play', {
        configurable: true,
        value: mockPlay,
      });

      const { result } = renderHook(() => useRef<AudioControlHandle>(null));
      const ref = result.current;
      render(<AudioControl ref={ref} audioLink="" />);

      expect(ref.current).not.toBeNull();
      expect(ref.current?.isPlaying).toBe(false);

      await act(async () => {
        await ref.current?.playAudio();
      });

      expect(mockPlay).not.toHaveBeenCalled();
    });
  });
});
