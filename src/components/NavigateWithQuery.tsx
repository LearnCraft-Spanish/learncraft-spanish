import { Navigate, useSearchParams } from 'react-router-dom';

interface NavigateWithQueryProps {
  to: string;
}

export default function NavigateWithQuery({ to }: NavigateWithQueryProps) {
  const [searchParams] = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams);

  // Remove Auth0 query params
  newSearchParams.delete('code');
  newSearchParams.delete('state');

  // Convert object to string
  const newSearchParamString = newSearchParams.toString();
  const destination = `${to}?${newSearchParamString}`; // Append query params to new route
  return <Navigate to={destination} />;
}
