import type { JSX } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { FlashcardManagerV1 } from '@interface/pages/FlashcardManager/FlashcardManagerV1';
import { FlashcardManagerV2 } from '@interface/pages/FlashcardManager/FlashcardManagerV2';

export default function FlashcardManager(): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.flashcards.manager.v2');

  return version === 'v2' ? <FlashcardManagerV2 /> : <FlashcardManagerV1 />;
}
