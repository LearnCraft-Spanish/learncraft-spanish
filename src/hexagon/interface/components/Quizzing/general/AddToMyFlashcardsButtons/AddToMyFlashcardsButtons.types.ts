export interface AddToMyFlashcardsButtonsProps {
  exampleIsCollected: boolean;
  exampleIsCustom: boolean;
  exampleIsAdding: boolean;
  exampleIsRemoving: boolean;
  addFlashcard: () => void;
  removeFlashcard: () => void;
}
