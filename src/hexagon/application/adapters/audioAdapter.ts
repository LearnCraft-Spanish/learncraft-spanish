import type { AudioPort } from '@application/ports/audioPort';
import { useAudioInfrastructure } from '@infrastructure/audio/audioInfrastructure';

export const useAudioAdapter = (): AudioPort => {
  const audioInfrastructure = useAudioInfrastructure();

  return audioInfrastructure;
};
