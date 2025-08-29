export interface AddToMyFlashcardsButtonsProps {
  exampleIsCollected: boolean;
  exampleIsCustom: boolean;
  exampleIsPending: boolean;
  addFlashcard: () => void;
  removeFlashcard: () => void;
}
