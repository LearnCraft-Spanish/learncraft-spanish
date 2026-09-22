import type { JSX } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { VocabLookupV2 } from '@interface/pages/GetHelp/VocabLookup/VocabLookupV2';
import GetHelpPage from '@interface/pages/GetHelpPage';

/**
 * Vocab lookup switch on the student's UI version. Non-beta students who
 * land on `/get-help/vocab` still see the old GetHelpPage search.
 */
export default function VocabLookup(): JSX.Element {
  const { version } = useStudentUiVersion();

  return version === 'v2' ? <VocabLookupV2 /> : <GetHelpPage />;
}
