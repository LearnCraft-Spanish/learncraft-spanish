import { createContext } from 'react';

export interface AudioEngine {
  playingAudioRef: React.RefObject<HTMLAudioElement | null>;
  englishParseAudioRef: React.RefObject<HTMLAudioElement | null>;
  spanishParseAudioRef: React.RefObject<HTMLAudioElement | null>;
}

export const AudioContext = createContext<AudioEngine | null>(null);
