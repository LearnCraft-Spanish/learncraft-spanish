import type { JSX } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { ReviewMyFlashcardsV1 } from '@interface/pages/ReviewMyFlashcards/ReviewMyFlashcardsV1';
import { ReviewMyFlashcardsV2 } from '@interface/pages/ReviewMyFlashcards/ReviewMyFlashcardsV2';

/**
 * Route entry for `/myflashcards`. The legacy setup menu stays the fallback
 * for students who are not beta testers.
 */
export default function ReviewMyFlashcards(): JSX.Element {
  const { version } = useStudentUiVersion();

  return version === 'v2' ? <ReviewMyFlashcardsV2 /> : <ReviewMyFlashcardsV1 />;
}
