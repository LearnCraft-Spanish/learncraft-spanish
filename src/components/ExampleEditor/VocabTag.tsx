import type { Vocabulary } from 'src/types/interfaceDefinitions';
import x from 'src/assets/icons/x_dark.svg';

interface VocabTagProps {
  vocab: Vocabulary;
  removeFromVocabList?: (vocabName: string) => void;
}

export const VocabTag: React.FC<VocabTagProps> = ({
  vocab,
  removeFromVocabList,
}) => {
  const { descriptionOfVocabularySkill, vocabName, recordId } = vocab;

  return (
    <div key={recordId} className="vocabTag">
      <p>{descriptionOfVocabularySkill}</p>
      {removeFromVocabList !== undefined && (
        <button
          className="removeTagButton"
          type="button"
          onClick={() => removeFromVocabList(vocabName)}
        >
          <img src={x} alt="Remove from Vocab" />
        </button>
      )}
    </div>
  );
};
