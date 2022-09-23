import React, {useEffect} from 'react';
import { qb } from './QuickbaseTablesInfo';
import { fetchAndCreateTable } from './QuickbaseFetchFuntions';

export default function TestCode() {
    async function f2() { // gets user token & creates the student examples table
        const queryParams = new URLSearchParams(window.location.search)
        const ut = queryParams.get('ut')
        
        //console.log('Table Arr:', await fetchAndCreateTable(ut, tableInitialInfo))
        //console.log(qb.studentExamples)
        //console.log('Table Arr:', await fetchAndCreateTable(ut, qb.studentExamples))
        //const vocabTable = await fetchAndCreateTable(ut, qb.vocabulary)
        //const studentExamplesTable = await fetchAndCreateTable(ut, qb.studentExamples)
        //console.log('set: ', vocabTable)
        //console.log('set: ', vocabTable)
        //f3('1', studentExamplesTable)
        //test(studentExamplesTable) 

        const table = await fetchAndCreateTable(ut, qb.lessons)
        const exTable = await fetchAndCreateTable(ut, qb.examples)
        console.log('set table: ', table)
        //retrieveCombinedLessonVocab('AS Lesson 5', table)   
        //retrieveCombinedLessonVocab('SI1M Lesson 8', table)   

        // const filteredEx = retrieveFilteredExamplesByLesson('SI1M Lesson 15', table, exTable)
        // console.log('filteredEx: ', filteredEx)

        // lenientFilter(['por', 'de'], exTable)

        const strictExamples = filterExamplesStrict(retrieveCombinedLessonVocab('SI1M Lesson 8', table), exTable)
        const lenientExamples = filterExamplesLenient(['por', 'de'], exTable)

        console.log('strict ex: ', strictExamples)
        console.log('lenient ex: ', lenientExamples)

    }

    function convertToEscape(str) {
        console.log('initial str: ', str)
        const newStr = str.replaceAll('"', '\\\"')
        console.log('new str: ', newStr)
        return str
    }
 
    function filterExamplesStrict(vocabArr, examplesTable) {
        const filteredExamples = examplesTable.filter(example => {
            if(example.vocabIncluded.length == 0) {
                return false
            }
            for(const vocab of example.vocabIncluded) {
                if(!vocabArr.includes(vocab)) {
                    return false
                }
            }
            return true
        })
        return filteredExamples
    }

    function filterExamplesLenient(vocabArr, examplesTable) {
        const filteredExamples = examplesTable.filter(example => {
            for(const parameterVocab of vocabArr) {
                for(const exampleVocab of example.vocabIncluded) {
                    if(exampleVocab.toLowerCase().includes(parameterVocab.toLowerCase())) {
                        return true
                    }
                }
            }
            return false
        })
        return filteredExamples
    }

    function retrieveFilteredExamplesByLesson(selectedLessonName, lessonsTable, examplesTable) {
        const combinedLessonVocab = retrieveCombinedLessonVocab(selectedLessonName, lessonsTable)
        const filteredExamples = examplesTable.filter(example => {
            if(example.vocabIncluded.length == 0) {
                return false
            }
            for(const vocab of example.vocabIncluded) {
                if(!combinedLessonVocab.includes(vocab)) {
                    return false
                }
            }
            return true
        })
        return filteredExamples
    }

    function retrieveFilteredExamplesByLessonTest(selectedLessonName, lessonsTable, examplesTable) {
        const combinedLessonVocab = retrieveCombinedLessonVocab(selectedLessonName, lessonsTable)
        console.log('combinedLessonV: ', combinedLessonVocab)
        const filteredExamples = examplesTable.filter(example => {
            if(example.vocabIncluded.length == 0) {
                return false
            }
            for(const vocab of example.vocabIncluded) {
                if(!combinedLessonVocab.includes(vocab)) {
                    return false
                }
            }
            return true
        })
        console.log(filteredExamples)
        return filteredExamples
    }

    function retrieveCombinedLessonVocab(selectedLessonName, lessonsTable) {
        const selectedSplitArr = selectedLessonName.split(' ')
        const selectedNum = parseInt(selectedSplitArr.pop())
        const selectedTitle = selectedSplitArr.join(' ')

        let combinedLessonVocab = []
        lessonsTable.forEach(lesson => {
            const splitArr2 = lesson.lesson.split(' ')
            const num2 = parseInt(splitArr2.pop())
            if(lesson.lesson.includes(selectedTitle) && num2 <= selectedNum) {
                combinedLessonVocab = [...combinedLessonVocab, ...lesson.vocabIncluded]
            }
        })
        return combinedLessonVocab
      }

      function retrieveCombinedLessonVocabTest(selectedLessonName, lessonsTable) {
        const selectedSplitArr = selectedLessonName.split(' ')
        console.log('selectedSplitArr:', selectedSplitArr)
        const selectedNum = parseInt(selectedSplitArr.pop())
        const selectedTitle = selectedSplitArr.join(' ')
        console.log('selectedSplitArr2:', selectedSplitArr)
        console.log('selected num:', selectedNum)
        console.log('selected title: ', selectedTitle)

        let combinedLessonVocab = []
        lessonsTable.forEach(lesson => {
            const splitArr2 = lesson.lesson.split(' ')
            const num2 = parseInt(splitArr2.pop())
            if(lesson.lesson.includes(selectedTitle) && num2 <= selectedNum) {
                console.log(lesson.vocabIncluded)
                combinedLessonVocab = [...combinedLessonVocab, ...lesson.vocabIncluded]
            }
        })
        console.log('that was the lessons table foreach')
        console.log('combinedLessonV: ', combinedLessonVocab)
        return combinedLessonVocab
      }

    function parseTest() {
        //const stringedJSON = '{' +  linksArr.map(link => { return ('\'' + link.name + '\'' + ':' + '\'' + element[link.number].value + '\'')}).join(', ') + '}'

        const t = '{' + '\'' + 'use' + '\'' + ':' + '\'' + 'use' + '\'' + '}'
        console.log('t: ', t)

        const stringedJSON = "{'use':'\"because of\"', 'vocabName':'por - \"because of\"'}"
        const parsedJSON = JSON.parse(t)
        console.log('parseJ: ', parsedJSON)
    }

    useEffect(() => {    
        //parseTest()
        //convertToEscape('por - "bc of"')   
        f2()    
         
    }, [])

  return <div>test</div>;
}
