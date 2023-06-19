import React, {useState, useEffect, useRef} from 'react';
import { getVocabFromBackend, getExamplesFromBackend, getLessonsFromBackend} from './BackendFetchFunctions';
import './App.css';
import { useAuth0 } from '@auth0/auth0-react';

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
export default function ExampleRetriever({resetFunction}) {
  const {getAccessTokenSilently} = useAuth0();
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [vocabSearchTerm, setVocabSearchTerm] = useState('')
  const [grammarSearchTerm, setGrammarSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('None Selected')
  const [selectedLesson, setSelectedLesson] = useState({})
  const [lessonTable, setLessonTable] = useState([])
  const [exampleTable, setExampleTable] = useState([])
  const [vocabularyTable, setVocabularyTable] = useState([])
  const [suggestedVocab, setSuggestedVocab] = useState([])
  const [requiredVocab, setRequiredVocab] = useState([])
  const [noSpanglish, setNoSpanglish] = useState(false)
  const [shuffleSentences, setShuffleSentences] = useState(false)
  const [displayExamples, setDisplayExamples] = useState([])

  function toggleSpanglish () {
    if (noSpanglish) {
      setNoSpanglish(false)
    } else {
      setNoSpanglish(true)
    }
  }

  function parseCourseLessons(lessonTableToParse) {
    const lessonsParsedByCourse = [{name: 'LearnCraft Spanish',lessons:[]},{name: 'Accelerated Spanish',lessons:[]},{name: '1-Month Challenge',lessons:[]},{name: '2-Month Challenge',lessons:[]}]
    lessonTableToParse.forEach((lesson)=> {
      const lessonNameArray = lesson.lesson.split(" ")
      //console.log(lessonNameArray[0])
      function sortByLesson (a,b) {
        if (a.lessonNumber > b.lessonNumber) {
          return 1
        } else {
          return -1
        }
      }
      switch (lessonNameArray[0]) {
        case ('lcsp'): {
          lesson.lessonNumber = parseInt(lessonNameArray[1])
          //console.log(lesson.lessonNumber)
          lessonsParsedByCourse[0].lessons.push(lesson)
          lessonsParsedByCourse[0].lessons.sort(sortByLesson)
          break
        }
        case('AS'): {
          lesson.lessonNumber = parseInt(lessonNameArray[2])
          //console.log(lesson.lessonNumber)
          lessonsParsedByCourse[1].lessons.push(lesson)
          lessonsParsedByCourse[1].lessons.sort(sortByLesson)
          break
        }
        case('SI1M'): {
          lesson.lessonNumber = parseInt(lessonNameArray[2])
          //console.log(lesson.lessonNumber)
          lessonsParsedByCourse[2].lessons.push(lesson)
          lessonsParsedByCourse[2].lessons.sort(sortByLesson)
          break
        }
        case('2mc'): {
          lesson.lessonNumber = parseInt(lessonNameArray[1][1])*100 + parseInt(lessonNameArray[1][3])
          //console.log(lesson.lessonNumber)
          lessonsParsedByCourse[3].lessons.push(lesson)
          lessonsParsedByCourse[3].lessons.sort(sortByLesson)
          break
        }
        default:
      }
    })
    function parseLessonsByVocab (courses) {
      const lessonsParsedByVocab = [...courses]
      courses.forEach((course, courseIndex) => {
        if (courseIndex < 3) {
          const combinedVocabulary = []
          course.lessons.forEach((lesson, lessonIndex) => {
            lesson.vocabIncluded.forEach((word) => {
              if (!combinedVocabulary.includes(word)) {
                combinedVocabulary.push(word)
              }
            })
            lessonsParsedByVocab[courseIndex].lessons[lessonIndex].vocabKnown=[...combinedVocabulary]
          })
          //console.log(lessonsParsedByVocab[courseIndex])
        } else {
          const combinedVocabulary = [...lessonsParsedByVocab[2].lessons[19].vocabKnown]
          //console.log(combinedVocabulary.length)
          course.lessons.forEach((lesson, lessonIndex) => {
            //console.log(lesson.vocabIncluded.length)
            lesson.vocabIncluded.forEach((word) => {
              if (!combinedVocabulary.includes(word)) {
                combinedVocabulary.push(word)
              }
            })
            lessonsParsedByVocab[courseIndex].lessons[lessonIndex].vocabKnown=[...combinedVocabulary]
            //console.log(lessonsParsedByVocab[courseIndex].lessons[lessonIndex].vocabKnown.length)
          })
          //console.log(lessonsParsedByVocab[courseIndex])
        }
      })
      return lessonsParsedByVocab
    }

    const parsedLessons = parseLessonsByVocab(lessonsParsedByCourse)
    //console.log(parsedLessons)
    return parsedLessons
  }

  function makeCourseSelector () {
    const courseSelector = []
    lessonTable.forEach((item)=> {
      courseSelector.push(<option key = {lessonTable.indexOf(item)} value = {item.name}>{item.name}</option>)
    })
    return courseSelector
  }

  function updateActiveCourse (name) {
    //console.log(name)
    const courseIndex = lessonTable.findIndex(item=> item.name === name)
    //console.log(courseIndex)
    const course = {...lessonTable[courseIndex]}
    //console.log(course)
    setSelectedCourse(course)
    if (course.lessons) {
      const lastIndex = course.lessons.length -1
      //console.log(lastIndex)
      //console.log(course.lessons[lastIndex])
      setSelectedLesson(course.lessons[lastIndex])
    } else {
      setSelectedLesson({})
    }
  }

  function makeLessonSelector () {
      const lessonSelector = []
      selectedCourse.lessons.forEach((lesson)=>{
        lessonSelector.push(<option key = {lesson.lessonNumber} value = {lesson.lessonNumber}> Lesson {lesson.lessonNumber}</option>)
      })
      return lessonSelector
  }

  function updateActiveLesson (number) {
    //console.log(number)
    const numberInt = parseInt(number)
    const lesson = selectedCourse.lessons.find(element => element.lessonNumber===numberInt)
    //console.log(lesson)
    setSelectedLesson(lesson)
  }

  function addVocabToRequiredVocab (vocabNumber) {
    const vocabObject = vocabularyTable.find(object => (object.recordId === vocabNumber))
    //console.log(vocabObject)
    const newRequiredVocab = [...requiredVocab];
    newRequiredVocab.push(vocabObject)
    //console.log(newRequiredVocab)
    setRequiredVocab(newRequiredVocab)
    setVocabSearchTerm("")
    setGrammarSearchTerm("")
  }

  function removeVocabFromRequiredVocab (vocabNumber) {
    //console.log(vocabObject)
    const newRequiredVocab = requiredVocab.filter((item) => item.recordId!==vocabNumber)
    //console.log(newRequiredVocab)
    setRequiredVocab(newRequiredVocab)
  }
  
  function filterExamplesByAllowedVocab(examples) {
    if (selectedLesson.vocabKnown) {
      const allowedVocab = selectedLesson.vocabKnown
      //console.log(allowedVocab)
      const filteredByAllowed = examples.filter((item) => {
        let isAllowed = true
        if (item.vocabIncluded.length === 0 || item.vocabComplete === false) {
          isAllowed = false
        }
        item.vocabIncluded.forEach((word) => {
          if (!allowedVocab.includes(word)) {
            isAllowed = false;
          }
        })
        //console.log(`Item: ${item.vocabIncluded} Status: ${isAllowed}`)
        return isAllowed
      })
      return filteredByAllowed
    } else {
      return examples
    }
  }


  function filterExamplesBySelectedVocab(examples) {
    if (requiredVocab.length > 0){
      const filteredExamples = examples.filter(example => {
          if(example.vocabIncluded.length === 0 || example.vocabComplete === false) {
              return false
          }
          //console.log(example.vocabIncluded)
          let isGood = false
          requiredVocab.forEach((word) => {
            //console.log(word.vocabName)
            if (!isGood) {
              isGood = example.vocabIncluded.includes(word.vocabName)
            }
          })
          return isGood
      })
      return filteredExamples
    } else {
      return examples
    }
  }

  function filterBySpanglish (examples) {
    if(noSpanglish){
      const filteredBySpanglish = examples.filter((item) => {
        if (item.spanglish === 'esp'){
          return true
        }
          return false
      })
      return filteredBySpanglish
    } else {
      return examples
    }
  }

  function shuffleExamples (examples) {
    let shuffled = examples
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    return shuffled
  }


  function makeExamplesTable() {
    const allExamples = [...exampleTable]
    const filteredBySpanglish = filterBySpanglish(allExamples)
    const filteredByAllowed = filterExamplesByAllowedVocab(filteredBySpanglish)
    const filteredByRequired = filterExamplesBySelectedVocab(filteredByAllowed)
    const shuffledSentences = shuffleExamples(filteredByRequired)
    //console.log(shuffledSentences)
    setDisplayExamples(shuffledSentences)
  }

  function displayExamplesTable() {
    const tableToDisplay = displayExamples.map((item) => {
      return (<div className='exampleCard' key={item.recordId}>
        <div className='exampleCardSpanishText'>
          <h3>{item.spanishExample}</h3>
        </div>
        <div className='exampleCardEnglishText'>
          <h4>{item.englishTranslation}</h4>
        </div>
      </div>)
    })
    return tableToDisplay
  }

  // called when user clicks 'Copy as List' button
  // copies sentences in a list format with all english sentences first & then all spanish sentences
  function copySentences() {
    const englishSentences = displayExamples.map(example => {
        return example.englishTranslation
    }).join('\n')
    const spanishSentences = displayExamples.map(example => {
        return example.spanishExample
    }).join('\n')
    //
    const copiedText = englishSentences + '\n\n' + spanishSentences
    navigator.clipboard.writeText(copiedText)
  }

  // called when user clicks 'Copy as Table' button
  // copies sentences in a table format to be pasted into a google doc or excel sheet
  function copyTable() {
    const headers = 'ID\tSpanish\tEnglish\n'
    const table = displayExamples.map(example => {
        return example.recordId + '\t' + example.spanishExample + '\t' + example.englishTranslation
    }).join('\n')

    const copiedText = headers + table
    navigator.clipboard.writeText(copiedText)
  }

  function filterVocabularyByInput (vocabInput, grammarInput) {
    //console.log(grammarInput)
    function filterFunction (term) {
      const lowerTerm = term.wordIdiom.toLowerCase()
      const lowerVocabInput = vocabInput.toLowerCase()
      const lowerGrammar = term.vocabularySubcategorySubcategoryName.toLowerCase()
      const lowerGrammarInput = grammarInput.toLowerCase()
      
      if (lowerTerm.includes(lowerVocabInput)&&lowerGrammar.includes(lowerGrammarInput)){
        return true
      }
      return false
    }
    const filteredVocab = vocabularyTable.filter(filterFunction);
    //console.log(filteredVocab)
    const suggestTen = []
    for (let i = 0; i < 10; i++){
      if(filteredVocab[i]) {
        suggestTen.push(filteredVocab[i])
      }
    }
    setSuggestedVocab(suggestTen);
  }

  function sortVocab (a, b) {
    if (a.frequencyRank===b.frequencyRank){
        if (!a.wordIdiom.includes(" ") && b.wordIdiom.includes(" ")){
          return 1;
        } else if (a.wordIdiom.includes(" ") && !b.wordIdiom.includes(" ")){
          return -1
        }
    } else {
      return a.frequencyRank - b.frequencyRank
    }
  }

  async function getVocab () {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openID email profile",
        },
      });
      //console.log(accessToken)
      const vocab = await getVocabFromBackend(accessToken)
      .then((result) => {
        //console.log(result)
        const usefulData = result;
        return usefulData
      });
      return vocab.sort(sortVocab)
    } catch (e) {
        console.log(e.message);
    }
  }

  async function getExamples () {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openID email profile",
        },
      });
      //console.log(accessToken)
      const examples = await getExamplesFromBackend(accessToken)
      .then((result) => {
        //console.log(result)
        const usefulData = result;
        return usefulData
      });
      //console.log(examples)
      return examples
    } catch (e) {
        console.log(e.message);
    }
  }

  async function getLessons () {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openID email profile",
        },
      });
      //console.log(accessToken)
      const lessons = await getLessonsFromBackend(accessToken)
      .then((result) => {
        //console.log(result)
        const usefulData = result;
        return usefulData
      });
      //console.log(lessons) 
      return lessons
    } catch (e) {
        console.log(e.message);
    }
  }

  
  // called onced at the beginning
  useEffect(() => {
    async function startUp () {
      const getData = async () => {
        //console.log('init called')
        // retrieving the table data
        const vocabPromise = await getVocab()
        const examplePromise = await getExamples()
        const lessonPromise = await getLessons()
        return [await vocabPromise, await examplePromise, await lessonPromise]
      };
      const beginningData = await getData()
      //console.log(beginningData[0])
      setVocabularyTable(beginningData[0])
      setExampleTable(beginningData[1])
      setLessonTable(parseCourseLessons(beginningData[2]))
      //console.log('data fetched')
    }
    startUp()
  }, [])

  useEffect(() => {
    if(lessonTable[0] && vocabularyTable[0] && exampleTable[0]) {
      setIsLoaded(true)
      makeExamplesTable()
    } else {
      setIsLoaded(false)
    }
  }, [lessonTable, vocabularyTable, exampleTable])

  useEffect(() => {
    if(vocabularyTable[1]){
      filterVocabularyByInput(vocabSearchTerm,grammarSearchTerm)
      //console.log(suggestedVocab);
    }
  }, [vocabSearchTerm,grammarSearchTerm])

  useEffect(() => {
    makeExamplesTable()
  }, [selectedCourse, selectedLesson,requiredVocab,noSpanglish,shuffleSentences])

  return(
    <div className='flashcardFinder'>
      {(!isLoaded) && (
        <div>
          <h2>Loading Flashcard Data...</h2>
        </div>
      )}

      {(isLoaded)&&(<div>
      <div className = 'flashcardFinderHeader'>
        <h2>Flashcard Finder</h2>
        <div className='filterSection'>
          <div className='removeSpanglishBox'>
            <h3>Spanglish</h3>
            {(!noSpanglish) && (<button style={{backgroundColor: 'darkgreen'}} onClick={toggleSpanglish}>Included</button>)}
            {(noSpanglish) && (<button style={{backgroundColor: 'darkred'}} onClick={toggleSpanglish}>Excluded</button>)}
          </div>
          <div className='lessonFilter'>
            <h3>Search By lesson</h3>
            <form onSubmit={(e) => (e.preventDefault)}>
              <select className='courseList' onChange={(e) => updateActiveCourse(e.target.value)}>
                <option>–Choose Course–</option>
                {makeCourseSelector()}
              </select>
              {(selectedCourse.lessons) && (<select className='lessonList' value = {selectedLesson.lessonNumber} onChange={(e) => updateActiveLesson(e.target.value)}>
                {makeLessonSelector()}
              </select>)}
            </form>
          </div>
          <div className='wordFilter'>
            <h3>Search By Word</h3>
            <div className = 'wordSearchBox'>
                <div className='searchTermBox'>
                  <p>Word or Idiom</p>
                  <input type='text' onChange={(e) =>setVocabSearchTerm(e.target.value)}></input><br></br>
                </div>
                <div className='searchTermBox'>
                  <p>Grammatical Function</p>
                  <input type='text' onChange={(e) =>setGrammarSearchTerm(e.target.value)}></input>
                </div>
            </div>
            {(vocabSearchTerm.length > 0 || grammarSearchTerm.length > 0) && suggestedVocab.length > 0 && (
              <div className = 'vocabSuggestionBox'>
                {suggestedVocab.map((item) => {
                  return(
                    <div key={item.recordId} className='vocabCard' onClick = {() => addVocabToRequiredVocab(item.recordId)}>
                      <h4 className='vocabName'>{item.wordIdiom}</h4>
                      <p className = 'vocabSubcategory'>{item.vocabularySubcategorySubcategoryName}</p>
                      <p className='vocabUse'>{item.use}</p>
                    </div>
                  )
                })}
              </div>
            )}
            {(requiredVocab.length > 0) && (<div className='selectedVocab'>
              <p>Required Words:</p>
              {requiredVocab.map((item) => {
                return(
                  <div key={item.recordId} className='vocabCard' onClick = {() => removeVocabFromRequiredVocab(item.recordId)}>
                    <h4 className='vocabName'>{item.wordIdiom}</h4>
                    <p className = 'vocabSubcategory'>{item.vocabularySubcategorySubcategoryName}</p>
                    <p className='vocabUse'>{item.use}</p>
                  </div>
                )
              })}
            </div>)}
          </div>
        </div>
      </div>
      <div className='examplesTable'>
        <div className='buttonBox'>
          <button onClick={copyTable}>Copy Table</button>
        </div>
        {displayExamplesTable()}
      </div>
    </div>)}
  </div>)
}
