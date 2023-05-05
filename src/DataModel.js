export const qb = { // quickbaseTablesInfo
    // This is where all the quickbase table names used to make queries are hardcoded & stored
    // these are used whenenever a page needs to retrieve, update, or create data on quickbase database
    studentExamples: {
        name: 'student-examples',
        id: 'br3juud42',
        fields: ['Record ID#', 'Last Reviewed Date', 'Next Review Date', 'Review Interval', 'Related Student', 'Related example', 'Date Created']
    },
    students: {
        name: 'students',
        id: 'brrtdx784',
        fields: ['Record ID#', 'Name', 'Email address']
    },
    vocabulary: {
        name: 'vocabulary',
        id: 'brrcdgyix',
        fields: ['Record ID#', 'word/idiom', 'use', 'Vocabulary Subcategory - subcategory name', 'Vocab Name', 'frequency rank']
    },
    examples: {
        name: 'examples',
        id: 'brrcdgyjw',
        fields: ['Record ID#', 'spanish example', 'english translation', 'vocab included', 'spanglish?', 'English Audio', 'Spanish Audio LA', 'Vocab Complete?']
    },
    lessons: {
        name: 'Lessons',
        id: 'brrtcungb',
        fields: ['Record ID#', 'Lesson', 'Vocab Included', 'Sort Reference']
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
}