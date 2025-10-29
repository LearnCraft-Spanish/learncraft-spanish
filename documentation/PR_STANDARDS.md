# Pull Request Standards & Checklist

_For All Code Changes to LearnCraft Spanish_

This document establishes standards and a checklists for all pull requests to ensure code quality, maintainability, and system reliability.

---

## Goals

- Maintain high code quality
- Ensure all changes are properly tested and reviewed
- Keep the branches main, staging, and development clean and stable

---

## PR Checklist Overview

Below are the guidelines that are represented on the PR Author & PR Reviewer Checklists.

### Testing Requirements

- All existing tests are passing locally
- New tests have been added according to [Testing Standards](./TESTING_STANDARDS.md)
- Tests are deterministic and do not have flaky behavior
- Manual testing has been performed for UI changes or critical flows

### Code Quality & Standards

- Code follows the [Hexagonal Architecture Standards](../src/hexagon/ARCHITECTURE.md)
- No console logs or debugging statements left in code
- Code is DRY (Don't Repeat Yourself) to a reasonable extent
- Variable & function names are clear and consistant
- Complex logic includes explanatory comments
- TypeScript types are properly defined
- Code passes lint & typecheck

### Documentation & Communication

- PR description clearly explains:
  - What changes were made
  - Why the changes were necessary
- Breaking changes are clearly documented
- New features include usage examples or documentation updates
- Complex logic includes inline comments explaining the "why"
- README or relevant docs updated if necessary

### Code Review

- PR has been self-reviewed before requesting review from others
- PR is focused and addresses a single concern (not too large)
- All reviewer comments have been addressed or discussed
- At least one team member has approved the PR

### Git Hygiene

- Branch is up to date with the base branch
- Commit messages are clear and descriptive
- No merge conflicts
- Sensitive information (API keys, passwords, etc.) is not committed

---

## PR Size Guidelines

**Keep PRs manageable for effective review:**

- **Small PR (< 300 lines):** Ideal - easy to review thoroughly
- **Medium PR (300-500 lines):** Acceptable - consider splitting if possible
- **Large PR (> 500 lines):** Should be exceptional - strongly consider breaking into smaller PRs

**When large PRs are necessary:**

- Provide extra context in the description
- Consider doing a pre-review walkthrough with the team
- Break down review into logical sections

---

## Architecture Compliance

All code must adhere to the[ hexagonal architecture pattern](../src/hexagon/ARCHITECTURE.md)

See [Testing Standards](./TESTING_STANDARDS.md) for detailed testing requirements per layer.

---

## Review Process

### For PR Authors

1. **Before Creating PR:**
   - Test your changes thoroughly
   - Review your own code first

2. **Creating the PR:**
   - Write a clear, descriptive title & description
   - Complete the PR checklist below
   - Add appropriate labels
   - Assign relevant reviewers

3. **During Review:**
   - Respond to feedback promptly
   - Ask for clarification if needed
   - Re-request review after making changes

### For Reviewers

1. **Review Focus Areas:**
   - Logic correctness and edge cases
   - Test coverage and quality
   - Architecture compliance
   - Code readability and maintainability

2. **Providing Feedback:**
   - Be constructive and specific
   - Distinguish between blocking issues and suggestions
   - Ask questions to understand intent
   - Acknowledge good solutions

3. **Approval Criteria:**
   - All checklist items are satisfied
   - Tests are comprehensive and passing
   - Code meets quality standards
   - No outstanding blocking concerns

---

## Common Issues to Avoid

- **Insufficient Testing:** Changes without adequate test coverage
- **Mixing Concerns:** PRs that try to do too many unrelated things
- **Breaking Changes:** Unintentional breaking changes to existing functionality
- **Technical Debt:** Taking shortcuts that will create future problems
- **Poor Naming:** Vague or misleading function/variable names
- **Missing Mocks:** Data-returning hooks without corresponding mock files
- **Untested Edge Cases:** Only testing the happy path
- **Architecture Violations:** Bypassing layers or mixing concerns

---

## 📚 Related Documentation

- [Testing Standards](./TESTING_STANDARDS.md) - Detailed testing requirements and practices
- [Internal Production Checklist](./INTERNAL_PROD_CHECKLIST.md) - Additional requirements for production releases
- [Hexagonal Architecture](../src/hexagon/ARCHITECTURE.md) - Architecture pattern documentation

---

**Remember:** These standards exist to help us build better software together. They're not bureaucracy — they're guardrails that enable us to move fast with confidence.

---

## 📋 Copy-Paste Checklists

### For PR Authors

_Copy this checklist into your PR description before requesting review._

```
## PR Author Checklist
Quick Access Checkbox emoticons: --✅---❌--

### Testing
- [] All existing tests are passing locally
- [] New tests added according to Testing Standards
- [] Tests are deterministic (no flaky behavior)
- [] Manual testing performed for UI changes or critical flows

### Code Quality
- [] Code follows Hexagonal Architecture Standards
- [] No console logs or debugging statements
- [] Code is DRY to a reasonable extent
- [] Functions and components have clear, descriptive names
- [] Complex logic includes explanatory comments
- [] TypeScript types are properly defined
- [] File and folder organization follows existing conventions
- [] pnpm validate has been run & passes

### Documentation
- [] PR description explains what changed and why
- [] Breaking changes are clearly documented
- [] New features include usage examples or documentation updates
- [] README or relevant docs updated if necessary

### CI/CD & Build
- [] All CI checks are passing
- [] Build completes successfully
- [] No console errors in the browser (for UI changes)

### Git Hygiene
- [] Branch is up to date with the base branch
- [] Commit messages are clear and descriptive
- [] No merge conflicts
- [] Sensitive information is not committed

### Self-Review
- [] I have reviewed my own code
- [] PR is focused and addresses a single concern
- [] PR size is reasonable (< 500 lines preferred)

**Ready for review!**
```

---

### For PR Reviewers

_Copy this checklist to track your review progress._

```
## PR Review Checklist
Quick Access Checkbox emoticons: --✅---❌--

**PR Title:** ___________
**Author:** ___________
**Reviewer:** ___________
**Date:** ___________

### Initial Assessment
- [] PR description is clear and complete
- [] PR size is manageable (consider requesting split if > 500 lines)
- [] Changes align with stated purpose

### Testing Review
- [] Tests are passing in CI
- [] New/modified code has appropriate test coverage
- [] Tests are clear and test the right things
- [] No flaky or unreliable tests introduced

### Code Quality Review
- [] Code follows Hexagonal Architecture pattern
- [] Logic is clear and easy to understand
- [] No unnecessary complexity or over-engineering
- [] Functions/components are appropriately sized
- [] Naming is clear and consistent
- [] No code duplication
- [] TypeScript types are properly used
- [] No console logs or debug code left in

### Architecture Review
- [] Changes respect layer boundaries
- [] Dependencies flow in the correct direction
- [] External integrations are properly abstracted

### 📝 Documentation Review
- [] Complex logic is well-documented
- [] Breaking changes are documented
- [] Relevant docs/README updated

### ✅ Final Check
- [] All my comments/questions have been addressed
- [] No blocking concerns remain
- [] Changes improve the codebase

**Review Status:**
- [ ] ✅ Approved
- [ ] 💬 Comments/Questions
- [ ] ❌ Request Changes

**Additional Notes:**
___________
```
