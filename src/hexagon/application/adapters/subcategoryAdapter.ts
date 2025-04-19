import type { SubcategoryPort } from '../ports/subcategoryPort';
import { config } from '../../config';
import { createSubcategoryInfrastructure } from '../../infrastructure/vocabulary/subcategoryInfrastructure';
import { useAuthAdapter } from './authAdapter';

export function useSubcategoryAdapter(): SubcategoryPort {
  // Get API URL from config
  const apiUrl = config.apiUrl;

  // Use our auth adapter rather than direct dependency on useAuth hook
  const auth = useAuthAdapter();

  return createSubcategoryInfrastructure(apiUrl, auth);
}
