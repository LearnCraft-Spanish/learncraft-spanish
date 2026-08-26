import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Reads `?enableFiltering=true` and strips it from the URL, so a page can seed
 * its filter toggle from an incoming link without the parameter surviving a
 * refresh or a back navigation. Router bootstrap only: the flag is handed to
 * the page use case, which owns the filter state and keeps it on after the
 * parameter is gone.
 */
export function useEnableFilteringParam(): boolean {
  const location = useLocation();
  const navigate = useNavigate();

  const enableFiltering =
    new URLSearchParams(location.search).get('enableFiltering') === 'true';

  useEffect(() => {
    if (!enableFiltering) {
      return;
    }
    const remainingParams = new URLSearchParams(location.search);
    remainingParams.delete('enableFiltering');
    const remainingSearch = remainingParams.toString();
    navigate(
      `${location.pathname}${remainingSearch ? `?${remainingSearch}` : ''}`,
      { replace: true },
    );
  }, [enableFiltering, location.pathname, location.search, navigate]);

  return enableFiltering;
}
