import type { JSX } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { FlashcardFinderV1 } from '@interface/pages/FlashcardFinder/FlashcardFinderV1';
import { FlashcardFinderV2 } from '@interface/pages/FlashcardFinder/FlashcardFinderV2';

export default function FlashcardFinder(): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.flashcards.finder.v2');

  return version === 'v2' ? <FlashcardFinderV2 /> : <FlashcardFinderV1 />;
}
