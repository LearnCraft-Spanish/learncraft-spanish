import type { JSX } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import Loading from '@interface/components/Loading/Loading';

interface LoadingScreenProps {
  message: string;
}

/**
 * Version-aware full-screen loader. v1 keeps the legacy spinner on the
 * paper canvas; v2 wraps it in `PageShell` so the `--lcs-color-page`
 * surface covers the parchment.
 */
export function LoadingScreen({ message }: LoadingScreenProps): JSX.Element {
  const { version } = useStudentUiVersion();

  if (version === 'v2') {
    return (
      <PageShell>
        <Loading message={message} />
      </PageShell>
    );
  }

  return <Loading message={message} />;
}
