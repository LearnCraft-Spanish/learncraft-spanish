import type { CookiePort } from '../ports/cookiePort';
import { createCookieInfrastructure } from '@infrastructure/cookieInfrastructure';

export function CookieAdapter(): CookiePort {
  return createCookieInfrastructure();
}
