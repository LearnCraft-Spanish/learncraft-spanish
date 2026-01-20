import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './SafeLink.scss';
type SafeLinkProps = { disabled?: boolean } & LinkProps;

/**
 * A wrapper around the Link component that adds a disabled state
 * This is the right way to handle disabled links
 *
 * @param props - The props for the SafeLink component
 */
export function SafeLink(props: SafeLinkProps) {
  const { disabled, className, ...rest } = props;
  if (disabled) {
    return (
      <span className={`linkButton disabled ${className}`} aria-disabled>
        {rest.children}
      </span>
    );
  }
  return <Link className={`linkButton ${className}`} {...rest} />;
}
