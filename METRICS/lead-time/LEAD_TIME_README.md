# Lead Time Tracker

This script analyzes git commits to track lead time for features and hotfixes by measuring the time between I- (start) and D- (end) tags.

## How it works

The script looks for commit messages with the following patterns:

- `I-Feature-<number>` or `I-HotFix-<number>` - Marks the start of a feature/hotfix
- `D-Feature-<number>` or `D-HotFix-<number>` - Marks the completion/merge of a feature/hotfix

It calculates the time difference between matching I- and D- tags for the past 30 days and provides statistics.

## Usage

### Run lead time analysis only:

```bash
pnpm run lead-time
```

### Run all metrics (including lead time):

```bash
pnpm run metrics
```

### Run directly:

```bash
node METRICS/lead-time/lead_time_tracker.js
```

## Output

The script provides:

- Total number of completed features/hotfixes
- Number of incomplete features/hotfixes (missing I- or D- tags)
- Average lead time across all completed items
- Minimum and maximum lead times
- Separate averages for Features vs Hotfixes
- Detailed list of each completed feature/hotfix with its lead time
- List of incomplete items with status (missing I- or D- tag)

## Example Output

```
📊 Analyzing lead time metrics for the past 30 days...

Found 45 commits in the past 30 days
Found 8 features/hotfixes with tags

📈 Lead Time Analysis Results:
   Total completed features/hotfixes: 6
   Incomplete features/hotfixes: 2
   Overall average lead time: 2d 4h
   Min lead time: 3h 30m
   Max lead time: 5d 12h
   Features (4): 2d 8h average
   Hotfixes (2): 1d 16h average

📋 Completed Features/Hotfixes:
   Feature-123: 2d 4h (2024-01-15 → 2024-01-17)
   HotFix-456: 1d 8h (2024-01-18 → 2024-01-19)
   Feature-789: 3d 12h (2024-01-20 → 2024-01-23)

⚠️  Incomplete Features/Hotfixes:
   Feature-999: Missing D- tag
   HotFix-888: Missing I- tag
```

## Tagging Guidelines

To get accurate lead time metrics, ensure your team follows these tagging conventions:

1. **Start Tag**: When creating a new feature/hotfix branch, tag the first commit with:

   ```
   I-Feature-123
   ```

   or

   ```
   I-HotFix-456
   ```

2. **End Tag**: When merging to production, tag the merge commit with:

   ```
   D-Feature-123
   ```

   or

   ```
   D-HotFix-456
   ```

3. **Number Consistency**: Use the same number for both I- and D- tags of the same feature/hotfix.

## Configuration

The script analyzes commits from the past 30 days by default. To modify this period, edit the `getGitTagsForPast30Days()` function in `lead_time_tracker.js`.

## File Structure

```
METRICS/lead-time/
├── index.js                 # Barrel export
├── lead_time_tracker.js     # Main analysis logic
├── LEAD_TIME_README.md      # This documentation
└── example_usage.md         # Usage examples and workflows
```

## Requirements

- Node.js 16+
- Git repository with commit history
- Proper I- and D- tagging in commit messages
