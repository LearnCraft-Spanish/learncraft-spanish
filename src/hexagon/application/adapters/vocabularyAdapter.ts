import type { VocabularyPort } from '../ports/vocabularyPort';
import useAuth from '../../../hooks/useAuth';
import { config } from '../../config';
import { createVocabularyInfrastructure } from '../../infrastructure/vocabulary/vocabularyInfrastructure';

/**
 * Adapter hook for vocabulary operations.
 * Connects the application layer to the infrastructure implementation.
 */
export function useVocabularyAdapter(): VocabularyPort {
  // Get Auth0 token provider
  const apiUrl = config.apiUrl;
  const auth = useAuth();

  return createVocabularyInfrastructure(apiUrl, auth);
}
