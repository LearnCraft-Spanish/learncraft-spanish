import type { JSX } from 'react';
import { GetHelpV2 } from '@interface/pages/GetHelp/GetHelpV2';

/**
 * Auth0-free specimen for the Get Help hub. `GetHelpV2` is presentational
 * (navigate + external links only); no fixtures needed.
 */
export function GetHelpSpecimen(): JSX.Element {
  return (
    <div data-gauntlet-specimen="get-help">
      <GetHelpV2 />
    </div>
  );
}
