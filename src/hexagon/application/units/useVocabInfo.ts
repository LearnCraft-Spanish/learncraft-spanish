import type {
  Lesson,
  Subcategory,
  Verb,
  Vocabulary,
} from '@learncraft-spanish/shared';
import { useLessonsByVocabulary } from '@application/queries/useLessonsByVocab';

export interface VocabInfo {
  word: string;
  descriptor: string;
  subcategory: Subcategory;
  verb: Verb | null;
  conjugationTags: string[] | null;
  lessons: Lesson[] | null;
  lessonsLoading: boolean;
}
export function useVocabInfo(vocab: Vocabulary): VocabInfo {
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
