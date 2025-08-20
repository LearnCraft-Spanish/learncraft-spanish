import useFrequensay from '@application/useCases/useFrequensay';
import { useSelectedCourseAndLessons } from 'src/hexagon/application/coordinators/hooks/useSelectedCourseAndLessons';
import CustomVocabulary from '../components/frequensay/CustomVocabulary';
import FrequensaySetup from '../components/frequensay/FrequensaySetup';
import TextToCheck from '../components/frequensay/TextToCheck';
import UnknownWords from '../components/frequensay/UnknownWords';
import './FrequensayPage.scss';
export default function FrequenSayPage() {
  const { toLesson } = useSelectedCourseAndLessons();
  const {
    spellingsDataError,
    spellingsDataLoading,

    FrequensaySetupProps,
    CustomVocabularyProps,
    TextToCheckProps,
    UnknownWordsProps,
  } = useFrequensay();

  // this is so that if a user unselects a lesson, the Frequensay is disabled until they select a lesson again
  const frequensayIsEnabled =
    FrequensaySetupProps.isFrequensayEnabled && toLesson?.id;

  return (
    <div className="frequensay-page">
      <h2>FrequenSay</h2>
      <FrequensaySetup {...FrequensaySetupProps} />
      <div className="frequensay-page__content">
        {spellingsDataError ? (
          <div>Error Fetching Frequensay Data</div>
        ) : frequensayIsEnabled ? (
          <>
            <CustomVocabulary {...CustomVocabularyProps} />
            <TextToCheck
              {...TextToCheckProps}
              isLoading={spellingsDataLoading}
            />
            {!spellingsDataLoading && <UnknownWords {...UnknownWordsProps} />}
          </>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
