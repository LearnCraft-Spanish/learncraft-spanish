# Domain Glossary

The shared language of LearnCraft Spanish as this frontend presents it: learners and their flashcards and quizzes, coaching, and staff content tools.

Entity fields live in `@learncraft-spanish/shared`, not here. A _Schema_ line names the folder under the package's `src/domain/` that owns an entity's definition.

## People & Roles

**App User**:
Whoever is logged in to the app: any tier of Student, a Free User, a Coach, or an Admin.
_Schema_: `appUser`
_Note_: the shared `AppUser` schema holds only the logged-in person's student record, so Free Users, and Coaches or Admins without a student record, have none.

**Student**:
A person with an app student record, which carries their Course, Current Lesson, Cohort, and level of app access.
_Avoid_: user
_Schema_: `student`

**Limited Student**:
A Student on the lower membership tier: a one-time payment for lifetime access to audio quizzes only.
_Avoid_: limited user

**Free User**:
A logged-in person without app access, either never a Student or a Student whose role is `none` after cancelling their membership. Free Users can still take Official Quizzes.
_Avoid_: guest

**Coaching Student**:
A current or former paying coaching client, recorded in student records separately from the Student record. Usually the same human as a Student, matched only informally by email.
_Avoid_: SR Student, student (when the coaching record is meant)
_Schema_: `sr-student`

**Coach**:
Staff who coach Coaching Students through calls, homework, and Weekly Records, and who can use the app on any Student's behalf.
_Avoid_: staff, tutor
_Schema_: `coach`

**Admin**:
Staff with access to content and data tools on top of every Coach tool. An Admin may coach no one, be a coach team lead with their own students, or be a Coach with an extra responsibility such as creating Examples or grading homework.

**Primary Coach**:
The Coach responsible for a Coaching Student, their Membership, and their Weekly Records.

**Homework Corrector**:
The Coach who graded an Assignment; not necessarily the student's Primary Coach.

## Curriculum

**Course**:
A curriculum made of numbered Lessons and their Official Quizzes, such as "LearnCraft Spanish" or "Spanish in One Month".
_Avoid_: Program (legacy name that survives in some tables and endpoints, e.g. `relatedProgram`)
_Schema_: `courses`

**Lesson**:
One numbered unit of a Course. A student is meant to complete one Lesson each weekday.
_Schema_: `lessons`

**Course Prerequisite**:
A Course whose Lessons count as earlier Lessons of another Course, so a Lesson Range can reach back into it.

**Current Lesson**:
The Lesson a Student's record says they are on, set by their Cohort or by staff.

**Last Studied Lesson**:
The Lesson a learner most recently studied on this device, used to default their quizzes. Works for Free Users too.

**Cohort**:
A lettered group (A–J) of Students who move through a Course on a shared schedule; the Course tracks one Current Lesson per Cohort.
_Note_: every Student is given a Cohort letter, but only a small fraction actually follow a cohort schedule. Last Studied Lesson exists so lesson tracking works for everyone else.

**Lesson Range**:
A from-Lesson and to-Lesson a Student picks to narrow a quiz to recent material, such as their latest 20 Lessons.

## Examples & Vocabulary

**Example**:
A Spanish sentence with its English translation, tagged with the Vocabulary it uses and usually carrying Spanish and English audio.
_Avoid_: sentence
_Schema_: `example`

**Vocabulary Complete**:
An Example whose Vocabulary tags are all recorded and verified as correct by a Coach.

**Spanglish**:
An Example whose Spanish side deliberately mixes in English words, used in early Lessons before the student knows enough vocabulary for full Spanish sentences. Students can exclude them from quizzes.

**Vocabulary**:
A single Spanish word in one sense, identified by its word and Descriptor, with one or more Spellings and a Subcategory. "Vocab" is accepted shorthand for one Vocabulary item.
_Avoid_: word
_Schema_: `vocabulary`

**Descriptor**:
A short English gloss that tells apart Vocabulary items sharing the same word.

**Spelling**:
A written form in which a Vocabulary item appears in Examples. A student's **Known Spellings** are the Spellings they have met by a given Lesson.

**Subcategory**:
A themed group of Vocabulary within one part of speech, such as "Time, general".

**Skill Tag**:
A label used to filter Examples, pointing at one Vocabulary item, Idiom, Subcategory, Verb, or Conjugation.
_Schema_: `vocabulary`

## Flashcards & SRS

**Flashcard**:
An Example a Student has collected for spaced-repetition review.
_Avoid_: card
_Schema_: `flashcard`

**Collect**:
To add an Example to a Student's Flashcards. Collected Flashcards are **owned**.
_Avoid_: add, save

**Custom Flashcard**:
A Flashcard made on request for one Student, using words they are actively trying to learn, rather than drawn from the premade Examples taught to everyone. Usually has no audio, no Vocabulary tags, and is not Vocabulary Complete. Delivered by assigning an Example.

**SRS**:
The spaced repetition system that schedules when each owned Flashcard is next due, based on how the Student rated it.
_Avoid_: SM-2

**Interval**:
The number of days until a Flashcard is next due for review.

