export interface AudioElementState {
  playing: boolean;
  currentTime: number;
  src: string;
  onEnded: () => void;
}

export interface AudioPort {
  // Plays the current audio element
  play: () => Promise<void>;

  // Pauses the current audio element
  pause: () => Promise<void>;

  // Stateful representation of the current time of the playing audio
  isPlaying: boolean;
  currentTime: number;

  // Changes the current audio element
  changeCurrentAudio: (current: AudioElementState) => Promise<void>;

  // Updates the audio queue
  updateCurrentAudioQueue: (newQueue: {
    english: string;
    spanish: string;
  }) => Promise<{
    englishDuration: number | null;
    spanishDuration: number | null;
  }>;

  updateNextAudioQueue: (newQueue: {
    english: string;
    spanish: string;
  }) => Promise<{
    englishDuration: number | null;
    spanishDuration: number | null;
  }>;
}
