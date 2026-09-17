import type { JSX } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { GetHelpV2 } from '@interface/pages/GetHelp/GetHelpV2';
import GetHelpPage from '@interface/pages/GetHelpPage';

/**
 * Help hub switch on the student's UI version. Non-beta students keep the
 * legacy vocab search page that used to live at `/get-help`.
 */
export default function GetHelp(): JSX.Element {
  const { version } = useStudentUiVersion();

  return version === 'v2' ? <GetHelpV2 /> : <GetHelpPage />;
}
