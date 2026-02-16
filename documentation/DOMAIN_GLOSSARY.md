# 📚 Domain Glossary

_Business terminology and concepts for LearnCraft Spanish_

This glossary defines the key terms, concepts, and business logic specific to the LearnCraft Spanish application. Understanding these terms is essential for working effectively in the codebase.

---

## User Roles

### Student
A user who is learning Spanish. Students can:
- Take quizzes and review vocabulary
- Create and study custom flashcards
- Track their progress through courses and lessons
- Access audio pronunciations
- Review spaced repetition flashcards

### Coach
A staff member who assists students. Coaches can:
- View student progress and performance
- Assign lessons and track completion
- Review student activity and engagement
- Provide guidance and support
- Access coaching dashboard with metrics

### Admin
System administrators with full access. Admins can:
- Manage users, courses, and content
- View system-wide metrics and analytics
- Configure system settings
- Access all coaching and student features
- Manage database tables directly

---

## Learning Content

### Course
A structured learning path with multiple lessons. A course represents a coherent curriculum (e.g., "Beginner Spanish", "Intermediate Grammar").

**Properties**:
- `id`: Unique identifier
- `name`: Display name
- `description`: Course overview
- `level`: Difficulty level (beginner, intermediate, advanced)
- `lessons`: Array of associated lessons

### Lesson
A specific unit of learning within a course. Each lesson focuses on particular vocabulary, grammar, or concepts.

**Properties**:
- `id`: Unique identifier
- `courseId`: Parent course
- `lessonNumber`: Order within course
- `name`: Lesson title
- `startPage`: Starting page in curriculum
- `endPage`: Ending page in curriculum

**Lesson Range**:
- **Cumulative**: Includes all vocabulary from lesson 1 up to the selected lesson
- **Range**: Only includes vocabulary from the selected lesson

### Vocabulary / Vocab
Spanish words or phrases that students learn. Core content unit in the system.

**Properties**:
- `id`: Unique identifier
- `spanish`: Spanish text
- `english`: English translation
- `audioUrl`: Pronunciation audio file
- `lessonId`: Associated lesson
- `skillTags`: Associated skill categories
- `category`: Vocabulary category (noun, verb, phrase, etc.)

### Example
A sentence or phrase demonstrating vocabulary usage in context.

**Properties**:
- `id`: Unique identifier
- `spanish`: Spanish example sentence
- `english`: English translation
- `vocabularyId`: Related vocabulary item
- `audioUrl`: Audio pronunciation

---

## Quizzing System

### Quiz
An interactive session where students practice vocabulary or grammar.

**Quiz Types**:
- **Text Quiz**: Type the correct translation
- **Audio Quiz**: Listen and type what you hear
- **Official Quiz**: Pre-defined quiz with specific examples (sentences) created by instructors
- **Custom Quiz**: User-created quiz with selected lessons, skill tags, categories, and filters
- **Limited Quiz**: Quiz with a limited number of items (e.g., first 50 words from selected range)

**Quiz Modes**:
- **Spanish First**: Spanish prompt shown first (text or audio), provide English response
- **English First**: English prompt shown first, provide Spanish response
- **Listening Quiz**: Listen to Spanish audio, type what you hear
- **Speaking Quiz**: Read Spanish text, record your pronunciation

### Question
A single item in a quiz session.

**Properties**:
- `prompt`: What the student sees (Spanish or English text, or audio)
- `correctAnswer`: Expected response
- `userAnswer`: Student's submitted answer
- `isCorrect`: Whether answer was correct
- `attemptNumber`: How many times attempted

### Quiz Result
The outcome of a completed quiz session.

**Properties**:
- `quizId`: Associated quiz
- `studentId`: Student who took the quiz
- `score`: Percentage correct
- `totalQuestions`: Number of questions
- `correctAnswers`: Number correct
- `completedAt`: Timestamp
- `timeSpent`: Duration in seconds

---

## Flashcard System

### Flashcard
A study card for vocabulary review using spaced repetition.

**Properties**:
- `id`: Unique identifier
- `vocabularyId`: Associated vocabulary
- `studentId`: Owner student
- `front`: Front of card (usually Spanish)
- `back`: Back of card (usually English)
- `ease`: Spaced repetition ease factor
- `interval`: Days until next review
- `nextReview`: Scheduled review date

**SRS (Spaced Repetition System)**:
Uses a modified SM-2 algorithm to schedule reviews based on student performance.

### Flashcard Update
A pending change to a flashcard (used for batch operations).

**Update Types**:
- **Add**: Create new flashcard
- **Remove**: Delete flashcard
- **Update**: Modify flashcard properties (ease, interval)

**Update Queue**:
Flashcard changes are queued and flushed on page load or explicit save to optimize API calls.

---

## Skill System

### Skill Tag
A categorization label for vocabulary (e.g., "Transportation", "Food", "Past Tense").

**Properties**:
- `id`: Unique identifier
- `name`: Tag name
- `category`: Broader category
- `description`: What this skill covers

**Usage**:
- Vocabulary items can have multiple skill tags
- Students can filter quizzes by skill tag
- Progress can be tracked by skill tag

### Subcategory
A grouping of related vocabulary or grammar concepts.

