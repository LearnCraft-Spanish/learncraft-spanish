import type { Vocabulary } from '../../interfaceDefinitions';

interface VocabCardProps {
  vocab: Vocabulary;
}

export const VocabCard: React.FC<VocabCardProps> = ({ vocab }) => {
  const { wordIdiom, descriptionOfVocabularySkill, recordId } = vocab;

  return (
    <div key={recordId} className="vocabCard">
      <h3>{wordIdiom}</h3>
      <p>{descriptionOfVocabularySkill}</p>
      {!!vocab.conjugationTags && <p>{vocab.conjugationTags}</p>}
      {!!vocab.vocabularySubcategorySubcategoryName && (
        <p>{vocab.vocabularySubcategorySubcategoryName}</p>
      )}
    </div>
  );
};
