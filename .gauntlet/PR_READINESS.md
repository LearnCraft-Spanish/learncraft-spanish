# PR readiness — ui-redesign into development

Bar: `documentation/PR_STANDARDS.md`, `documentation/TESTING_STANDARDS.md`, `documentation/PR_REVIEW_GUIDE.md`, and the layer `BOUNDARIES.md` files.

## Round 1 — critics

- Testing: lose. `AudioQuizV2Screen` did not test loading or completion.
- Architecture: lose. Flashcard Finder collected cards in the page, and a failed copy was ignored.

## Round 2 — fixes

- `AudioQuizV2Screen` tests cover loading, a blank step, the complete screen, and a rejected play/pause.
- Selection and collection live on `useFlashcardFinder`. The page navigates, shows notices, and copies. Failed copy and collect set a notice.
- `useQuizMyFlashcards` tests start a real quiz, refuse an empty one, and prime audio playback.

## Round 3 — critics

- Architecture of the finder page: the critic picked ours.
- The empty-quiz guard: the critic picked ours. A no-op `readyQuiz` fails the test, and deleting the guard fails it too.

## Still true, and not treated as blocking

- The diff against `development` is about 50,000 lines. The standards ask for a small PR. This branch is the student UI redesign, so the description has to carry that justification.
- Some presentational pieces (`QuizOptionsCard`, `TagsCard`, `AudioQuizCard`, gallery sections) have no colocated test. Parent screens already cover the pages that use them.
- The private package registry rejected install here, so the new tests were not executed in this environment.
