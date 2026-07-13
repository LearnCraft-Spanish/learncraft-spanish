import { useAllCoachesQuery } from '@application/queries/CoachQueries/useAllCoachesQuery';
import { useMemo } from 'react';

export function CoachDropdown({
  coachId,
  onChange,
  editMode,
  label = 'Coach',
  defaultOptionText = undefined,
  required = false,
}: {
  coachId: number;
  onChange: (value: number) => void;
  editMode: boolean;
  label?: string;
  defaultOptionText?: string;
  required?: boolean;
}) {
  const { coaches, isLoading } = useAllCoachesQuery();

  const dataReady = !isLoading && coaches && coaches.length > 0;

  const coachName = useMemo(() => {
    const corrector = coaches?.find((coach) => coach.coach_id === coachId);
    return corrector ? corrector.fullName : 'No Coach Found';
  }, [coachId, coaches]);

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
            value={coachId}
            onChange={(e) => onChange(Number(e.target.value))}
          >
            <option value={''}>{defaultOptionText || 'Select'}</option>

            {coaches?.map((coach) => (
              <option key={coach.coach_id} value={coach.coach_id}>
                {coach.fullName}
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

export function CoachDropdown_LEGACY({
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
  const { coaches, isLoading } = useAllCoachesQuery();

  const dataReady = !isLoading && coaches && coaches.length > 0;

  const coachName = useMemo(() => {
    const corrector = coaches?.find((coach) => coach.email === coachEmail);
    return corrector ? corrector.fullName : 'No Coach Found';
  }, [coachEmail, coaches]);

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

            {coaches?.map((coach) => (
              <option key={coach.email} value={coach.email}>
                {coach.fullName}
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
