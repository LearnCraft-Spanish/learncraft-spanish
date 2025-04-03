import type { SubcategoryPort } from '../ports/subcategoryPort';
import { subcategoryInfrastructure } from '../../infrastructure/vocabulary/subcategoryInfrastructure';

/**
 * Adapts the infrastructure to a React hook that implements the port.
 *
 * This adapter maintains the boundary between:
 * - Non-React infrastructure (pure, stateless, testable)
 * - React application layer (hooks, effects, state)
 *
 * Benefits:
 * - Keeps React dependencies out of infrastructure
 * - Creates a clean boundary for testing
 * - Maintains consistent hook pattern for consumers
 * - Enables infrastructure reuse in non-React contexts
 */
export function useSubcategoryAdapter(): SubcategoryPort {
  // Infrastructure is non-reactive, so we can return it directly
  return subcategoryInfrastructure;
}
