# 🔄 Pull Request Standards & Checklist

_For All Code Changes to LearnCraft Spanish_

This document establishes standards and a checklist for all pull requests to ensure code quality, maintainability, and system reliability.

---

## 🎯 Goals

- Maintain high code quality and consistency across the codebase
- Ensure all changes are properly tested and reviewed
- Prevent regressions and technical debt
- Keep the branches main, staging, and development clean and stable

---

## ✅ PR Checklist

Use this checklist before requesting review and before merging any pull request.

### 🧪 Testing Requirements

- [ ] All existing tests are passing locally
- [ ] New tests have been added according to [Testing Standards](./TESTING_STANDARDS.md)
- [ ] Tests are deterministic and do not have flaky behavior
- [ ] Manual testing has been performed for UI changes or critical flows

### 🎨 Code Quality & Standards

- [ ] Code follows the [Hexagonal Architecture Standards](../src/hexagon/ARCHITECTURE.md)
- [ ] No commented-out code (unless clearly marked as TODO with context)
- [ ] No console logs or debugging statements left in code
- [ ] Code is DRY (Don't Repeat Yourself) to a reasonable extent
- [ ] Functions and components have clear, descriptive names
- [ ] Complex logic includes explanatory comments
- [ ] TypeScript types are properly defined
- [ ] File and folder organization follows existing conventions
- [ ] No unused imports or variables
- [ ] Code adheres to existing ESLint rules

### 📝 Documentation & Communication

- [ ] PR description clearly explains:
  - [ ] What changes were made
  - [ ] Why the changes were necessary
  <!-- - [ ] How to test the changes -->
- [ ] Breaking changes are clearly documented
- [ ] New features include usage examples or documentation updates
- [ ] Complex logic includes inline comments explaining the "why"
- [ ] README or relevant docs updated if necessary

### 🔍 Code Review

- [ ] PR has been self-reviewed before requesting review from others
- [ ] PR is focused and addresses a single concern (not too large)
- [ ] All reviewer comments have been addressed or discussed
- [ ] At least one team member has approved the PR

### 🚦 CI/CD & Build

- [ ] All CI checks are passing
- [ ] No linter errors or warnings introduced
- [ ] Build completes successfully
- [ ] No console errors in the browser (for UI changes)
- [ ] Performance implications have been considered

### 🧹 Git Hygiene

- [ ] Branch is up to date with the base branch
- [ ] Commit messages are clear and descriptive
- [ ] No merge conflicts
- [ ] Sensitive information (API keys, passwords, etc.) is not committed

---

## 📏 PR Size Guidelines

**Keep PRs manageable for effective review:**

- **Small PR (< 300 lines):** Ideal - easy to review thoroughly
- **Medium PR (300-500 lines):** Acceptable - consider splitting if possible
- **Large PR (> 500 lines):** Should be exceptional - strongly consider breaking into smaller PRs

**When large PRs are necessary:**

- Provide extra context in the description
- Consider doing a pre-review walkthrough with the team
- Break down review into logical sections

---

## 🏗️ Architecture Compliance

All code must adhere to the[ hexagonal architecture pattern](../src/hexagon/ARCHITECTURE.md)

See [Testing Standards](./TESTING_STANDARDS.md) for detailed testing requirements per layer.

---

## 🔄 Review Process

### For PR Authors

1. **Before Creating PR:**
   - Complete the PR checklist above
   - Test your changes thoroughly
   - Review your own code first

2. **Creating the PR:**
   - Write a clear, descriptive title
   - Fill out the PR template completely
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
   - Performance implications

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

## 🚫 Common Issues to Avoid

- **Insufficient Testing:** Changes without adequate test coverage
- **Mixing Concerns:** PRs that try to do too many unrelated things
- **Breaking Changes:** Unintentional breaking changes to existing functionality
- **Technical Debt:** Taking shortcuts that will create future problems
- **Poor Naming:** Vague or misleading function/variable names
- **Missing Mocks:** Data-returning hooks without corresponding mock files
- **Untested Edge Cases:** Only testing the happy path
- **Mock Pollution:** Not cleaning up mocks after tests
- **Architecture Violations:** Bypassing layers or mixing concerns

---

## 🎯 Success Criteria

A PR is ready to merge when:

✅ All automated checks are passing  
✅ Code meets all quality standards  
✅ Tests are comprehensive and reliable  
✅ At least one reviewer has approved  
✅ All review comments are resolved  
✅ PR checklist is fully completed  
✅ No merge conflicts exist

---

## 📚 Related Documentation

- [Testing Standards](./TESTING_STANDARDS.md) - Detailed testing requirements and practices
- [Internal Production Checklist](./INTERNAL_PROD_CHECKLIST.md) - Additional requirements for production releases
- [Hexagonal Architecture](../src/hexagon/ARCHITECTURE.md) - Architecture pattern documentation

---

**Remember:** These standards exist to help us build better software together. They're not bureaucracy — they're guardrails that enable us to move fast with confidence.
