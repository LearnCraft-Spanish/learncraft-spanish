import type { AudioTranscodingPort } from '../ports/audioTranscodingPort';
import { useFfmpegAudio } from '@infrastructure/audioTranscoding/useFfmpegAudio';

export function useAudioTranscoderAdapter(): AudioTranscodingPort {
  return useFfmpegAudio();
}
