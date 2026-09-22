import {
  isStackBack,
  isStudentStackPath,
  normalizeStackPath,
  stackParentPath,
  stackTitle,
} from '@interface/navigation/studentMobileStack';
import { describe, expect, it } from 'vitest';

describe('studentMobileStack', () => {
  it('strips trailing slashes except on the root', () => {
    expect(normalizeStackPath('/')).toBe('/');
    expect(normalizeStackPath('/quizzes/')).toBe('/quizzes');
    expect(normalizeStackPath('/officialquizzes/lcsp/5/')).toBe(
      '/officialquizzes/lcsp/5',
    );
  });

  it('does not treat Home as a stack path', () => {
    expect(isStudentStackPath('/')).toBe(false);
  });

  it('treats student v2 hubs and nested official quizzes as stack paths', () => {
    expect(isStudentStackPath('/flashcardfinder')).toBe(true);
    expect(isStudentStackPath('/manage-flashcards')).toBe(true);
    expect(isStudentStackPath('/quizzes')).toBe(true);
    expect(isStudentStackPath('/get-help')).toBe(true);
    expect(isStudentStackPath('/get-help/vocab')).toBe(true);
    expect(isStudentStackPath('/customquiz')).toBe(true);
    expect(isStudentStackPath('/myflashcards')).toBe(true);
    expect(isStudentStackPath('/officialquizzes')).toBe(true);
    expect(isStudentStackPath('/officialquizzes/lcsp/5')).toBe(true);
  });

  it('does not treat coach/admin routes as stack paths', () => {
    expect(isStudentStackPath('/frequensay')).toBe(false);
    expect(isStudentStackPath('/coaching-dashboard')).toBe(false);
  });

  it('returns the hard-coded parent for each stack screen', () => {
    expect(stackParentPath('/')).toBeNull();
    expect(stackParentPath('/flashcardfinder')).toBe('/');
    expect(stackParentPath('/manage-flashcards')).toBe('/');
    expect(stackParentPath('/quizzes')).toBe('/');
    expect(stackParentPath('/get-help')).toBe('/');
    expect(stackParentPath('/get-help/vocab')).toBe('/get-help');
    expect(stackParentPath('/customquiz')).toBe('/');
    expect(stackParentPath('/myflashcards')).toBe('/');
    expect(stackParentPath('/officialquizzes')).toBe('/');
    expect(stackParentPath('/officialquizzes/lcsp/5')).toBe('/officialquizzes');
    expect(stackParentPath('/frequensay')).toBeNull();
  });

  it('returns the default header title for each hub', () => {
    expect(stackTitle('/flashcardfinder')).toBe('Flashcard Finder');
    expect(stackTitle('/manage-flashcards')).toBe('Flashcard Manager');
    expect(stackTitle('/quizzes')).toBe('Quizzes');
    expect(stackTitle('/get-help')).toBe('Help & walkthroughs');
    expect(stackTitle('/get-help/vocab')).toBe('Vocab lookup');
    expect(stackTitle('/customquiz')).toBe('Set up your quiz');
    expect(stackTitle('/myflashcards')).toBe('Quiz my flashcards');
    expect(stackTitle('/officialquizzes')).toBe('Choose a quiz');
    expect(stackTitle('/officialquizzes/si1m/3')).toBe('Official Quizzes');
    expect(stackTitle('/')).toBeNull();
  });

  it('treats a move to an ancestor as back', () => {
    expect(isStackBack('/quizzes', '/')).toBe(true);
    expect(isStackBack('/get-help/vocab', '/get-help')).toBe(true);
    expect(isStackBack('/officialquizzes/lcsp/5', '/officialquizzes')).toBe(
      true,
    );
    expect(isStackBack('/officialquizzes/lcsp/5', '/')).toBe(true);
    expect(isStackBack('/customquiz', '/')).toBe(true);
  });

  it('treats a move to a descendant or sibling as forward', () => {
    expect(isStackBack('/', '/quizzes')).toBe(false);
    expect(isStackBack('/quizzes', '/customquiz')).toBe(false);
    expect(isStackBack('/customquiz', '/quizzes')).toBe(false);
    expect(isStackBack('/officialquizzes/lcsp/5', '/quizzes')).toBe(false);
    expect(isStackBack('/flashcardfinder', '/quizzes')).toBe(false);
    expect(isStackBack('/quizzes', '/flashcardfinder')).toBe(false);
    expect(isStackBack('/get-help', '/get-help/vocab')).toBe(false);
  });
});
