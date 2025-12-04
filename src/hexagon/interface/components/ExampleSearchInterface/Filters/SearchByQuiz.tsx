export interface SearchByQuizProps {
  courseCode: string;
  quizNumber: number | '';
  onCourseCodeChange: (value: string) => void;
  onQuizNumberChange: (value: number | '') => void;
}

export function SearchByQuiz({
  courseCode,
  quizNumber,
  onCourseCodeChange,
  onQuizNumberChange,
}: SearchByQuizProps) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <div>Course Code</div>
          <input
            type="text"
            value={courseCode}
            onChange={(event) => onCourseCodeChange(event.target.value)}
            placeholder="e.g. A1, B1"
            style={{ padding: '0.5rem', minWidth: '12rem' }}
          />
        </div>
        <div>
          <div>Quiz Number</div>
          <input
            type="number"
            value={quizNumber}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              if (Number.isNaN(nextValue)) {
                onQuizNumberChange('');
              } else {
                onQuizNumberChange(nextValue);
              }
            }}
            placeholder="e.g. 1"
            style={{ padding: '0.5rem', width: '6rem' }}
          />
        </div>
      </div>
    </div>
  );
}
