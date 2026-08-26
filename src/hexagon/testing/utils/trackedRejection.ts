/**
 * A rejecting mutation whose rejection handling is observable.
 *
 * Watching `process.on('unhandledRejection')` cannot see this: a `vi.fn`
 * records the settled result of whatever it returns, which already counts as
 * handling the rejection, so a caller that drops it looks clean. This wrapper
 * patches the chain instead. Every promise `reject()` hands out carries its own
 * verdict — one flag shared across the factory would let a caught first
 * rejection vouch for a dropped second — and `wasHandled()` is true only once
 * at least one promise has been handed out and every one of them has had a
 * rejection handler attached.
 *
 * Counted as handled:
 *
 * - `p.catch(fn)` and `p.then(undefined, fn)`.
 * - Either of those downstream of `p.then(onFulfilled)`, whose derived promise
 *   is tracked in turn, so `p.then(onSuccess).catch(onFailure)` is recognised.
 *
 * Reported as unhandled even though they do handle it:
 *
 * - `try { await p } catch {}`. `await` on a native promise runs the spec's
 *   internal PerformPromiseThen and never reads the `then` property, so there
 *   is nothing for userland to patch.
 * - `p.then(onFulfilled, onRejected)` in one call. That is how `vi.fn` observes
 *   the result it is recording, so counting it would make every
 *   `vi.fn(rejection.reject)` report handled whatever the call site did.
 * - Anything attached after `p.finally(fn)`, whose derived promise is untracked
 *   because native `finally` forwards through `then` with both arguments.
 *
 * Those three are documented rather than detected. The first is invisible from
 * userland, the second cannot be told apart from the observer this utility
 * exists to see past, and detecting only the third would move the cliff edge
 * rather than remove it. So reach for this on fire-and-forget call sites —
 * `void p.catch(…)`, the pattern it exists to police — and assert
 * `await expect(p).rejects…` where the call site awaits.
 */
export function trackedRejection(message: string): {
  reject: () => Promise<never>;
  wasHandled: () => boolean;
} {
  const verdicts: { handled: boolean }[] = [];

  function track<T>(
    promise: Promise<T>,
    verdict: { handled: boolean },
  ): Promise<T> {
    const forward = promise.then.bind(promise);

    promise.then = (onFulfilled, onRejected) => {
      if (onRejected && !onFulfilled) {
        verdict.handled = true;
      }
      if (onRejected) {
        return forward(onFulfilled, onRejected);
      }
      return track(forward(onFulfilled), verdict);
    };

    promise.catch = (onRejected) => {
      if (onRejected) {
        verdict.handled = true;
      }
      return forward(undefined, onRejected);
    };

    return promise;
  }

  return {
    reject: (): Promise<never> => {
      const verdict = { handled: false };
      verdicts.push(verdict);
      return track(Promise.reject<never>(new Error(message)), verdict);
    },
    wasHandled: (): boolean =>
      verdicts.length > 0 && verdicts.every((verdict) => verdict.handled),
  };
}
