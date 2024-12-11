import play from '../../resources/icons/play.svg';
import pause from '../../resources/icons/pause.svg';
import type { Flashcard } from '../../interfaceDefinitions';
import AddToMyFlashcardsButtons from '../Quiz/AddToMyFlashcardsButtons';
interface AudioFlashcardProps {
  currentExampleText: string | JSX.Element;
  incrementCurrentStep: () => void;
  autoplay: boolean;
  progressStatus: number;
  pausePlayback: () => void;
  resumePlayback: () => void;
  isPlaying: boolean;
  currentExample: Flashcard | undefined;
  isStudent: boolean;
  currentStep: 'question' | 'answer' | 'guess' | 'hint';
  incrementExample: () => void;
  onRemove: () => void;
  incrementOnAdd?: boolean;
}

export default function AudioFlashcardComponent({
  currentExampleText,
  incrementCurrentStep,
  autoplay,
  progressStatus,
  pausePlayback,
  resumePlayback,
  isPlaying,
  currentExample,
  isStudent,
  currentStep,
  incrementExample,
  incrementOnAdd = true,
  onRemove,
}: AudioFlashcardProps): JSX.Element {
  function handlePlayPauseClick(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    e.stopPropagation();
    if (isPlaying) {
      pausePlayback();
    } else {
      resumePlayback();
    }
  }
  // function onRemoveOfOwnedFlashcard(): void {
  //   if (onRemove) {
  //     onRemove();
  //   } else {
  //     incrementExample();
  //   }
  // }
  return (
    <div
      className="audioFlashcard"
      // Clicking flashcard for next step only works if autoplay is off
      onClick={!autoplay ? () => incrementCurrentStep() : () => {}}
    >
      <p>{currentExampleText}</p>
      {autoplay && (
        <button
          type="button"
          className="audioPlayPauseButton"
          onClick={(e) => handlePlayPauseClick(e)}
          aria-label="Play/Pause"
        >
          <img src={isPlaying ? pause : play} alt="play/pause" />
        </button>
      )}
      {autoplay && (
        <div
          className="progressStatus"
          style={{ width: `${progressStatus * 100}%` }}
        />
      )}
      {isStudent && currentStep !== 'question' && currentStep !== 'guess' && (
        <AddToMyFlashcardsButtons
          example={currentExample}
          incrementExampleNumber={incrementExample}
          incrementOnAdd={incrementOnAdd}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}
