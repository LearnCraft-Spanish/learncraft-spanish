export interface AudioElementState {
  currentTime: number;
  src: string;
  onEnded: () => void;
  playOnLoad: boolean;
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
}
