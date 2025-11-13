import type { FlashcardPort } from '@application/ports/flashcardPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createFlashcardInfrastructure } from '@infrastructure/flashcardInfrastructure';

export function useFlashcardAdapter(): FlashcardPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createFlashcardInfrastructure(apiUrl, auth);
}
