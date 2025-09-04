import type { QuizPort } from '@application/ports/quizPort';
import { createQuizInfrastructure } from '@infrastructure/quizInfrastructure';
import { config } from 'src/hexagon/config';
import { useAuthAdapter } from './authAdapter';

export function useQuizAdapter(): QuizPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createQuizInfrastructure(apiUrl, auth);
}
