import type { AudioEngine } from '@composition/context/AudioContext';
import { AudioContext } from '@composition/context/AudioContext';
import React, { useMemo, useRef } from 'react';

export function AudioEngineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const playingAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentSpanishAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentEnglishAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextSpanishAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextEnglishAudioRef = useRef<HTMLAudioElement | null>(null);

  const audioEngine: AudioEngine = useMemo(
    () =>
      ({
        playingAudioRef,
        currentSpanishAudioRef,
        currentEnglishAudioRef,
        nextSpanishAudioRef,
        nextEnglishAudioRef,
      }) satisfies AudioEngine,
    [
      playingAudioRef,
      currentSpanishAudioRef,
      currentEnglishAudioRef,
      nextSpanishAudioRef,
      nextEnglishAudioRef,
    ],
  );

  return (
    <AudioContext value={audioEngine}>
      <audio ref={playingAudioRef} />
      <audio ref={currentSpanishAudioRef} muted={true} />
      <audio ref={currentEnglishAudioRef} muted={true} />
      <audio ref={nextSpanishAudioRef} muted={true} />
      <audio ref={nextEnglishAudioRef} muted={true} />
      {children}
    </AudioContext>
  );
}
