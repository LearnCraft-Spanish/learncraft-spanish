import { MenuButton } from '@interface/components/general/Buttons';
import { useEffect, useState } from 'react';
import './QuizEnd.scss';

export default function AudioQuizEnd({
  speakingOrListening,
  isAutoplay,
  restartQuiz,
  returnToQuizSetup,
}: {
  speakingOrListening: 'speaking' | 'listening';
  isAutoplay: boolean;
  restartQuiz: () => void;
  returnToQuizSetup: () => void;
}) {
  const [countdown, setCountdown] = useState(20);
  const [isCountingDown, setIsCountingDown] = useState(isAutoplay);

  useEffect(() => {
    if (!isAutoplay || !isCountingDown) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsCountingDown(false);
          restartQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoplay, isCountingDown, restartQuiz]);

  const handleRestartNow = () => {
    setIsCountingDown(false);
    restartQuiz();
  };

  return (
    <div className="QuizEndWrapper">
      <h2>
        {speakingOrListening === 'speaking' ? 'Speaking' : 'Listening'} Quiz
        Complete!
      </h2>
      <p>Congratulations! You've completed the quiz.</p>

      {isAutoplay && isCountingDown && (
        <div className="countdown-section">
          <p>
            The quiz will automatically restart in <strong>{countdown}</strong>{' '}
            seconds.
          </p>
        </div>
      )}

      {isAutoplay && isCountingDown && (
        <div className="buttonBox">
          <button
            type="button"
            onClick={handleRestartNow}
            className="restart-now-btn"
          >
            Restart Quiz Now
          </button>
        </div>
      )}
      <div className="buttonBox">
        <button type="button" onClick={returnToQuizSetup} className="setup-btn">
          Return to Quiz Setup
        </button>
      </div>

      <div className="buttonBox">
        <MenuButton />
      </div>
    </div>
  );
}
