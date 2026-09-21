import type { JSX, ReactNode } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import styles from './UiScope.module.scss';

interface UiScopeProps {
  children: ReactNode;
}

export function UiScope({ children }: UiScopeProps): JSX.Element {
  const { version } = useStudentUiVersion();

  return (
    <div className={styles.root} data-ui={version}>
      {children}
    </div>
  );
}