**Easy / Hard / Viewed**:
How a Flashcard review is recorded: Easy lengthens the Interval, Hard shortens it, and Viewed (seen but not rated) leaves it unchanged. The exact rule lives in `src/hexagon/domain/srs.ts`.

## Quizzes

**Quiz**:
A practice session over a set of Examples. Every quiz has a source (Official, Custom, or My Flashcards) and a format (Text or Audio).
_Avoid_: drill

**Official Quiz**:
A curated, published quiz for one Lesson of a Course. The only quiz grouping students talk about.
_Schema_: `quiz`

**Quiz Group**:
An internal grouping that ties a set of Official Quizzes to a Course, such as "LearnCraft Spanish" and the much larger "LearnCraft Spanish Extended", each with one quiz per Lesson.
_Schema_: `quiz-group`

**Custom Quiz**:
A quiz a learner builds from filters such as Lesson Range, Skill Tags, and excluding Spanglish.

**My Flashcards Quiz**:
A quiz over a Student's owned Flashcards.

**Text Quiz**:
A quiz that shows one side of each Example as text, then reveals the other.

**Start with Spanish**:
The Text Quiz setting that shows the Spanish side first.
_Avoid_: Spanish First, English First

**SRS Quiz**:
A Text Quiz over a Student's owned Flashcards in which each card is rated Easy or Hard.

**Audio Quiz**:
A quiz played through each Example's Spanish and English audio, as either a Listening Quiz or a Speaking Quiz. The student's voice is never recorded.

**Listening Quiz**:
An Audio Quiz that plays the Spanish, gives the student time to understand it, then gives the English.

**Speaking Quiz**:
An Audio Quiz that plays the English, gives the student time to say the Spanish aloud, then plays the Spanish.

## Coaching

**SrCourse**:
A coaching membership tier, stating how many Private Calls and Group Calls a Coaching Student gets each week; occasionally a special student-type course. Unrelated to the curriculum Course.
_Avoid_: course (unqualified), coaching course
_Schema_: `sr-course`

**SrLesson**:
A stopgap coaching lesson that maps a Weekly Record onto a range of five curriculum Lessons, one per weekday. Due to be replaced.
_Avoid_: lesson (unqualified)
_Schema_: `sr-lesson`

**Membership**:
A Coaching Student's enrollment in an SrCourse for a date range, with a Primary Coach. Can be put on hold.
_Avoid_: subscription
_Schema_: `membership`

**Bundle Credits**:
Add-on coaching sessions a Coaching Student buys for extra practice beyond their Membership. They belong to the student rather than the Membership and expire after six months, so they survive a change of SrCourse.
_Schema_: `bundle-credits`

**Weekly Record**:
The main record of a Coaching Student's progress for one week of their Membership, generated each week for each of a Coach's students. Holds the week's SrLesson, Assignments, Private Calls, and Group Call attendance.
_Avoid_: week (the code's name, `Week`)
_Schema_: `week`

**Hold Week**:
A Weekly Record for a paused week that does not count toward the Membership.

**Incomplete Week**:
A Weekly Record the Coach has not finished filling in.

**Assignment**:
Homework recorded on a Weekly Record and graded by a Homework Corrector.
_Schema_: `assignment`

**Assign an Example**:
To give an Example to a Student as a Flashcard, or add it to an Official Quiz, through the Example Assigner.
_Avoid_: assignment (reserved for homework)

**Private Call**:
A one-on-one call between a Coach and a Coaching Student, recorded on a Weekly Record.
_Schema_: `privateCall`

**Strategy Call**:
A Private Call with someone other than the student's Primary Coach, to assess how the student is progressing and decide the best next steps. May not belong to a Weekly Record.

**Group Call**:
A coaching session one Coach runs for several Coaching Students, with attendance recorded on each attendee's Weekly Record.
_Avoid_: group session (the code's name, `GroupSession`)
_Schema_: `groupCall`

**Leads to Re-engage**:
Coaching Students who have gone inactive or quiet, grouped by Coach, for follow-up.
_Schema_: `coach`

## Tools

**Flashcard Finder**:
Where Students browse Examples by filter and collect them.

**My Flashcards**:
Where Students quiz themselves on their owned Flashcards.

**Flashcard Manager**:
Where Students review and remove their owned Flashcards.

**Official Quizzes**:
Where learners pick an Official Quiz for a Course.

**Get Help**:
Student help pages, including **Vocab Lookup** for looking up a Vocabulary item.

**FrequenSay**:
A Coach tool that finds the words in a pasted text a student has not learned by a given Lesson, by comparing against their Known Spellings.

**Coaching Dashboard**:
A Coach's home screen, showing their Incomplete Weeks and recent Private Calls, Group Calls, and Assignments.

**Weekly Records**:
The screen where Coaches fill in Weekly Records.

**Student Drill Down**:
Where a Coach can find any Coaching Student and view all of their Memberships and Weekly Records.
_Avoid_: Student Details

**Example Manager**:
Admin tools for creating, editing, and searching Examples, including the **Example Assigner** for assigning Examples.

**Admin Dashboard**:
Admin-only reports, such as Leads to Re-engage.

**Database Tables**:
Admin-only screens for editing raw records such as Courses, Lessons, and Quiz Groups.
