import type { VocabularyPort } from '@application/ports/vocabularyPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createVocabularyInfrastructure } from '@infrastructure/vocabulary/vocabularyInfrastructure';

/**
 * Adapter hook for vocabulary operations.
 * Connects the application layer to the infrastructure implementation.
 */
export function useVocabularyAdapter(): VocabularyPort {
  // Get API URL from config
  const apiUrl = config.backendDomain;

  // Use our auth adapter rather than direct dependency on useAuth hook
  const auth = useAuthAdapter();

  return createVocabularyInfrastructure(apiUrl, auth);
}
