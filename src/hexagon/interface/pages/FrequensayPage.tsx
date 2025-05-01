import { useEffect } from 'react';
import { FromToLessonSelector } from 'src/components/LessonSelector';
import { Loading } from 'src/components/Loading';
import { useFrequensay } from 'src/hexagon/application/useCases/useFrequensay';
import CustomVocabulary from '../components/frequensay/CustomVocabulary';
import TextToCheck from '../components/frequensay/TextToCheck';
import UnknownWords from '../components/frequensay/UnknownWords';

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
      console.log(error);
    }
  }, [isError, error]);
  return (
    <div>
      <h2>FrequenSay</h2>
      <div>
        <FromToLessonSelector />
      </div>
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
        <div>Something went wrong</div>
      )}
    </div>
  );
}
