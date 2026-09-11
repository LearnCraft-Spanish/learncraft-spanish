# Audio Quiz v2 — reuse + divergence ledger

Implements `design_handoff_audio_quiz/README.md` ("Audio Quiz Redesign") behind
the `ui.student.audioquiz.v2` flag. Mirrors the `textQuiz/` v2 pattern:
props-only presentational components, one domain function for step-dependent
copy, a thin screen bridge from `useAudioQuiz` to the presentational tree.

## Component tree

```
AudioQuizV2Screen (Quizzing/AudioQuiz/)     — bridges AudioQuizReturn → props
  AudioQuizV2                               — layout, keyboard, chip selection
    AudioQuizProgressHeader                 — eyebrow + "12 / 20" + deck bar
    AudioQuizCard                           — sentence/guess/audio-only body
      AudioQuizPlayButton                   — 44px play/pause circle
      WordChips / WordPanel / WordPanelModal (textQuiz — reused, not rebuilt)
    AudioQuizDock                           — replay + primary + prev/next
      AudioKeyboardHints                    — desktop-only shortcut legend
  AudioQuizEndV2                            — quiz-complete, autoplay on/off
```

Domain: `domain/functions/audioQuizCopy.ts` — `audioQuizCopy()` (bodyKind,
instructionTitle, primaryLabel, replayLabel, quizName) and
`audioQuizTextRuns()` (splits `**target**` markdown into bold/regular runs).

## Reused as-is (non-negotiable, per task brief)

- **`WordChips`, `WordPanel`, `WordPanelModal`** (textQuiz) — identical
  desktop-panel / mobile-modal split as `TextQuizV2`. `AudioQuizV2` computes
  the same `selectedWordId` local state and the same `isMobile` branch.
- **Primitives** — `Button` (Get help / Hide help), `Icon`, `Eyebrow`. No new
  primitives were needed.
- **Tokens** — `--lcs-*` only; no new hex literals except where the handoff's
  value already has no token (documented one-offs, called out in each
  `.module.scss`, same convention as `QuizCard` / `QuizDock`).

## Built new (evaluated + rejected reuse)

- **`AudioQuizPlayButton`** instead of `CardAudioButton`. `CardAudioButton`
  owns its own `<audio>` element and always plays a fixed clip; the audio
  quiz's play/pause is a controlled toggle over audio `useAudioQuiz` already
  owns and drives (autoplay timing, buffered silence between steps, etc.).
  Wrapping that in a component that also mounts an `<audio>` tag would fight
  the hook for control of playback.
- **`AudioQuizCard` / `AudioQuizDock`** instead of `QuizCard` / `QuizDock`.
  Text quiz's card flips and swipes to grade; its dock is a hard/easy or
  prev/next pair. Audio's card never flips (it advances through four steps)
  and never grades (audio quizzes are ungraded), and its dock is
  replay + primary + prev/next with different sizing (52/44 vs 44/56) and a
  different desktop split (220px replay + flex primary vs. two equal
  buttons). Branching one component on quiz kind would have meant an
  `if (isAudioQuiz)` fork through most of the render, so two files instead.
- **`AudioQuizProgressHeader`** instead of `QuizProgressHeader`. Text quiz's
  header carries SRS tallies and a per-step rail (already removed there
  too, historically) that audio has no equivalent of. The handoff drops
  those for audio, but the two-tier quiz title (category eyebrow + form
  subtitle, from `domain/functions/quizTitle`) is shared with text quiz —
  see divergence #3 below, which updates the original handoff-only
  single-tier eyebrow.
- **`AudioKeyboardHints`** instead of `KeyboardHints`. Different shortcuts
  (space play/pause · ↑ next step · ← → card) with no SRS/flip branch, so a
  shared component would just be two unrelated hint lists behind one prop.
- **`AudioQuizEndV2`** is new — the legacy `AudioQuizEnd` (untouched, still
  used by the v1 audio quiz) is a plain unstyled screen. Text quiz now has a
  parallel `TextQuizEndV2` (under `textQuiz/`, gated by
  `ui.student.textquiz.v2` via `TextQuizV2Screen`); audio's complete screen
  was built to the handoff's two complete states (autoplay on/off) directly
  rather than extending the text-quiz end screen, because the two quiz kinds
  diverge on countdown / skipped / added-card copy.

## Divergences from the handoff (intentional)

1. **Word details: `WordPanel` / `WordPanelModal`, not the handoff's inline navy card.**
   The handoff's mobile frame renders the Deep Navy word-detail card inline,
   in-flow, below the vocabulary chips. `TextQuizV2` already established
   that this card is too cramped inside the card's own scroll region on
   narrow viewports and instead portals it to a scrimmed dialog
   (`WordPanelModal`). Audio quiz's card has the same width and the same
   help-open layout problem, so it follows the same fix rather than
   reintroducing the cramped inline layout the text quiz redesign moved
   away from. Desktop also reuses the existing `WordPanel` (single-column
   with close control) rather than the handoff's two-column grid — the
   real v2 panel is the source of truth for tag details across quizzes.
