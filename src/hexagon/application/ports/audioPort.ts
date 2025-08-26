// application/ports/audioTransport.ts
export interface ClipInfo {
  url: string;
  audioDur: number; // decoded duration in seconds
}

export type AudioEvent =
  | { kind: 'audio'; url: string; start: number; dur: number } // times are relative to baseline
  | { kind: 'gap'; start: number; dur: number };

export interface AudioPort {
  // Call once inside a user gesture to satisfy autoplay
  startOnce: () => Promise<void>;

  // Decode exactly (for durations / prefetch)
  decode: (url: string) => Promise<ClipInfo>;

  // Schedule an absolute timeline (relative to baseline=0). Optional startAt shifts playhead.
  playAbsolute: (
    events: AudioEvent[],
    opts?: { startAt?: number },
  ) => Promise<void>;

  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>; // cancels future events; keeps context (and consent) alive

  // Authoritative clock: seconds since the current play baseline
  now: () => number;

  // Helpful but optional
  state: () => 'running' | 'suspended' | 'closed';
}
