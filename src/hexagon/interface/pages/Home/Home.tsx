import type { JSX } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { HomeV2 } from '@interface/pages/Home/HomeV2';
import Menu from 'src/sections/Menu';

/**
 * Student-only entry point for `/`. Coach, admin, and limited roles never
 * reach this component — `AppRoutes` sends them straight to the legacy
 * `Menu` — so the `v1` branch here is the student's own fallback when they
 * are not a beta tester.
 */
export default function Home(): JSX.Element {
  const { version } = useStudentUiVersion();

  return version === 'v2' ? <HomeV2 /> : <Menu />;
}
