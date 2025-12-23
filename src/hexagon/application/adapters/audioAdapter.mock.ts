import type { AudioPort } from '@application/ports/audioPort';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockAudioAdapter: AudioPort = {
  play: vi.fn<() => Promise<void>>(),
  pause: vi.fn<() => Promise<void>>(),
  isPlaying: false,
  currentTime: 0,
  changeCurrentAudio: vi.fn<() => Promise<void>>(),
  cleanupAudio: vi.fn<() => void>(),
  getAudioDurationSeconds: vi.fn<() => Promise<number>>(),
};

export const {
  mock: mockAudioAdapter,
  override: overrideMockAudioAdapter,
  reset: resetMockAudioAdapter,
} = createOverrideableMock<AudioPort>(defaultMockAudioAdapter);

export default mockAudioAdapter;
