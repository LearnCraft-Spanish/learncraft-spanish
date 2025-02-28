import type { Flashcard } from 'src/types/interfaceDefinitions';
import {
  formatEnglishText,
  formatSpanishText,
} from 'src/functions/formatFlashcardText';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';

import {
  AddAddingRemoveCustom,
  SelectExampleButton,
  VocabularyButton,
} from './general';

import './ExamplesTable.scss';

interface FormatExampleForTableProps {
  example: Flashcard;
  showSpanglishLabel?: boolean;
  forceShowVocab?: boolean;
  selectExample?: (recordId: number) => void;
  selectedExampleId?: number | null;
  studentContext?: boolean;
}

export default function ExampleListItem({
  example,

  //Optional props
  showSpanglishLabel = false,
  forceShowVocab = false,
  selectExample = undefined,
  selectedExampleId = null,
  studentContext = true,
}: FormatExampleForTableProps) {
  const { activeStudentQuery } = useActiveStudent();

  return (
    <div className="exampleCard" key={example.recordId}>
      {selectExample && (
        <SelectExampleButton
          recordId={example.recordId}
          selectedExampleId={selectedExampleId}
          selectExample={selectExample}
        />
      )}
      <div className="exampleCardSpanishText">
        {formatSpanishText(example.spanglish, example.spanishExample)}
      </div>
      <div className="exampleCardEnglishText">
        {formatEnglishText(example.englishTranslation)}
      </div>

      {showSpanglishLabel && (
        <div
          className={
            example.spanglish === 'spanglish'
              ? 'spanglishLabel'
              : 'spanishLabel'
          }
        >
          <h4>{example.spanglish === 'spanglish' ? 'Spanglish' : 'Spanish'}</h4>
        </div>
      )}
      {(example.vocabComplete || forceShowVocab) && (
        <VocabularyButton vocabIncluded={example.vocabIncluded} />
      )}
      {studentContext && activeStudentQuery.data?.role === 'student' && (
        <AddAddingRemoveCustom example={example} />
      )}
    </div>
  );
}
