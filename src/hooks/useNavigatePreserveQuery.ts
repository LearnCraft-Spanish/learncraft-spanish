import { useLocation, useNavigate } from 'react-router-dom';

function useNavigatePreserveQuery() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = location.search; // current query params

  function navigatePreservingQuery(to: string, options?: object) {
    navigate(`${to}${searchParams}`, options); // Append query params to new route
  }

  return navigatePreservingQuery;
}

export default useNavigatePreserveQuery;
