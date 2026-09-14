import type { JSX } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { VocabLookupV2 } from '@interface/pages/GetHelp/VocabLookup/VocabLookupV2';
import GetHelpPage from '@interface/pages/GetHelpPage';

/**
 * Vocab lookup switch on `ui.student.help.v2`. Flag off keeps the legacy
 * GetHelpPage search so a v1 student who lands on `/get-help/vocab` still
 * sees the old tool.
 */
export default function VocabLookup(): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.help.v2');

  return version === 'v2' ? <VocabLookupV2 /> : <GetHelpPage />;
}
