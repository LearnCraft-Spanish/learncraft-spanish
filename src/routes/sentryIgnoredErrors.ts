/**
 * Errors that should not be sent to Sentry.
 * Prefer exact name + message when stable; use a RegExp message when the
 * text includes volatile parts (e.g. hashed asset URLs after a deploy).
 */
export interface IgnoredError {
  name: string;
  message: string | RegExp;
}

export const errorsToIgnore: IgnoredError[] = [
  // Stale tab after deploy: browser can't load a hashed chunk that no longer exists.
  {
    name: 'TypeError',
    message: /^Failed to fetch dynamically imported module:/,
  },
  // Firefox variant of the same stale-chunk failure.
  {
    name: 'TypeError',
    message: /^error loading dynamically imported module:/,
  },
  // Deploy/CDN returned HTML (e.g. index/404) instead of the JS chunk.
  {
    name: 'TypeError',
    message: "'text/html' is not a valid JavaScript MIME type.",
  },
];

interface ErrorLike {
  name?: string;
  message?: string;
  cause?: unknown;
}

const matchesIgnoredError = (errorLike: unknown): boolean => {
  if (!errorLike || typeof errorLike !== 'object') {
    return false;
  }

  const { name, message } = errorLike as ErrorLike;
  if (typeof name !== 'string' || typeof message !== 'string') {
    return false;
  }

  return errorsToIgnore.some((candidate) => {
    if (candidate.name !== name) {
      return false;
    }

    return typeof candidate.message === 'string'
      ? candidate.message === message
      : candidate.message.test(message);
  });
};

export const shouldIgnoreError = (
  event: { exception?: { values?: Array<{ type?: string; value?: string }> } },
  originalException: unknown,
): boolean => {
  if (matchesIgnoredError(originalException)) {
    return true;
  }

  const cause =
    originalException &&
    typeof originalException === 'object' &&
    'cause' in originalException
      ? (originalException as ErrorLike).cause
      : undefined;

  if (matchesIgnoredError(cause)) {
    return true;
  }

  const eventExceptions = event.exception?.values ?? [];
  return eventExceptions.some((exception) =>
    matchesIgnoredError({
      name: exception.type,
      message: exception.value,
    }),
  );
};
