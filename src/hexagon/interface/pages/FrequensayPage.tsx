import { useEffect } from 'react';
import { Loading } from 'src/components/Loading';
import { useFrequensay } from 'src/hexagon/application/useCases/useFrequensay';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import CustomVocabulary from '../components/frequensay/CustomVocabulary';
import FrequensaySetup from '../components/frequensay/FrequensaySetup';
import TextToCheck from '../components/frequensay/TextToCheck';
import UnknownWords from '../components/frequensay/UnknownWords';
import './FrequensayPage.scss';
export default function FrequenSayPage() {
  const { selectedToLesson } = useSelectedLesson();
  const {
    isError,
    isLoading,
    error,

    FrequensaySetupProps,
    CustomVocabularyProps,
    TextToCheckProps,
    UnknownWordsProps,
  } = useFrequensay();

  const initialDataLoading =
    isLoading && TextToCheckProps.userInput.length <= 0;

  const frequensayIsEnabled =
    FrequensaySetupProps.isFrequensayEnabled && selectedToLesson;

  useEffect(() => {
    if (isError) {
      console.error(error);
    }
  }, [isError, error]);
  return (
    <div className="frequensay-page">
      <h2>FrequenSay</h2>
      <FrequensaySetup {...FrequensaySetupProps} />
      <div className="frequensay-page__content">
        {isError ? (
          <div>Error Loading Frequensay Data</div>
        ) : initialDataLoading ? (
          <Loading message="Loading Frequensay Data..." />
        ) : frequensayIsEnabled ? (
          <>
            <CustomVocabulary {...CustomVocabularyProps} />
            <TextToCheck {...TextToCheckProps} isLoading={isLoading} />
            {!isLoading && <UnknownWords {...UnknownWordsProps} />}
          </>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
