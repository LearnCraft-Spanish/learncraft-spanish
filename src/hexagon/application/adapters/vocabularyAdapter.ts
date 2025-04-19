import type { VocabularyPort } from '../ports/vocabularyPort';
import { config } from '../../config';
import { createVocabularyInfrastructure } from '../../infrastructure/vocabulary/vocabularyInfrastructure';
import { useAuthAdapter } from './authAdapter';

/**
 * Adapter hook for vocabulary operations.
 * Connects the application layer to the infrastructure implementation.
 */
export function useVocabularyAdapter(): VocabularyPort {
  // Get API URL from config
  const apiUrl = config.apiUrl;

  // Use our auth adapter rather than direct dependency on useAuth hook
  const auth = useAuthAdapter();

  return createVocabularyInfrastructure(apiUrl, auth);
}
