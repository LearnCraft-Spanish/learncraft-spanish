import { createContext } from 'react';

export interface AudioEngine {
  playingAudioRef: React.RefObject<HTMLAudioElement | null>;
  currentSpanishAudioRef: React.RefObject<HTMLAudioElement | null>;
  currentEnglishAudioRef: React.RefObject<HTMLAudioElement | null>;
  nextSpanishAudioRef: React.RefObject<HTMLAudioElement | null>;
  nextEnglishAudioRef: React.RefObject<HTMLAudioElement | null>;
}

export const AudioContext = createContext<AudioEngine | null>(null);
