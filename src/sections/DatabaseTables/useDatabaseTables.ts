import { useAuthAdapter } from 'src/hexagon/application/adapters/authAdapter';

export default function useDatabaseTables() {
  const { isAuthenticated, isLoading, authUser } = useAuthAdapter();

  const dataReady = !!authUser && !isLoading && isAuthenticated;

  return {
    dataReady,
  };
}
