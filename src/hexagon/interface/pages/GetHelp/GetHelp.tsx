import type { JSX } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { GetHelpV2 } from '@interface/pages/GetHelp/GetHelpV2';
import GetHelpPage from '@interface/pages/GetHelpPage';

/**
 * Help hub switch on `ui.student.help.v2`. Flag off keeps the legacy vocab
 * search page that used to live at `/get-help`.
 */
export default function GetHelp(): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.help.v2');

  return version === 'v2' ? <GetHelpV2 /> : <GetHelpPage />;
}
