import type { AudioEngine } from '@composition/context/AudioContext';
import { AudioContext } from '@composition/context/AudioContext';
import React, { useCallback, useMemo, useRef } from 'react';

export function AudioEngineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mounted player (for playback/lock-screen)
  const playingAudioRef = useRef<HTMLAudioElement>(null);

  // Detached probe element (never mounted)
  const probeElementRef = useRef<HTMLAudioElement | null>(null);
  if (!probeElementRef.current) {
    const element = new Audio();
    element.preload = 'metadata';
    element.crossOrigin = 'anonymous';
    probeElementRef.current = element;
  }

  // Chain of promises for probe tasks
  const probeTaskChainRef = useRef<Promise<unknown>>(Promise.resolve());

  // Runs a probe task one at a time against the shared element
  const runProbeTask = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const nextTask = probeTaskChainRef.current.then(task, task);
    probeTaskChainRef.current = nextTask;
    return nextTask as Promise<T>;
  }, []);

  // Audio engine context value
  const audioEngine: AudioEngine = useMemo(
    () =>
      ({
        playingAudioRef,
        probeElementRef,
        runProbeTask,
      }) satisfies AudioEngine,
    [playingAudioRef, probeElementRef, runProbeTask],
  );

  return (
    <AudioContext value={audioEngine}>
      <audio ref={playingAudioRef} />
      {children}
    </AudioContext>
  );
}
