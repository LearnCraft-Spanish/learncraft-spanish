import type { SubcategoryPort } from '@application/ports/subcategoryPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { createSubcategoryInfrastructure } from '@infrastructure/vocabulary/subcategoryInfrastructure';
import { config } from 'src/hexagon/config';

export function useSubcategoryAdapter(): SubcategoryPort {
  // Get API URL from config
  const apiUrl = config.backendDomain;

  // Use our auth adapter rather than direct dependency on useAuth hook
  const auth = useAuthAdapter();

  return createSubcategoryInfrastructure(apiUrl, auth);
}
