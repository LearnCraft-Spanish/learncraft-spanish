import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import useFrequensay from '@application/useCases/useFrequensay';
import CustomVocabulary from '@interface/components/frequensay/CustomVocabulary';
import FrequensaySetup from '@interface/components/frequensay/FrequensaySetup';
import TextToCheck from '@interface/components/frequensay/TextToCheck';
import UnknownWords from '@interface/components/frequensay/UnknownWords';
import './FrequensayPage.scss';
export default function FrequenSayPage() {
  // TO DO: Reduce to one use case hook
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
