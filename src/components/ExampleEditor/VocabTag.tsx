import type { Vocabulary } from '../../interfaceDefinitions';
import x from '../../resources/icons/x_dark.svg';

interface VocabTagProps {
  vocab: Vocabulary;
  removeFromVocabByRecordId?: (recordId: string | number) => void;
}

export const VocabTag: React.FC<VocabTagProps> = ({
  vocab,
  removeFromVocabByRecordId,
}) => {
  const { descriptionOfVocabularySkill, recordId } = vocab;

  return (
    <div key={recordId} className="vocabTag">
      <p>{descriptionOfVocabularySkill}</p>
      {removeFromVocabByRecordId !== undefined && (
        <button
          className="removeTagButton"
          type="button"
          onClick={() => removeFromVocabByRecordId(recordId)}
        >
          <img src={x} alt="Remove from Vocab" />
        </button>
      )}
    </div>
  );
};
