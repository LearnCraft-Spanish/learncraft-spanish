import { createContext } from 'react';
import type { AudioTranscodingPort } from '@application/ports/audioTranscodingPort';

export const AudioTranscodingContext =
  createContext<AudioTranscodingPort | null>(null);
