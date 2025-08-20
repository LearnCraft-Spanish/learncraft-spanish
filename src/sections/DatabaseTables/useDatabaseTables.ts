import { useLocation } from 'react-router-dom';
import { useAuthAdapter } from 'src/hexagon/application/adapters/authAdapter';

export default function useDatabaseTables() {
  const { isAuthenticated, isLoading, authUser } = useAuthAdapter();

  const location = useLocation();
  const isRoot = location.pathname === '/database-tables';

  const dataReady = !!authUser && !isLoading && isAuthenticated;

  return {
    dataReady,
    isRoot,
  };
}
