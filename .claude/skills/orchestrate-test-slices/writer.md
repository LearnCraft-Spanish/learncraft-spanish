# Writer brief

You write the tests for one PR of a slice ticket. Your prompt gives you the ticket number, the worktree, the branch, and the files you own. Write tests only for the files you own.

## Read first

- The ticket, in full: `gh issue view <n>`. Its guiding principle and its "Don't write tests for these files" list are authoritative.
- [`SKILL.md`](SKILL.md), section **Rules for every role**.
- In the worktree:
  - `CLAUDE.md`, `documentation/TESTING_STANDARDS.md` and `documentation/PR_STANDARDS.md`.
  - Every `.md` file in the folders you touch, such as BOUNDARIES, DECISIONS and README.
  - `documentation/DOMAIN_GLOSSARY.md`, where it covers your files.
- The existing colocated tests and mocks for your files (`*.test.ts(x)`, `*.mock.ts`) and `@testing/utils/createOverrideableMock.ts`. Follow the patterns they use.

## Write

- Test the clearly intended behavior and its intended failure paths. When the code checks for something explicitly, test both sides of the check.
- Assert outcomes a user or caller can observe: return values, rendered text, enabled and disabled states, the error that shows up.
- If the intent is unclear, leave it untested. Add it to "Unclear behavior — not tested" with the file:line and a one-sentence question.
- If the behavior looks wrong, add it to "Possible bugs" and leave the code as it is.
- Use the domain's real implementation and existing mocks. Put any new reusable mock next to the file it mocks, as a `*.mock.ts` built on `createOverrideableMock`.

## Self-check before you push

Apply all four checks to every test you add.

1. **Already covered?** Search the existing test files for the same behavior. If it is already asserted, drop the new test.
2. **Would it go red?** Picture breaking the line the test targets: flip a condition, change a return value, delete a call. If the test would still pass, strengthen it or drop it. You may make that break by hand to confirm the test fails, then revert it. `git diff origin/staging -- src ':!*.test.*' ':!*.mock.*'` must print nothing before you commit.
3. **On purpose?** Could you explain the asserted behavior to a user as intended? If not, move it to the Unclear list.
4. **Size.** Check `git diff --shortstat origin/staging...HEAD` against the PR size rule in `SKILL.md`. If the PR is heading toward 1,250 lines, report back to your slice orchestrator instead of pushing.

## Run

- Run the related tests:
  - `pnpm test:hexagon:ai <folders you touched>`
  - `pnpm exec vitest related --run --config vitest.config-hexagon.ts --reporter=dot <source files>`
- Run `pnpm validate:ai`. It runs `prettier --write` across the whole repo. Commit the formatting changes to your own files and use `git checkout` to revert changes to any other file.
- Use these targeted runs only; the full suite and Stryker run later.
- If a test outside your files fails or flakes, note it in your reply and leave it alone.

## Deliver

1. Commit, ending each message with the co-author line your harness specifies. Push with `git push -u origin <branch>`.
2. Write the PR body last, from the final test run. Every coverage claim must point to a test that exists, and every test count must match the run.
3. Open a draft PR: `gh pr create --draft --base staging --head <branch> --title "Tests: <area> (#<n>)" --body-file <file>`. The body contains:
   - what each file's tests cover;
   - `Part of #<ticket>` and `Part of #<tracking issue>`;
   - the commands you ran and their test counts;
   - **"Unclear behavior — not tested"**;
   - **"Possible bugs"**, written as "None" if empty;
   - any extraction, called out;
   - the paths of any new reusable mocks;
   - any file you own that has nothing clearly testable, and why;
   - the attribution line your harness specifies.
4. Reply with the PR number and URL, the line count, the files covered, the paths of any new mocks, and anything you left untested, with the reason.

After a review, you will get the reviewer's numbered findings by message. Fix them, rerun the tests and `validate:ai`, and push. Update the PR body so its claims and counts match. Reply with what changed. If you disagree with a finding, say which one and explain why.
