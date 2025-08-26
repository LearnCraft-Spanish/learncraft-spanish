import type {
  AudioEvent,
  AudioPort,
  ClipInfo,
} from '@application/ports/audioPort';
import { AudioContext } from '@composition/context/AudioContext';
import { use, useCallback, useMemo } from 'react';

export function useAudioInfrastructure(): AudioPort {
  const eng = use(AudioContext);
  if (!eng) throw new Error('AudioContext not found');

  // --- helpers bound to the engine ---
  const ensureCtx = useCallback((): AudioContext => {
    if (eng.ctx) return eng.ctx;
    const Ctor = window.AudioContext;
    const ctx: AudioContext = new Ctor();
    // keep context from autosuspending during intended silences
    const keeper = new ConstantSourceNode(ctx, { offset: 0 });
    keeper.connect(ctx.destination);
    keeper.start();
    eng.ctx = ctx;
    eng.keeper = keeper;
    return ctx;
  }, [eng]);

  const clearScheduled = useCallback(() => {
    eng.scheduled.forEach((n: AudioBufferSourceNode) => {
      try {
        n.stop();
      } catch {}
      try {
        n.disconnect();
      } catch {}
    });
    eng.scheduled = [];
  }, [eng]);

  const stopTimer = useCallback(() => {
    if (eng.timerId != null) {
      clearInterval(eng.timerId);
      eng.timerId = null;
    }
  }, [eng]);

  const decodeToBuffer = useCallback(
    async (url: string): Promise<AudioBuffer> => {
      const cached = eng.cache.get(url);
      if (cached) return cached;
      const res = await fetch(url, { mode: 'cors' });
      const arr = await res.arrayBuffer();
      const ctx = ensureCtx();
      const buf = await new Promise<AudioBuffer>((resolve, reject) =>
        ctx.decodeAudioData(arr, resolve, reject),
      );
      eng.cache.set(url, buf);
      return buf;
    },
    [eng, ensureCtx],
  );

  // --- port methods ---
  const startOnce = useCallback(async () => {
    const ctx = ensureCtx();
    if (ctx.state === 'suspended') await ctx.resume(); // must be called in a user gesture
    eng.baseline = ctx.currentTime; // reset baseline on arm
  }, [eng, ensureCtx]);

  const decode = useCallback(
    async (url: string): Promise<ClipInfo> => {
      const buf = await decodeToBuffer(url);
      return { url, audioDur: buf.duration };
    },
    [decodeToBuffer],
  );

  const playAbsolute = useCallback(
    async (events: AudioEvent[], opts?: { startAt?: number }) => {
      const ctx = ensureCtx();
      await ctx.resume(); // safe if already running

      // Normalize schedule
      eng.events = [...events].sort((a, b) => a.start - b.start);
      eng.nextIdx = 0;

      // Pre-decode audio URLs to avoid blocking in the scheduler tick
      const urls = Array.from(
        new Set(
          eng.events
            .filter((e) => e.kind === 'audio')
            .map((e) => e.url as string),
        ),
      );
      await Promise.all(urls.map(decodeToBuffer));

      // Establish baseline so now() = 0 at start
      const startAt = opts?.startAt ?? 0;
      eng.baseline = ctx.currentTime - startAt;

      clearScheduled();
      stopTimer();

      // Look-ahead scheduler
      const AHEAD_SEC = 0.5;
      const TICK_MS = 30;

      const tick = async () => {
        const now = ctx.currentTime - eng.baseline;
        const until = now + AHEAD_SEC;

        while (
          eng.nextIdx < eng.events.length &&
          eng.events[eng.nextIdx].start <= until
        ) {
          const ev = eng.events[eng.nextIdx++];
          if (ev.kind === 'audio') {
            const buf = await decodeToBuffer(ev.url);
            const src = new AudioBufferSourceNode(ctx, { buffer: buf });
            src.connect(ctx.destination);
            // schedule at absolute time (baseline + start)
            try {
              src.start(eng.baseline + ev.start, 0, ev.dur);
            } catch {}
            eng.scheduled.push(src);
          }
          // gaps are implicit in the timeline; no node needed
        }
      };

      // prime once, then interval
      await tick();
      eng.timerId = window.setInterval(() => {
        tick().catch(() => {});
      }, TICK_MS);
    },
    [eng, ensureCtx, decodeToBuffer, clearScheduled, stopTimer],
  );

  const pause = useCallback(async () => {
    stopTimer();
    const ctx = ensureCtx();
    if (ctx.state === 'running') await ctx.suspend(); // freezes the same clock UI reads
  }, [ensureCtx, stopTimer]);

  const resume = useCallback(async () => {
    const ctx = ensureCtx();
    if (ctx.state !== 'closed') {
      await ctx.resume();
      // restart scheduler; baseline remains unchanged, so UI stays in sync
      const evs = eng.events; // noop if nothing scheduled
      if (evs.length)
        await playAbsolute(evs, { startAt: ctx.currentTime - eng.baseline });
    }
  }, [ensureCtx, eng, playAbsolute]);

  const stop = useCallback(async () => {
    stopTimer();
    clearScheduled();
    const ctx = eng.ctx;
    if (ctx && ctx.state !== 'closed') {
      try {
        await ctx.suspend();
      } catch {}
    }
    eng.nextIdx = 0;
  }, [eng, stopTimer, clearScheduled]);

  const now = useCallback(() => {
    const ctx = eng.ctx;
    if (!ctx) return 0;
    return Math.max(0, ctx.currentTime - eng.baseline);
  }, [eng]);

  const state = useCallback(() => {
    const s = eng.ctx?.state ?? 'closed';
    return s as 'running' | 'suspended' | 'closed';
  }, [eng]);

  // Return a stable object (nice for deps)
  return useMemo<AudioPort>(
    () => ({
      startOnce,
      decode,
      playAbsolute,
      pause,
      resume,
      stop,
      now,
      state,
    }),
    [startOnce, decode, playAbsolute, pause, resume, stop, now, state],
  );
}
