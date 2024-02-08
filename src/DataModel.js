export const qb = {grammar: // quickbaseTablesInfo
    // This is where all the quickbase table names used to make queries are hardcoded & stored
    // these are used whenenever a page needs to retrieve, update, or create data on quickbase database
    {
        studentExamples: {
            name: 'student-examples',
            id: 'br3juud42',
            fields: ['Record ID#', 'Last Reviewed Date', 'Next Review Date', 'Review Interval', 'Related Student', 'Related example', 'Date Created', 'Student - Email address']
        },
        students: {
            name: 'students',
            id: 'brrtdx784',
            fields: ['Record ID#', 'Name', 'Email address', 'Related Program', 'Cohort', 'Role']
        },

        programs: {
            name: 'programs',
            id: 'btgeqa5um',
            fields: ['Record ID#', 'Name', 'Lessons', 'Cohort A Current Lesson', 'Cohort B Current Lesson', 'Cohort C Current Lesson', 'Cohort D Current Lesson', 'Cohort E Current Lesson']
        },

        vocabulary: {
            name: 'vocabulary',
            id: 'brrcdgyix',
            fields: ['Record ID#', 'word/idiom', 'use', 'Vocabulary Subcategory - subcategory name', 'Vocab Name', 'frequency rank', 'Verb Infinitive', 'Conjugation Tags']
        },

        spellings: {
            name: 'spellings',
            id: 'btdqqc2rb',
            fields: ['Related word/idiom', 'spelling option']
        },
        
        examples: {
            name: 'examples',
            id: 'brrcdgyjw',
            fields: ['Record ID#', 'spanish example', 'english translation', 'vocab included', 'spanglish?', 'All Students', 'English Audio', 'Spanish Audio LA', 'Vocab Complete?']
        },
        lessons: {
            name: 'Lessons',
            id: 'brrtcungb',
            fields: ['Record ID#', 'Lesson', 'Vocab Included', 'Sort Reference', 'Related Program']
        },
        quizzes: {
            name: 'quiz',
            id: 'brrcdgyma',
            fields: ['Record ID#', 'quiz nickname', ]
        },
        quizExamples: {
            name: 'quiz examples',
            id: 'brrcdgym4',
            fields: ['Record ID#','Related Example', 'Related Quiz', 'quiz nickname']
        }
    },
    coaching: {
        coaches: {
            name: 'coaches',
            id: 'bqkpiakzf',
            fields: ['Record ID#', 'Coach', 'User']
        },
        students: {
            name: 'students',
            id: 'bqkme9fni',
            fields: ['Record ID#', 'First Name', 'Last Name', 'Full Name', 'Email', 'Time Zone', 'US Phone','Fluency Goal', 'Starting Level', 'Primary Coach']
        },
        memberships: {
            name: 'memberships',
            id: 'bqkmhc9b6',
            fields: ['Record ID#', 'Start Date', 'End Date', 'Active?', 'Related Course', 'Related Student', 'On Hold', 'Last Recorded Week Starts', 'Bundles Purchased']
        }, 
        courses: {
            name: 'courses',
            id: 'bqkmf4h42',
            fields: ['Record ID#', 'Name', 'Membership Type', 'Weekly Private Calls', 'Has Group Calls']
        },
        lessons: {
            name: 'lessons',
            id: 'bqkmm99d4',
            fields: ['Record ID#', 'Lesson Name', 'Week Ref', 'Type']
        },
        weeks: {
            name: 'weeks',
            id: 'bqkmqjb9r',
            fields: ['Record ID#', 'Primary Coach (When Created)', 'Week Starts', 'Week Ends', 'Record Completable', 'Records Complete?', 'Week #', 'Notes', 'Related Membership', 'Current Lesson', 'Assignment Ratings', 'Private Call Ratings', 'Group Call Comments', 'Hold Week']
        }, 
        calls: {
            name: 'calls',
            id: 'bqkmh7ata',
            fields: ['Record ID#', 'Related Week', 'Recording', 'Notes', 'Areas of Difficulty', 'Rating', 'Date']
        },
        assignments: {
            name: 'assignments',
            id: 'bqkp42y7q',
            fields: ['Record ID#', 'Assignment Link', 'Related Week', 'Rating', 'Assignment Type', 'Areas of Difficulty', 'Notes', 'Homework Corrector']
        },
        groupSessions: {
            name: 'group sessions',
            id: 'brr3hs2w6',
            fields: ['Record ID#', 'Date', 'Coach', 'Zoom Link', 'Topic', 'Comments', 'Related Coach', 'Session Type', 'Call Document']
        },
        groupAttendees: {
            name: 'group attendees',
            id: 'brwusasqc',
            fields: ['Record ID#', 'Group Session', 'Student']
        }
    }
}