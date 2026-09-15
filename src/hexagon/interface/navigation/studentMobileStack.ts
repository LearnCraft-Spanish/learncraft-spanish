/**
 * Hard-coded parent tree and titles for the mobile student-v2 stack
 * header. Header back follows this map, not browser history.
 *
 * Home (`/`) is the root and is not itself a stack screen.
 */

const PARENT_BY_PATH: Record<string, string> = {
  '/flashcardfinder': '/',
  '/manage-flashcards': '/',
  '/quizzes': '/',
  '/get-help': '/',
  '/get-help/vocab': '/get-help',
  '/customquiz': '/quizzes',
  '/myflashcards': '/quizzes',
  '/officialquizzes': '/quizzes',
};

const TITLE_BY_PATH: Record<string, string> = {
  '/flashcardfinder': 'Flashcard Finder',
  '/manage-flashcards': 'Flashcard Manager',
  '/quizzes': 'Quizzes',
  '/get-help': 'Help & walkthroughs',
  '/get-help/vocab': 'Vocab lookup',
  '/customquiz': 'Set up your quiz',
  '/myflashcards': 'Quiz my flashcards',
  '/officialquizzes': 'Choose a quiz',
};

export function normalizeStackPath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.replace(/\/+$/, '');
  }
  return pathname;
}

function isOfficialQuizPath(path: string): boolean {
  return path.startsWith('/officialquizzes/');
}

/** True for student v2 surfaces that get stack chrome (not Home). */
export function isStudentStackPath(pathname: string): boolean {
  const path = normalizeStackPath(pathname);
  if (path === '/') {
    return false;
  }
  return TITLE_BY_PATH[path] !== undefined || isOfficialQuizPath(path);
}

/** Parent route for the header back arrow. `null` on Home or unknown paths. */
export function stackParentPath(pathname: string): string | null {
  const path = normalizeStackPath(pathname);
  if (path === '/') {
    return null;
  }
  if (isOfficialQuizPath(path)) {
    return '/officialquizzes';
  }
  return PARENT_BY_PATH[path] ?? null;
}

/** Default header title. Nested official quizzes wait for an in-page override. */
export function stackTitle(pathname: string): string | null {
  const path = normalizeStackPath(pathname);
  if (isOfficialQuizPath(path)) {
    return 'Official Quizzes';
  }
  return TITLE_BY_PATH[path] ?? null;
}

/**
 * True when navigating `from` → `to` is a move to an ancestor in the
 * parent tree (a back). Sibling jumps and unknown destinations are forward.
 */
export function isStackBack(from: string, to: string): boolean {
  const target = normalizeStackPath(to);
  let current: string | null = normalizeStackPath(from);
  const seen = new Set<string>();

  while (current !== null) {
    if (seen.has(current)) {
      return false;
    }
    seen.add(current);
    const parent = stackParentPath(current);
    if (parent === null) {
      return false;
    }
    if (parent === target) {
      return true;
    }
    current = parent;
  }

  return false;
}
