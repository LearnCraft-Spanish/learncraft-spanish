Creating Mock Data:

- All queries
- Grab real data, generate fake personal data, make dates generated on the same pattern of last three weeks query

Test Cases:

WeeksRecords:

- Loads & displays data
- Filters by all filtering options (coach, weeks ago, course) (and others when adding advanced filtering)
- if coach logged in, defaults to that coach is selected
- Pagination works (When implemented)
- Advanced filtering works

Table/WeeksTable:

- Displays data
- Contextual for ViewWeekRecord works
- displays correct data for each week (assignments, group, and private cells & their popups? Record Complete checkbox, etc)

Table/StudentCell:

- Displays data
- Contextual button for ViewStudentRecord works
- when coach/course is selected, hides correct data

Table/AssignmentsCell:

- ~~Displays correct data~~
- ~~Contextual button for ViewAssignmentRecord works~~
- New Assignment button works
- New Assignment form works

Table/GroupSessionsCell:

- ~~Displays correct data~~
- ~~Contextual button for ViewGroupRecord works~~
- New Group Session Call button works
- New Group Session form works

Table/PrivateCell:

- Displays data
- Contextual button for ViewPrivateRecord works
- New Private Call button works
- New Private Call form works

Filter/WeeksFilter:

- Default loading states
- Filters by all filtering options (coach, weeks ago, course) (and others when adding advanced filtering)
