import type { TabBarItem } from '@interface/components/home/TabBar/TabBar';
import type { JSX } from 'react';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { EntryCard } from '@interface/components/home/EntryCard/EntryCard';
import { HelpRow } from '@interface/components/home/HelpRow/HelpRow';
import { QuizCTA } from '@interface/components/home/QuizCTA/QuizCTA';
import { TabBar } from '@interface/components/home/TabBar/TabBar';
import { useNavigate } from 'react-router-dom';
import styles from './HomeV2.module.scss';

/**
 * The student v2 home screen. One responsive tree, not separate desktop and
 * mobile components — both entry-card sets render and CSS shows the one
 * that matches the viewport, so the CTA stays the first child of the
 * scrolling column at every width.
 */
export function HomeV2(): JSX.Element {
  const navigate = useNavigate();

  const goToQuiz = (): void => navigate('/myflashcards');
  const goToFinder = (): void => navigate('/flashcardfinder');
  const goToManageFlashcards = (): void => navigate('/manage-flashcards');
  const goToOfficialQuizzes = (): void => navigate('/officialquizzes');
  const goToCustomQuiz = (): void => navigate('/customquiz');
  const goToQuizzes = (): void => navigate('/quizzes');
  const goToHelp = (): void => navigate('/get-help');

  const tabs: TabBarItem[] = [
    {
      id: 'home',
      icon: 'home',
      label: 'Home',
      active: true,
      onSelect: () => navigate('/'),
    },
    { id: 'search', icon: 'search', label: 'Finder', onSelect: goToFinder },
    { id: 'quiz', icon: 'checklist', label: 'Quiz', onSelect: goToQuizzes },
    {
      id: 'cards',
      icon: 'cards',
      label: 'Cards',
      onSelect: goToManageFlashcards,
    },
  ];

  return (
    <PageShell>
      <div className={styles.column}>
        <QuizCTA onGo={goToQuiz} />

        <div className={styles.desktopEntries}>
          <EntryCard
            icon="cards"
            title="My flashcards"
            meta="Review and manage your saved cards"
            onGo={goToManageFlashcards}
          />
          <EntryCard
            icon="search"
            title="Flashcard Finder"
            meta="Search the full course catalog"
            onGo={goToFinder}
          />
          <EntryCard
            icon="trophy"
            title="Official quizzes"
            meta="Test yourself against a lesson quiz"
            onGo={goToOfficialQuizzes}
          />
        </div>

        <div className={styles.mobileEntries}>
          <EntryCard
            icon="trophy"
            title="Official quizzes"
            meta="Test yourself against a lesson quiz"
            onGo={goToOfficialQuizzes}
          />
          <EntryCard
            icon="checklist"
            title="Custom quiz"
            meta="Build a quiz from any lesson range"
            onGo={goToCustomQuiz}
          />
          <EntryCard
            icon="search"
            title="Flashcard Finder"
            meta="Search the full course catalog"
            onGo={goToFinder}
          />
        </div>

        <HelpRow onGo={goToHelp} />
      </div>

      <TabBar items={tabs} />
    </PageShell>
  );
}
