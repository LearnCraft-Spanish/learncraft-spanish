import type { AudioEngine } from '@composition/context/AudioContext';
import { AudioContext } from '@composition/context/AudioContext';
import React, { useMemo, useRef } from 'react';

export function AudioEngineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const playingAudioRef = useRef<HTMLAudioElement | null>(null);
  const englishParseAudioRef = useRef<HTMLAudioElement | null>(null);
  const spanishParseAudioRef = useRef<HTMLAudioElement | null>(null);

  const audioEngine: AudioEngine = useMemo(
    () =>
      ({
        playingAudioRef,
        englishParseAudioRef,
        spanishParseAudioRef,
      }) satisfies AudioEngine,
    [playingAudioRef, englishParseAudioRef, spanishParseAudioRef],
  );

  return (
    <AudioContext value={audioEngine}>
      <audio ref={playingAudioRef} />
      <audio ref={englishParseAudioRef} muted={true} />
      <audio ref={spanishParseAudioRef} muted={true} />
      {children}
    </AudioContext>
  );
}
