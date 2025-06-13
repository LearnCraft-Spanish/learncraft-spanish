import type { Lesson } from '@LearnCraft-Spanish/shared';
import './LessonsTable.scss';

interface LessonsTableProps {
  lessons: Lesson[] | null;
  selectedVocabularyWord: string;
  isLoading?: boolean;
}

export default function LessonsTable({
  lessons,
  selectedVocabularyWord,
  isLoading = false,
}: LessonsTableProps) {
  return (
    <div className="lessons-table">
      <h2>Lessons Teaching "{selectedVocabularyWord}"</h2>

      {isLoading ? (
        <div className="lessons-table__loading">
          <p>Loading lessons...</p>
        </div>
      ) : !lessons || lessons.length === 0 ? (
        <div className="lessons-table__empty-state">
          <p>No lessons found that teach this vocabulary.</p>
        </div>
      ) : (
        <div className="lessons-table__content">
          <table className="lessons-table__table">
            <thead>
              <tr>
                <th>Lesson</th>
                <th>Course</th>
                <th>Lesson Number</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="lessons-table__row">
                  <td>{lesson.subtitle || `Lesson ${lesson.lessonNumber}`}</td>
                  <td>{lesson.courseName}</td>
                  <td>{lesson.lessonNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
