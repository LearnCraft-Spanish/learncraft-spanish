# Example Usage: Lead Time Tracking

This document shows how to properly tag commits to track lead time for features and hotfixes.

## Example Workflow

### 1. Starting a Feature or HotFix

When you create a new feature branch and make the first commit:

```bash
# Create and checkout a new feature branch
git checkout -b feature/user-authentication

# Make an Initial commit, and tag it with a I- tag.
git add .
git commit -m "Intial Commit Message"
git tag -a I-Feature-123 -m "I-Feature-123"
git push && git push --tags
```

### 2. Development

Continue making commits normally:

```bash
git commit -m "Add login form component"
git commit -m "Implement authentication logic"
git commit -m "Add password validation"
```

### 3. Completing the Feature

When merging to production, tag the merge commit with the D- tag:

```bash
# Merge to main/production branch
git checkout main
git merge feature/user-authentication

# Tag the merge commit with D- tag
# Make/complete the merge commit first, then add the tag (tag gets added to current commit, so we want to add it to the merge commit once it is completed)
git tag -a D-Feature-123 -m "D-Feature-123"
```

## Example Hotfix Workflow

## Literally the eact same as a feature, but the tag name is HotFix:

```
(I|D)-HotFix-(number)
```

## Running the Analysis

After tagging commits properly, run the lead time analysis:

```bash
# Run lead time analysis only
pnpm run lead-time

# Run all metrics including lead time
pnpm run metrics

# Run directly from the lead-time folder
node METRICS/lead-time/lead_time_tracker.js
```

## Expected Output

With properly tagged commits, you should see output like:

```
📊 Analyzing lead time metrics for the past 30 days...

Found 25 commits in the past 30 days
Found 3 features/hotfixes with tags

📈 Lead Time Analysis Results:
   Total completed features/hotfixes: 3
   Incomplete features/hotfixes: 0
   Overall average lead time: 2d 6h
   Min lead time: 4h 30m
   Max lead time: 4d 12h
   Features (2): 3d 2h average
   Hotfixes (1): 6h 45m average

📋 Completed Features/Hotfixes:
   Feature-123: 2d 4h (2024-01-15 → 2024-01-17)
   Feature-124: 4d 12h (2024-01-18 → 2024-01-22)
   HotFix-456: 6h 45m (2024-01-23 → 2024-01-23)
```

## Important Notes

1. **Number Consistency**: Use the same number for both I- and D- tags of the same feature/hotfix
2. **Tag Placement**:
   - I- tags go on the first commit of a feature/hotfix branch
   - D- tags go on the merge commit to production
3. **Case Sensitivity**: The script is case-insensitive for "Feature" and "HotFix"
4. **Time Period**: The script analyzes the past 30 days by default
5. **File Organization**: Lead time tracking files are organized in `METRICS/lead-time/` folder

## Troubleshooting

If you see "Incomplete features/hotfixes", check:

- Missing I- tag: The feature/hotfix was completed but never had a start tag
- Missing D- tag: The feature/hotfix was started but never completed
- Invalid dates: The D- commit happened before the I- commit (check your git history)
