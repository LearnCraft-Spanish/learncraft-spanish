import type { SubcategoryPort } from '../ports/subcategoryPort';
import useAuth from '../../../hooks/useAuth';
import { config } from '../../config';
import { createSubcategoryInfrastructure } from '../../infrastructure/vocabulary/subcategoryInfrastructure';

export function useSubcategoryAdapter(): SubcategoryPort {
  // Get Auth0 token provider
  const apiUrl = config.apiUrl;
  const auth = useAuth();

  return createSubcategoryInfrastructure(apiUrl, auth);
}
