import type { QuizGroupPort } from '@application/ports/quizGroupPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createQuizGroupInfrastructure } from '@infrastructure/quizGroupInfrastructure';

/**
 * Adapter hook for quiz group operations.
 * Connects the application layer to the infrastructure implementation.
 */
export function useQuizGroupAdapter(): QuizGroupPort {
  // Get API URL from config
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createQuizGroupInfrastructure(apiUrl, auth);
}
