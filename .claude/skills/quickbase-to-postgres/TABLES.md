# Known Tables — QuickBase → Postgres Migration

This file tracks the known legacy tables and their database sources. Update it as new tables are identified or migrated.

---

## Table Registry

| Table name    | Database(s)      | Legacy hook(s)                                    | Hexagon status  |
| ------------- | ---------------- | ------------------------------------------------- | --------------- |
| `students`    | `vocabQuizDb`    | `src/hooks/VocabQuizDbData/useStudentsTable.ts`   | ❌ not migrated |
| `lessons`     | `vocabQuizDb`    | `src/hooks/VocabQuizDbData/useVqdLessonsTable.ts` | ❌ not migrated |
| `lessons`     | `studentRecords` | `src/hooks/StudentRecordsData/useLessonsTable.ts` | ❌ not migrated |
| `quiz-groups` | `vocabQuizDb`    | `src/hooks/VocabQuizDbData/useQuizGroupsTable.ts` | ❌ not migrated |
| `quizzes`     | `vocabQuizDb`    | `src/hooks/VocabQuizDbData/useQuizzesTable.ts`    | ❌ not migrated |
| `courses`     | `studentRecords` | `src/hooks/StudentRecordsData/useCoursesTable.ts` | ❌ not migrated |

---

## Ambiguous Names

Tables that exist in more than one database — **always ask which database when these are specified without a qualifier**.

| Table name | Exists in                       |
| ---------- | ------------------------------- |
| `lessons`  | `vocabQuizDb`, `studentRecords` |

---

## Status Key

| Symbol          | Meaning                                              |
| --------------- | ---------------------------------------------------- |
| ❌ not migrated | Legacy hook still the source of truth                |
| 🔄 in progress  | Active migration underway                            |
| ✅ migrated     | Hexagon path live; legacy hook is deletion candidate |
| 🗑️ deleted      | Legacy hook removed                                  |
