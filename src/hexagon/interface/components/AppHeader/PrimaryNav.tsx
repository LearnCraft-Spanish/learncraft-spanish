import type { JSX } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './PrimaryNav.module.scss';

const LINKS: Array<{ to: string; label: string; end?: boolean }> = [
  { to: '/', label: 'Home', end: true },
  { to: '/flashcardfinder', label: 'Flashcard Finder' },
  { to: '/myflashcards', label: 'My flashcards' },
  { to: '/officialquizzes', label: 'Quizzes' },
];

/**
 * The centered desktop nav passed as `AppHeader`'s `children`. Hidden below
 * 768px by `AppHeader`'s own CSS — this component renders unconditionally
 * and never needs to know the viewport.
 */
export function PrimaryNav(): JSX.Element {
  return (
    <>
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            isActive ? styles.linkActive : styles.link
          }
        >
          {link.label}
        </NavLink>
      ))}
    </>
  );
}