2. **Vocabulary chips: `WordChips` selected state is Deep Navy, not Celestial Blue.**
   The handoff paints selected chips `#449AC2`. `WordChips` (shared with
   text quiz) uses `--lcs-color-surface-dark` for the selected chip. We
   keep the shared component rather than forking chip colors per quiz.
3. **Desktop-only back arrow in `AudioQuizProgressHeader` (matches text).**
   The handoff's mobile app header already carries a "Setup" back control
   outside this feature's scope; the progress block itself still has no
   mobile arrow so the counter stays balanced. Desktop now mirrors
   `QuizProgressHeader`: an `arrowLeft` `IconButton` ("Back to quiz setup")
   bound to `onExit` / `cleanupFunction`. Mobile keeps no in-header exit.
4. **Vocabulary chip ordering only when the Answer-step text is Spanish.**
   `orderVocabularyByAppearance` needs the _Spanish_ sentence to place chips
   in reading order. `AudioQuizV2Props` only carries the current step's
   `displayText` + `isSpanishText`, not a separate Spanish-sentence field.
   For speaking's Answer step (Spanish text) ordering works exactly like
   text quiz. For listening's Answer step (English text) there is no
   Spanish sentence in scope to order against, so chips render in
   `vocabulary`'s given order instead of guessing at a match against English
   text. **Open question** — flagged below.
5. **`AudioKeyboardHints` renders inside `AudioQuizDock`, not as a sibling.**
   `KeyboardHints` in text quiz is a sibling of `QuizDock` inside
   `TextQuizV2`. Audio's desktop legend sits in the dock's own second row,
   next to `Previous card` / `Next card` (handoff: "right side is a keyboard
   hint row" _within_ the same row as the nav buttons), so `AudioQuizDock`
   owns its layout and renders it directly rather than `AudioQuizV2` doing
   so and relying on external CSS to reach into the dock's row.
6. **`AudioQuizEndV2`'s countdown accepts a controlled `countdown` prop.**
   Added on top of the handoff's spec (which only has an internal timer) so
   the visual-gauntlet specimen can freeze the capture at a stable
   countdown frame — the handoff's own interactive prototype starts its
   demo at `countdown: 14` for the same reason. Uncontrolled behavior
   (`countdownSeconds`, defaulting to 20) matches the handoff and the
   legacy `AudioQuizEnd` exactly otherwise. Primary copy matches legacy
   (`"{Speaking|Listening} Quiz Complete!"`, congratulations body,
   `"The quiz will automatically restart in N seconds."`, button labels).
7. **"Review them in my flashcards" is presentational only.** The handoff's
   complete-screen prototype gives this row a pointer cursor but no real
   handler (`AudioQuizEndV2Props` in the task brief lists no navigation
   callback either). Rendered as a static row with the chevron rather than
   inventing a navigation contract the brief did not ask for. **Open
   question** — flagged below.
8. **Two-tier title added after the initial handoff.** The handoff's
   `AudioQuizProgressHeader` was a single eyebrow line hardcoding
   `"{Speaking|Listening} quiz · my flashcards"`, which was wrong for
   Custom Quiz (never "my flashcards") and gave every audio quiz the same
   category regardless of which page mounted it. It now takes the same
   `eyebrow`/`subtitle` two-tier shape as `QuizProgressHeader` — the
   category eyebrow ("Custom Quiz" / "My Flashcards Quiz") comes from a new
   `quizCategory` prop set by the screen bridge (`RegularAudioQuiz` = fixed
   `'custom'`, `ReviewMyFlashcardsAudioQuiz` = fixed `'myFlashcards'`); the
   subtitle ("Speaking Quiz" / "Listening Quiz") is derived from
   `audioQuizType`. Both go through `domain/functions/quizTitle`, shared
   with the text quiz's title logic.

## Open questions for a follow-up

- Does mobile need an in-quiz exit affordance beyond app chrome (e.g. an
  "X" or browser-back listener), or is desktop-only + mobile chrome enough?
- Is the vocabulary-chip-ordering gap for listening's English Answer step
  worth closing by threading the Spanish sentence through as an additional
  prop, or is unordered-but-correct acceptable for that one step?
- Does "Review them in my flashcards" on the autoplay-off complete screen
  need a real destination (e.g. navigate to the flashcard manager), and if
  so, who owns that prop — `AudioQuizEndV2Props` or the screen bridge?
- `skippedCount` (cards dropped for bad audio) and `addedCount` (flashcards
  added mid-quiz) are accepted by `AudioQuizEndV2` but nothing in
  `AudioQuizV2Screen` currently computes and passes them — `useAudioQuiz`
  does not expose either today. Left as an explicit gap rather than
  guessing at a computation.

## Untouched

`AudioQuiz.tsx` and `AudioBasedReview.css` (the v1 screen) are unmodified —
`RegularAudioQuiz` / `ReviewMyFlashcardsAudioQuiz` branch on
`useStudentUiVersion('ui.student.audioquiz.v2')` before ever calling either
version's code, same shape as `RegularTextQuiz`.
