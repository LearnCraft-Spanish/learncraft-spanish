import { trackedRejection } from '@testing/utils/trackedRejection';
import { describe, expect, it, vi } from 'vitest';

/**
 * Stops a deliberately dropped rejection from escaping the test file after its
 * verdict has been read. Attaching the handler flips `handled`, so never call
 * this before the assertion.
 */
function silence(promise: Promise<never>): void {
  promise.catch(() => {});
}

describe('trackedRejection', () => {
  it('reports nothing handled before any promise is handed out', () => {
    const rejection = trackedRejection('boom');

    expect(rejection.wasHandled()).toBe(false);
  });

  it('sees a .catch handler', () => {
    const rejection = trackedRejection('boom');

    rejection.reject().catch(() => {});

    expect(rejection.wasHandled()).toBe(true);
  });

  it('sees a rejection-only .then handler', () => {
    const rejection = trackedRejection('boom');

    rejection.reject().then(undefined, () => {});

    expect(rejection.wasHandled()).toBe(true);
  });

  it('sees a .catch attached downstream of a .then', () => {
    const rejection = trackedRejection('boom');

    rejection
      .reject()
      .then(() => 'never')
      .catch(() => {});

    expect(rejection.wasHandled()).toBe(true);
  });

  it('reports a dropped rejection', () => {
    const rejection = trackedRejection('boom');
    const promise = rejection.reject();

    expect(rejection.wasHandled()).toBe(false);

    silence(promise);
  });

  /**
   * The regression this utility was rewritten for. One flag in the factory
   * closure let the caught first rejection vouch for the dropped second, so a
   * call site that handled only some of its mutations passed. `ExampleRow`'s
   * suite already wires two mutations to one tracker.
   */
  it('fails the whole tracker when only one of two rejections is handled', () => {
    const rejection = trackedRejection('boom');

    rejection.reject().catch(() => {});
    const dropped = rejection.reject();

    expect(rejection.wasHandled()).toBe(false);

    silence(dropped);
  });

  it('passes when both of two rejections are handled', () => {
    const rejection = trackedRejection('boom');

    rejection.reject().catch(() => {});
    rejection.reject().catch(() => {});

    expect(rejection.wasHandled()).toBe(true);
  });

  it('rejects with the message it was given', async () => {
    const rejection = trackedRejection('No access to delete flashcards');

    await expect(rejection.reject()).rejects.toThrow(
      'No access to delete flashcards',
    );
  });

  it('still settles the chain it is watching', async () => {
    const rejection = trackedRejection('boom');
    const onFailure = vi.fn<(error: Error) => string>(() => 'recovered');

    const result = await rejection
      .reject()
      .then(() => 'never')
      .catch(onFailure);

    expect(onFailure).toHaveBeenCalledOnce();
    expect(result).toBe('recovered');
  });

  /**
   * The three documented blind spots. They are asserted so the docblock cannot
   * drift: if a future change starts detecting one of them, this fails and the
   * docblock has to be corrected with it.
   */
  describe('documented blind spots', () => {
    it('cannot see await inside try/catch, because await never reads .then', async () => {
      const rejection = trackedRejection('boom');

      try {
        await rejection.reject();
      } catch {
        // handled, but invisible from userland
      }

      expect(rejection.wasHandled()).toBe(false);
    });

    it('cannot see two-argument .then, which is how vi.fn observes a result', () => {
      const rejection = trackedRejection('boom');

      rejection.reject().then(
        () => {},
        () => {},
      );

      expect(rejection.wasHandled()).toBe(false);
    });

    it('cannot see a .catch attached after .finally', async () => {
      const rejection = trackedRejection('boom');

      await rejection
        .reject()
        .finally(() => {})
        .catch(() => {});

      expect(rejection.wasHandled()).toBe(false);
    });
  });
});
