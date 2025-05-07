import { useEffect } from 'react';
import { Loading } from 'src/components/Loading';
import { useFrequensay } from 'src/hexagon/application/useCases/useFrequensay';
import CustomVocabulary from '../components/frequensay/CustomVocabulary';
import FrequensaySetup from '../components/frequensay/FrequensaySetup';
import TextToCheck from '../components/frequensay/TextToCheck';
import UnknownWords from '../components/frequensay/UnknownWords';
import './FrequensayPage.scss';
export default function FrequenSayPage() {
  const {
    isSuccess,
    isError,
    isLoading,
    error,

    CustomVocabularyProps,
    TextToCheckProps,
    UnknownWordsProps,
  } = useFrequensay();

  useEffect(() => {
    if (isError) {
      console.error(error);
    }
  }, [isError, error]);
  return (
    <div className="frequensay-page">
      <h2>FrequenSay</h2>
      <FrequensaySetup />
      {isError ? (
        <div>Error Loading Frequensay Data</div>
      ) : isLoading ? (
        <Loading message="Loading Frequensay Data..." />
      ) : isSuccess ? (
        <>
          <CustomVocabulary {...CustomVocabularyProps} />
          <TextToCheck {...TextToCheckProps} />
          <UnknownWords {...UnknownWordsProps} />
        </>
      ) : (
        <div></div>
      )}
    </div>
  );
}
