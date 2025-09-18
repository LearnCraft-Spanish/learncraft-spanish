import { createContext } from 'react';
import type { AudioParserPort } from '@application/ports/audioParserPort';

export const AudioParserContext = createContext<AudioParserPort | null>(null);

