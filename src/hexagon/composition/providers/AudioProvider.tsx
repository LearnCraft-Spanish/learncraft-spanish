import type { AudioEngine } from '@composition/context/AudioContext';
import { AudioContext } from '@composition/context/AudioContext';
import React from 'react';

export function AudioEngineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const engineRef = React.useRef<AudioEngine>({
    ctx: null,
    keeper: null,
    baseline: 0,
    events: [],
    nextIdx: 0,
    scheduled: [],
    timerId: null,
    cache: new Map(),
  });

  return <AudioContext value={engineRef.current}>{children}</AudioContext>;
}
