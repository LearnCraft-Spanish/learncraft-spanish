import type { SkillTag } from '@learncraft-spanish/shared';

/* ------------------ Flashcard Filtering State ------------------ */
export interface CustomQuizFilterState {
  // Exclude Spanglish
  excludeSpanglish: boolean | undefined;
  updateExcludeSpanglish: (excludeSpanglish: boolean) => void;
  // Audio Only
  audioOnly: boolean | undefined;
  updateAudioOnly: (audioOnly: boolean) => void;
  // Tag Search
  tagSearchTerm: string;
  updateTagSearchTerm: (target?: EventTarget & HTMLInputElement) => void;
  tagSuggestions: SkillTag[];
  addSkillTagToFilters: (tagKey: string) => void;
  removeTagFromSuggestions: (tagId: string) => void;

  // Selected Tags
  skillTags: SkillTag[];
  removeSkillTagFromFilters: (tagId: string) => void;
}

/* ------------------ Quiz Setup State ------------------ */

export interface CustomQuizUniversalSetupState {
  quizType: 'audio' | 'text';
  updateQuizType: (quizType: 'audio' | 'text') => void;

  collectedFlashcardsOnly: boolean;
  updateCollectedFlashcardsOnly: (collectedFlashcardsOnly: boolean) => void;
  quizLength: number;
  updateQuizLength: (quizLength: number) => void;
}

export interface CustomTextQuizSetupState {
  spanishFirst: boolean;
  updateSpanishFirst: (spanishFirst: boolean) => void;
}

export interface CustomAudioQuizSetupState {
  autoplay: boolean;
  updateAutoplay: (autoplay: boolean) => void;
  listeningOrSpeaking: 'listening' | 'speaking';
  updateListeningOrSpeaking: (
    listeningOrSpeaking: 'listening' | 'speaking',
  ) => void;
}
