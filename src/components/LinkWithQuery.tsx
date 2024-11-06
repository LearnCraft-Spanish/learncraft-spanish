import { Link, useLocation } from 'react-router-dom';

interface LinkWithQueryProps {
  to: string;
  children: React.ReactNode;
  [key: string]: any; // Allows passing other Link props (like className, etc.)
}

function LinkWithQuery({ to, children, ...props }: LinkWithQueryProps) {
  const location = useLocation();
  const searchParams = location.search; // Current query parameters

  // Append existing query params to the new link's "to" path
  const toWithQuery = `${to}${searchParams}`;

  return (
    <Link to={toWithQuery} {...props}>
      {children}
    </Link>
  );
}

export default LinkWithQuery;
