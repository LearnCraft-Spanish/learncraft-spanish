import { useLocation } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import { useUserData } from 'src/hooks/UserData/useUserData';

export default function useDatabaseTables() {
  const { isAuthenticated, isLoading } = useAuth();
  const userDataQuery = useUserData();

  const location = useLocation();
  const isRoot = location.pathname === '/database-tables';

  const dataReady = userDataQuery.isSuccess && !isLoading && isAuthenticated;

  return {
    dataReady,
    isRoot,
  };
}
