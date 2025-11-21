export const getAudioUrlForExample = (
  exampleId: number,
): { english: string; spanish: string } => {
  const AUDIO_STORAGE_LOCATION =
    'https://dbexamples.s3.us-east-2.amazonaws.com/dbexamples/';
  const AUDIO_FILE_EXTENSION = '.mp3';
  const englishUrl = `${AUDIO_STORAGE_LOCATION}ex${exampleId}en${AUDIO_FILE_EXTENSION}`;
  const spanishUrl = `${AUDIO_STORAGE_LOCATION}ex${exampleId}la${AUDIO_FILE_EXTENSION}`;
  return { english: englishUrl, spanish: spanishUrl };
};