**Examples**:
- Verbs: Regular, Irregular, Reflexive
- Nouns: People, Places, Things
- Grammar: Tenses, Moods, Articles

---

## Progress Tracking

### Student Progress
Tracking of student advancement through courses and lessons.

**Metrics**:
- `lessonsCompleted`: Number of lessons finished
- `vocabularyMastered`: Number of vocabulary items learned
- `quizzesTaken`: Total quizzes completed
- `averageScore`: Mean quiz score
- `streakDays`: Consecutive days of activity

### Assignment
A lesson or quiz assigned by a coach to a student.

**Properties**:
- `id`: Unique identifier
- `studentId`: Assigned student
- `coachId`: Assigning coach
- `lessonId` or `quizId`: Assigned content
- `dueDate`: Deadline
- `completedAt`: Completion timestamp
- `status`: pending, completed, overdue

---

## Audio System

### Audio Player
Global audio playback coordinator for pronunciation practice.

**Features**:
- Play vocabulary pronunciation
- Play example sentence audio
- Control playback (play, pause, stop)
- Queue multiple audio clips
- Auto-advance in quiz mode

### Audio Context
Global state for audio playback across the application.

**State**:
- `currentAudio`: Currently playing audio URL
- `isPlaying`: Playback status
- `queue`: Queued audio items
- `autoPlay`: Whether to auto-play next item

---

## Database & API

### Program
A top-level curriculum structure (may contain multiple courses).

**Note**: This is legacy terminology; "Course" is preferred in modern codebase.

### Record
Generic term for database entries in admin/coaching interfaces.

**Types**:
- Student Records
- Course Records
- Lesson Records
- Vocabulary Records
- Quiz Records

---

## Quiz Configuration

### Quiz Config
Settings for a quiz session.

**Properties**:
- `mode`: text | audio | mixed
- `direction`: spanish-to-english | english-to-spanish
- `lessonRange`: Which lessons to include
- `includeType`: cumulative | range | custom
- `vocabularyIds`: Specific vocabulary (for custom quizzes)
- `limit`: Maximum number of questions
- `shuffle`: Whether to randomize question order

### Official Quiz
A pre-configured quiz with specific examples (sentences) and settings, created by instructors.

**Properties**:
- `id`: Unique identifier
- `name`: Quiz title
- `description`: What the quiz covers
- `exampleIds`: Included examples (sentences)
- `config`: Quiz settings
- `isPublished`: Whether students can access it

---

## Coaching Features

### Coach Dashboard
Interface for coaches to monitor student progress.

**Features**:
- Student list with recent activity
- Lesson completion rates
- Quiz performance metrics
- Assignment tracking
- Weekly summaries

### Weekly Summary
A report of student activity for a specific week.

**Metrics**:
- Lessons completed
- Quizzes taken
- Average scores
- Time spent studying
- Flashcards reviewed

---

## Common Business Rules

### Vocabulary Inclusion
**Cumulative Mode**: Lessons 1-10 includes all vocabulary from lesson 1 through lesson 10.
**Range Mode**: Lesson 5-7 includes only vocabulary from lessons 5, 6, and 7.

### Spaced Repetition Algorithm
Flashcards use a modified SM-2 algorithm:
- **Again**: Reset interval to 1 day, decrease ease
- **Hard**: Increase interval by 1.2x
- **Good**: Increase interval by ease factor (default 2.5)
- **Easy**: Increase interval by ease factor * 1.3, increase ease

### Quiz Scoring
- **Correct on First Try**: Full points
- **Correct on Second Try**: Partial points (typically 50%)
- **Incorrect**: No points, but question may reappear

### Auto-Save Behavior
Flashcard updates are queued and auto-saved when:
- User navigates away from flashcard page
- User explicitly clicks "Save"
- User closes the browser (via beforeunload handler)

---

## Legacy vs Modern Terminology

Some terms have evolved as the codebase has been refactored:

| Legacy Term       | Modern Term        | Notes                                |
| ----------------- | ------------------ | ------------------------------------ |
| Program           | Course             | "Course" is preferred                |
| Vocab Quiz DB     | Vocabulary Service | Old admin table name                 |
| Student Records   | Student Service    | Legacy admin interface               |
| useOfficialQuizDB | useOfficialQuizzes | Renamed for clarity                  |
| Drill Down        | Student Details    | Old name for student detail view     |

When working in legacy code, you may see these older terms. New code should use modern terminology.

---

## Acronyms and Abbreviations

- **SRS**: Spaced Repetition System
- **SM-2**: SuperMemo 2 (spaced repetition algorithm)
- **SPA**: Single Page Application
- **API**: Application Programming Interface
- **UI**: User Interface
- **UX**: User Experience
- **TBD**: To Be Determined
- **WIP**: Work In Progress

---

## Related Documentation

- [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) - How domain concepts are organized in code
- [`DATA_FLOW.md`](./DATA_FLOW.md) - How data moves through the system
- [`FEATURE_WORKFLOW.md`](./FEATURE_WORKFLOW.md) - Building features with these concepts
- [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md) - Coding patterns and conventions

---

## Questions?

If you encounter a term not defined here, please:
1. Check the codebase for usage examples
2. Ask the team for clarification
3. Update this glossary with the new term

This glossary is a living document and should be updated as the domain evolves.
