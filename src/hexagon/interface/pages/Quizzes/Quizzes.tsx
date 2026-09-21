import type { JSX } from 'react';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { EntryCard } from '@interface/components/home/EntryCard/EntryCard';
import { useNavigate } from 'react-router-dom';
import styles from './Quizzes.module.scss';

/**
 * The quizzes landing page. Its only job is letting the user choose which
 * of the three quizzing experiences they want, then handing off to that
 * route — no quiz logic lives here.
 */
export function Quizzes(): JSX.Element {
  const navigate = useNavigate();

  const goToMyFlashcards = (): void => navigate('/myflashcards');
  const goToCustomQuiz = (): void => navigate('/customquiz');
  const goToOfficialQuiz = (): void => navigate('/officialquizzes');

  return (
    <PageShell>
      <div className={styles.column}>
        <h1 className={styles.title}>Quizzes</h1>
        <div className={styles.entries}>
          <EntryCard
            icon="cards"
            title="Quiz my flashcards"
            meta="Review the cards you've saved"
            onGo={goToMyFlashcards}
          />
          <EntryCard
            icon="checklist"
            title="Custom quiz"
            meta="Build a quiz from any lesson range"
            onGo={goToCustomQuiz}
          />
          <EntryCard
            icon="trophy"
            title="Official quiz"
            meta="Test yourself against a lesson quiz"
            onGo={goToOfficialQuiz}
          />
        </div>
      </div>
    </PageShell>
  );
}

export default Quizzes;
