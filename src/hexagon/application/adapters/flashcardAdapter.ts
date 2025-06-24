import type { FlashcardPort } from '../ports/flashcardPort';
import { config } from 'src/hexagon/config';
import { createFlashcardInfrastructure } from 'src/hexagon/infrastructure/flashcardInfrastructure';
import { useAuthAdapter } from './authAdapter';

export function useFlashcardAdapter(): FlashcardPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createFlashcardInfrastructure(apiUrl, auth);
}
