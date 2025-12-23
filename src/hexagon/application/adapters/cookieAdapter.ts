import type { CookiePort } from '@application/ports/cookiePort';
import { createCookieInfrastructure } from '@infrastructure/cookieInfrastructure';

export function CookieAdapter(): CookiePort {
  return createCookieInfrastructure();
}
