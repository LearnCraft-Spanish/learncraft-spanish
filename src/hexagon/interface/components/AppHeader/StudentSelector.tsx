import type { AppUserAbbreviation } from '@learncraft-spanish/shared';
import type { JSX, ReactNode } from 'react';
import { useStudentSelector } from '@application/useCases/useStudentSelector';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Field } from '@interface/components/general/Field/Field';
import { Popover } from '@interface/components/general/Popover/Popover';
import { TextInput } from '@interface/components/general/TextInput/TextInput';
import { useNavigate } from 'react-router-dom';
import styles from './StudentSelector.module.scss';

interface StudentSelectorProps {
  open: boolean;
  onClose: () => void;
  /** The control the panel hangs from. */
  trigger: ReactNode;
  align?: 'start' | 'end';
}

/**
 * The coach/admin "Use as student" panel: search the student list, pick one
 * to switch the whole app to their view, or (while already using the app as
 * someone) exit back to the coach/admin view. Both actions land on Home.
 */
export function StudentSelector({
  open,
  onClose,
  trigger,
  align = 'start',
}: StudentSelectorProps): JSX.Element {
  const {
    searchTerm,
    setSearchTerm,
    options,
    isListLoading,
    isUsingAsStudent,
    isSelecting,
    error,
    selectStudent,
    exitUsingAsStudent,
    clearError,
  } = useStudentSelector();
  const navigate = useNavigate();

  const close = (): void => {
    clearError();
    onClose();
  };

  const pick = async (student: AppUserAbbreviation): Promise<void> => {
    if (await selectStudent(student)) {
      onClose();
      navigate('/');
    }
  };

  const exit = (): void => {
    exitUsingAsStudent();
    onClose();
    navigate('/');
  };

  const hasSearch = searchTerm.trim() !== '';

  return (
    <Popover
      open={open}
      onDismiss={close}
      trigger={trigger}
      align={align}
      shadow="menu"
      mobilePlacement="centered"
    >
      <div
        className={styles.panel}
        role="dialog"
        aria-label={isUsingAsStudent ? 'Change student' : 'Use as student'}
      >
        <div className={styles.title}>
          {isUsingAsStudent ? 'Change student' : 'Use as student'}
        </div>

        <Field htmlFor="student-selector-search" label="Find a student">
          <TextInput
            id="student-selector-search"
            type="search"
            leadingIcon="search"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Name or email"
            disabled={isSelecting}
          />
        </Field>

        {error !== null && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {isListLoading && hasSearch && (
          <p className={styles.status}>Loading students…</p>
        )}
        {!isListLoading && hasSearch && options.length === 0 && (
          <p className={styles.status}>No students match “{searchTerm}”.</p>
        )}
        {!hasSearch && (
          <p className={styles.status}>
            Type a name or email to find a student.
          </p>
        )}

        {options.length > 0 && (
          <ul className={styles.results} aria-label="Students">
            {options.map((student) => (
              <li key={student.emailAddress}>
                <button
                  type="button"
                  className={styles.result}
                  disabled={isSelecting}
                  onClick={() => {
                    void pick(student);
                  }}
                >
                  <span className={styles.resultName}>
                    {student.name || student.emailAddress}
                  </span>
                  {student.name !== '' && (
                    <span className={styles.resultEmail}>
                      {student.emailAddress}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {isUsingAsStudent && (
          <div className={styles.footer}>
            <Button variant="secondary" size="sm" onClick={exit}>
              Exit student view
            </Button>
          </div>
        )}
      </div>
    </Popover>
  );
}
