export interface AudioElementState {
  currentTime: number;
  src: string;
  onEnded: () => void;
  playOnLoad: boolean;
}

export interface AudioPort {
  // Unlocks the audio element for programmatic playback (must be called synchronously from a user gesture)
  primeAudioElement: (silenceUrl: string) => void;

  // Plays the current audio element
  play: () => Promise<void>;

  // Pauses the current audio element
  pause: () => Promise<void>;

  // Stateful representation of the current time of the playing audio
  isPlaying: boolean;
  currentTime: number;

  // Changes the current audio element
  changeCurrentAudio: (current: AudioElementState) => Promise<void>;

  // Completely cleans up audio state
  cleanupAudio: () => void;

  // Gets the duration of an audio file in seconds
  getAudioDurationSeconds: (audioUrl: string) => Promise<number>;
}
