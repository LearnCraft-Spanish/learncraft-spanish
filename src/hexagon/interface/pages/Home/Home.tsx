import type { JSX } from 'react';
import { useHomeView } from '@application/useCases/useHomeView';
import { UiScope } from '@interface/components/general/UiScope/UiScope';
import { HomeV2 } from '@interface/pages/Home/HomeV2';
import StaffHome from '@interface/pages/Home/StaffHome';
import Menu from 'src/sections/Menu';

/**
 * Entry point for `/` for students, coaches, and admins. Limited and free
 * users never reach this component — `AppRoutes` sends them straight to the
 * legacy `Menu`. Coaches/admins see only their tools until they use the app
 * as a student, then get the same v2 home a beta-tester student does.
 */
export default function Home(): JSX.Element {
  const { view, showAdminTools } = useHomeView();

  if (view === 'staffTools') {
    return <StaffHome showAdminTools={showAdminTools} />;
  }
  if (view === 'studentV2') {
    return (
      <UiScope>
        <HomeV2 />
      </UiScope>
    );
  }
  return <Menu />;
}
