import type { AudioTranscodingPort } from '@application/ports/audioTranscodingPort';
import { createContext } from 'react';

export const AudioTranscodingContext =
  createContext<AudioTranscodingPort | null>(null);
