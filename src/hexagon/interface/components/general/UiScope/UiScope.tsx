import type { StudentUiFlag } from '@domain/uiFlags';
import type { JSX, ReactNode } from 'react';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import styles from './UiScope.module.scss';

interface UiScopeProps {
  flag: StudentUiFlag;
  children: ReactNode;
}

export function UiScope({ flag, children }: UiScopeProps): JSX.Element {
  const { version } = useStudentUiVersion(flag);

  return (
    <div className={styles.root} data-ui={version}>
      {children}
    </div>
  );
}
