import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './SafeLink.scss';
type SafeLinkProps = { disabled?: boolean } & LinkProps;

export function SafeLink(props: SafeLinkProps) {
  const { disabled, className, ...rest } = props;
  if (disabled) {
    return (
      <span className={`linkButton disabled ${className}`} aria-disabled={true}>
        {rest.children}
      </span>
    );
  }
  return <Link className={`linkButton ${className}`} {...rest} />;
}
