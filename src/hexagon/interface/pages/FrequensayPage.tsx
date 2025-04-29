import { FromToLessonSelector } from 'src/components/LessonSelector';
import { Loading } from 'src/components/Loading';
import { useFrequensay } from '../../application/units/useFrequensay';
import CustomVocabulary from '../components/frequensay/CustomVocabulary';
export const FrequensayPage: React.FC = () => {
  const {
    isReady,
    isLoading,
    isError,
    userInput,
    updateUserInput,
    passageLength,
    comprehensionPercentage,
    unknownWordCount,
    copyTable,
  } = useFrequensay();

  return (
    <div className="frequensay">
      {isLoading ? (
        <Loading message="Loading Frequensay Data..." />
      ) : isError ? (
        <div>Error</div>
      ) : (
        isReady && (
          <>
            <h2>FrequenSay</h2>
            <div className="tempBox">
              <FromToLessonSelector />
            </div>
            <CustomVocabulary />
            <form onSubmit={(e) => e.preventDefault}>
              <h3>Text to Check:</h3>
              <textarea
                value={userInput}
                rows={12}
                cols={85}
                onChange={(e) => updateUserInput(e.target.value)}
              ></textarea>
            </form>
            <div>
              <p>{`Word Count: ${passageLength.current}`}</p>
              <p>{`Words Known: ${comprehensionPercentage.current}%`}</p>
            </div>
            {unknownWordCount.length > 0 && (
              <div>
                <h3>{unknownWordCount.length} Unknown Words:</h3>
                <div className="buttonBox">
                  <button type="button" onClick={copyTable}>
                    Copy Word List
                  </button>
                </div>
                {unknownWordCount.map((item) => (
                  <div className="exampleCard" key={item.word}>
                    <div className="exampleCardSpanishText">
                      <h3>{item.word}</h3>
                    </div>
                    <div className="exampleCardEnglishText">
                      <h4>{item.count}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};
