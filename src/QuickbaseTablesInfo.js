export const qb = { // quickbaseTablesInfo
    // This is where all the quickbase table names used to make queries are hardcoded & stored
    // these are used whenenever a page needs to retrieve, update, or create data on quickbase database
    studentExamples: {
        name: 'student-examples',
        id: 'br3juud42',
        fields: ['Record ID#', 'Last Reviewed Date', 'Review Interval', 'Related Student', 'Related example', 'Date Created']
    },
    students: {
        name: 'students',
        id: 'brrtdx784',
        fields: ['Record ID#', 'Name']
    },
    vocabulary: {
        name: 'vocabulary',
        id: 'brrcdgyix',
        fields: ['word/idiom', 'Vocab Name']
    },
    examples: {
        name: 'examples',
        id: 'brrcdgyjw',
        fields: ['Record ID#', 'spanish example', 'english translation', 'vocab included', 'spanglish?']
    },
    lessons: {
        name: 'Lessons',
        id: 'brrtcungb',
        fields: ['Lesson', 'Vocab Included']
        //fields: ['Lesson']
    }
}


