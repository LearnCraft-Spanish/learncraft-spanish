export type StudentUiFlag =
  | 'ui.student.help.v2'
  | 'ui.student.flashcards.finder.v2'
  | 'ui.student.flashcards.manager.v2'
  | 'ui.student.home.v2'
  | 'ui.student.customquiz.v2';

export type DevUiFlag = 'ui.dev.gallery';

export type UiFlag = StudentUiFlag | DevUiFlag;

export type UiVersion = 'v1' | 'v2';
