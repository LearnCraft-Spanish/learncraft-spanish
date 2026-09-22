/**
 * Hard network isolation for the visual gauntlet preview.
 * Any non-allowlisted http(s) request throws so specimens never hit a backend.
 */
const ALLOWED_HOST_SUFFIXES = ['localhost', '127.0.0.1', '[::1]'];

function isAllowedUrl(raw: string): boolean {
  if (raw.startsWith('/') || raw.startsWith('./') || raw.startsWith('../')) {
    return true;
  }
  if (
    raw.startsWith('data:') ||
    raw.startsWith('blob:') ||
    raw.startsWith('about:')
  ) {
    return true;
  }
  try {
    const url = new URL(raw, window.location.origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return true;
    }
    if (url.origin === window.location.origin) {
      return true;
    }
    return ALLOWED_HOST_SUFFIXES.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

function assertAllowed(raw: string, via: string): void {
  if (!isAllowedUrl(raw)) {
    throw new Error(
      `[gauntlet networkGuard] Blocked ${via} to "${raw}". ` +
        'Visual specimens must not call real APIs. Use fixture adapters or props.',
    );
  }
}

export function installNetworkGuard(): void {
  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const raw =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    assertAllowed(raw, 'fetch');
    return originalFetch(input, init);
  }) as typeof window.fetch;

  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = class GuardedXHR extends OriginalXHR {
    open(
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ): void {
      assertAllowed(String(url), 'XMLHttpRequest');
      super.open(method, url, async ?? true, username, password);
    }
  };
}
