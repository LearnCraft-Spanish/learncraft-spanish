import type { AudioEvent } from '@application/ports/audioPort';
import { createContext } from 'react';

export interface AudioEngine {
  ctx: AudioContext | null;
  keeper: ConstantSourceNode | null;
  baseline: number; // ctx.currentTime at play baseline
  events: AudioEvent[]; // active absolute schedule
  nextIdx: number; // next event to schedule
  scheduled: AudioBufferSourceNode[];
  timerId: number | null; // scheduler interval
  cache: Map<string, AudioBuffer>; // decode cache
}

export const AudioContext = createContext<AudioEngine | null>(null);
