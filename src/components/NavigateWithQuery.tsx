import { Navigate, useLocation } from 'react-router-dom';

interface NavigateWithQueryProps {
  to: string;
}

export default function NavigateWithQuery({ to }: NavigateWithQueryProps) {
  const location = useLocation();
  const searchParams = location.search; // current query params
  const destination = `${to}${searchParams}`; // Append query params to new route
  return <Navigate to={destination} />;
}
