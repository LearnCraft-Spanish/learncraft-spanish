import type { QuizPort } from '@application/ports/quizPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createQuizInfrastructure } from '@infrastructure/quizInfrastructure';
export function useQuizAdapter(): QuizPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createQuizInfrastructure(apiUrl, auth);
}
