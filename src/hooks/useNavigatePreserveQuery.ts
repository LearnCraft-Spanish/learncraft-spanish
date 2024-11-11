import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

function useNavigatePreserveQuery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  function navigatePreservingQuery(to: string, options?: object) {
    const newSearchParams = new URLSearchParams(searchParams);

    // Remove Auth0 query params
    newSearchParams.delete('code');
    newSearchParams.delete('state');

    // Convert object to string
    const newSearchParamString = newSearchParams.toString();

    // Append query params to new route
    navigate(`${to}?${newSearchParamString}`, options);
  }

  return navigatePreservingQuery;
}

export default useNavigatePreserveQuery;
