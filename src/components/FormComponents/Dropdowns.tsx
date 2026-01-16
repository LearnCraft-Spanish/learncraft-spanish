import { useMemo } from 'react';
import { useCoachList } from 'src/hooks/CoachingData/queries';

export function CoachDropdown({
  coachEmail,
  onChange,
  editMode,
  label = 'Coach',
  defaultOptionText = undefined,
  required = false,
}: {
  coachEmail: string;
  onChange: (value: string) => void;
  editMode: boolean;
  label?: string;
  defaultOptionText?: string;
  required?: boolean;
}) {
  const { coachListQuery } = useCoachList();

  const dataReady = coachListQuery.isSuccess;

  const coachName = useMemo(() => {
    const corrector = coachListQuery.data?.find(
      (user) => user.user.email === coachEmail,
    );
    return corrector ? corrector.user.name : 'No Coach Found';
  }, [coachEmail, coachListQuery.data]);

  const sortedCoaches = useMemo(() => {
    if (!coachListQuery.data) {
      return [];
    }
    return coachListQuery.data?.sort((a, b) =>
      a.user.name.localeCompare(b.user.name),
    );
  }, [coachListQuery.data]);

  return (
    dataReady && (
      <div className="lineWrapper">
        <label
          className={`label ${required && editMode ? 'required' : ''}`}
          htmlFor="coachDropdown"
        >
          {`${label}:`}
        </label>
        {editMode ? (
          <select
            id="coachDropdown"
            className="content"
            value={coachEmail}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value={''}>{defaultOptionText || 'Select'}</option>

            {sortedCoaches.map((coach) => (
              <option key={coach.coach} value={coach.user.email}>
                {coach.user.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="content">{coachName}</p>
        )}
      </div>
    )
  );
}
