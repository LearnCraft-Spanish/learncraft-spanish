import type { JSX } from 'react';
import { useHomeView } from '@application/useCases/useHomeView';
import { UiScope } from '@interface/components/general/UiScope/UiScope';
import { CtaHome } from '@interface/pages/Home/CtaHome';
import { HomeV2 } from '@interface/pages/Home/HomeV2';
import StaffHome from '@interface/pages/Home/StaffHome';

/**
 * Entry point for `/` for everyone signed in. Coaches/admins see only their
 * tools until they use the app as a student, then get the same home a
 * student does. Limited and free users get a CTA-led home.
 */
export default function Home(): JSX.Element {
  const { view, showAdminTools, ctas, entries } = useHomeView();

  if (view === 'staffTools') {
    return <StaffHome showAdminTools={showAdminTools} />;
  }
  if (view === 'student') {
    return (
      <UiScope>
        <HomeV2 />
      </UiScope>
    );
  }
  return (
    <UiScope>
      <CtaHome ctas={ctas} entries={entries} />
    </UiScope>
  );
}
