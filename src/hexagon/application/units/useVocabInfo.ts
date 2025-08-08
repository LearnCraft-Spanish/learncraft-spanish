import type { Vocabulary } from '@learncraft-spanish/shared';
import { useLessonsByVocabulary } from '../queries/useLessonsByVocab';

export default function useVocabInfo(vocab: Vocabulary) {
  const { lessonsByVocabulary: lessons, loading: lessonsLoading } =
    useLessonsByVocabulary(vocab.id);
  const word = vocab.word;
  const type = vocab.type;
  const descriptor = vocab.descriptor;
  const subcategory = vocab.subcategory;
  const verb = type === 'verb' ? vocab.verb : null;
  const conjugationTags = type === 'verb' ? vocab.conjugationTags : null;

  return {
    word,
    descriptor,
    subcategory,
    verb,
    conjugationTags,
    lessons,
    lessonsLoading,
  };
}
