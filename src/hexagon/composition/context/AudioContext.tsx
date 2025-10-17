import { createContext } from 'react';

export interface ProbeOptions {
  timeoutMs?: number;
}

export interface AudioEngine {
  // The player element (mounted/hidden in the provider)
  playingAudioRef: React.RefObject<HTMLAudioElement | null>;

  // The probe element (never mounted)
  probeElementRef: React.RefObject<HTMLAudioElement | null>;

  // Ensures probe tasks run one at a time against the shared element
  runProbeTask: <T>(task: () => Promise<T>) => Promise<T>;
}

export const AudioContext = createContext<AudioEngine | null>(null);
