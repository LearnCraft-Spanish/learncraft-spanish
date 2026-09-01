import type { IconName } from '@interface/components/general/Icon/Icon';
import type { TabBarItem } from '@interface/components/general/TabBar/TabBar';
import type { JSX } from 'react';
import { TabBar } from '@interface/components/general/TabBar/TabBar';
import { useLocation, useNavigate } from 'react-router-dom';

interface TabLink {
  id: string;
  to: string;
  icon: IconName;
  label: string;
  /** Exact-match only, same meaning as `NavLink`'s `end` — otherwise every
   * route would match Home's `/`. */
  end?: boolean;
}

const LINKS: TabLink[] = [
  { id: 'home', to: '/', icon: 'home', label: 'Home', end: true },
  { id: 'search', to: '/flashcardfinder', icon: 'search', label: 'Finder' },
  { id: 'quiz', to: '/quizzes', icon: 'checklist', label: 'Quiz' },
  { id: 'cards', to: '/manage-flashcards', icon: 'cards', label: 'Cards' },
];

function isLinkActive(pathname: string, to: string, end?: boolean): boolean {
  if (end) {
    return pathname === to;
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

/**
 * The persistent mobile bottom nav, mounted once in `App.tsx` — same four
 * destinations as the desktop `PrimaryNav`, but always on screen below
 * 768px instead of living inside `AppHeader`, and with the active tab
 * derived from the route rather than a per-page prop. Previously each page
 * that wanted the bar built its own `TabBarItem[]` and had to hardcode which
 * tab was active; that only ever worked for Home.
 */
export function PrimaryTabBar(): JSX.Element {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const items: TabBarItem[] = LINKS.map((link) => ({
    id: link.id,
    icon: link.icon,
    label: link.label,
    active: isLinkActive(pathname, link.to, link.end),
    onSelect: () => navigate(link.to),
  }));

  return <TabBar items={items} />;
}
