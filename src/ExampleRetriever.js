import React, {useState, useEffect, useRef} from 'react';
import { getVocabFromBackend, getExamplesFromBackend, createStudentExample, getLessonsFromBackend, getProgramsFromBackend, getAllUsersFromBackend, getStudentExamplesFromBackend} from './BackendFetchFunctions';
import './App.css';
import { useAuth0 } from '@auth0/auth0-react';

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
export default function ExampleRetriever({roles, user, programTable, studentExamplesTable, updateBannerMessage}) {
  const {getAccessTokenSilently} = useAuth0();
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeStudentExamplesTable, setActiveStudentExamplesTable] = useState([])
  const [vocabSearchTerm, setVocabSearchTerm] = useState('')
  const [grammarSearchTerm, setGrammarSearchTerm] = useState('')
  const [activeStudent, setActiveStudent] = useState(user||{})
  const [selectedCourse, setSelectedCourse] = useState({})
  const [selectedLesson, setSelectedLesson] = useState({})
  const [exampleTable, setExampleTable] = useState([])
  const [vocabularyTable, setVocabularyTable] = useState([])
  const [suggestedVocab, setSuggestedVocab] = useState([])
  const [requiredVocab, setRequiredVocab] = useState([])
  const [requiredTags, setRequiredTags] = useState([])
  const [noSpanglish, setNoSpanglish] = useState(false)
  const [displayExamples, setDisplayExamples] = useState([])
  const [studentList, setStudentList] = useState([])
  const [choosingStudent, setChoosingStudent] = useState(false)


  function toggleSpanglish () {
    if (noSpanglish) {
      setNoSpanglish(false)
    } else {
      setNoSpanglish(true)
    }
  }

  function changeStudent () {
    setChoosingStudent(true)
  }

  function keepStudent() {
    setChoosingStudent(false)
  }

  function updateActiveCourse (id) {
    console.log(id)
    //console.log(name)
    const chosenCourse = programTable.find(item=> item.recordId === parseInt(id))||{}
    console.log(programTable)
    console.log(chosenCourse)
    //console.log(course)
    setSelectedCourse(chosenCourse)
    //console.log(course.lessons)
    let lastLesson = {}
    if (activeStudent.recordId) {
      const studentCohort = activeStudent.cohort
      const cohortFieldName = `cohort${studentCohort}CurrentLesson`
      const currentLessonNumber = chosenCourse[cohortFieldName].toString()
      console.log(currentLessonNumber)
      lastLesson = chosenCourse.lessons.find(item => {
        const itemArray = item.lesson.split(' ')
        const itemString = itemArray.slice(-1)[0]
        const solution = (itemString === currentLessonNumber)
        return (solution)
      })
    } else if (chosenCourse.name) {
      const lastIndex = chosenCourse.lessons.length -1
      console.log(lastIndex)
      lastLesson = chosenCourse.lessons[lastIndex]
    }
    //console.log(lastLesson)
    setSelectedLesson(lastLesson||{})
  }

  function updateActiveStudent(studentID) {
    const studentIDNumber = parseInt(studentID)
    const newStudent = studentList.find((student) => (student.recordId === studentIDNumber))||{}
    setActiveStudent(newStudent)
  }

  async function updateActiveStudentExamplesTable() {
    console.log(activeStudent)
    if (activeStudent.recordId) {
      if (activeStudent.recordId === user.recordId) {
        console.log(studentExamplesTable)
        setActiveStudentExamplesTable(studentExamplesTable)
      } else {
      //console.log(userData)
        try {
            const accessToken = await getAccessTokenSilently({
              authorizationParams: {
                audience: "https://lcs-api.herokuapp.com/",
                scope: "openid profile email read:current-student update:current-student read:all-students update:all-students"
              },
            });
            //console.log(accessToken)
            //console.log(userData)
            const data = await getStudentExamplesFromBackend(accessToken, activeStudent.recordId)
            .then((result) => {
              console.log(result)
              setActiveStudentExamplesTable(result)
            });
        }   catch (e) {
            console.log(e.message);
        }
      }
    }
  }

  function makeStudentSelector () {
    if (roles.includes('admin')){
      const studentSelector = [<option key = {0} name = {'0'} value = {undefined}> – None Selected –</option>]
      studentList.forEach((student) => {
        studentSelector.push(<option key = {student.recordId} name={student.name} value = {student.recordId}>{student.name} ({student.emailAddress})</option>)
      })
      function studentSelectorSortFunction (a,b){
        const aName = a.props.name
        const bName = b.props.name
        if (aName > bName) {
          return 1
        } else {
          return -1
        }

      }
      studentSelector.sort(studentSelectorSortFunction)
      return studentSelector
    }
  }

  function makeCourseSelector () {
    if (!activeStudent.recordId){
      const courseSelector = [<option key = {-1} >–Choose Course–</option>]
      programTable.forEach((item)=> {
        courseSelector.push(<option key = {item.recordId} value = {item.recordId}> {item.name}</option>)
      })
      return courseSelector
    } else {
      const myCourse = programTable.find(item => item.recordId === activeStudent.relatedProgram)
      const courseSelector = <option key = {myCourse.recordId} value = {myCourse.recordId}>{myCourse.name}</option>
      return courseSelector
    }
  }

  function makeLessonSelector () {
    if (activeStudent.recordId){
      const lessonSelector = []
      const studentCohort = activeStudent.cohort
      const cohortFieldName = `cohort${studentCohort}CurrentLesson`
      const currentLessonNumber = selectedCourse[cohortFieldName]
      selectedCourse.lessons.forEach((lesson)=>{
        const lessonArray = lesson.lesson.split(" ")
        const lessonNumber = parseInt(lessonArray.slice(-1))
        if (lessonNumber <= currentLessonNumber) {
          lessonSelector.push(<option key = {lesson.lesson} value = {lesson.lesson}> Lesson {lessonNumber}</option>)
        }
      })
      return lessonSelector
    } else {
      const lessonSelector = []
      selectedCourse.lessons.forEach((lesson)=>{
        const lessonArray = lesson.lesson.split(" ")
        const lessonNumber = lessonArray.slice(-1)
        lessonSelector.push(<option key = {lesson.lesson} value = {lesson.lesson}> Lesson {lessonNumber}</option>)
      })
        return lessonSelector
    }
  }

  function updateActiveLesson (name) {
    const lesson = selectedCourse.lessons.find(element => element.lesson===name)
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
    const newRequiredVocab = requiredVocab.filter((item) => item.recordId!==vocabNumber)
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

  function filterExamplesBySelectedTags(examples) {
    if (requiredTags.length > 0){
      const filteredExamples = examples.filter(example => {
          if(example.vocabIncluded.length === 0 || example.vocabComplete === false) {
              return false
          }
          //console.log(example.vocabIncluded)
          let isGood = false
          requiredTags.forEach((word) => {
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

  async function addToMyFlashcards(recordId) {
      const currentExample = displayExamples.find(example => (example.recordId === recordId));
      //currentExample.isKnown = true;
      console.log(`adding example ${recordId} to student ${activeStudent.recordId}`)
      if (typeof(activeStudent.recordId)==='number') {
          //console.log(userData)
          try {
              const accessToken = await getAccessTokenSilently({
                authorizationParams: {
                  audience: "https://lcs-api.herokuapp.com/",
                  scope: "openid profile email read:current-student update:current-student read:all-students update:all-students"
                },
              });
              //console.log(accessToken)
              //console.log(userData)
              const data = await createStudentExample(accessToken, activeStudent.recordId, recordId)
              .then((result) => {
                console.log(result)
                if (result===1) {
                  updateBannerMessage('Flashcard Added!')
                } else {
                  updateBannerMessage('Failed to add Flashcard')
                }
                //console.log(result)
              });
          }   catch (e) {
              console.log(e.message);
          }
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
        {(activeStudent.recordId && <button value = {item.recordId} onClick = {(e) => addToMyFlashcards(e.target.value)}>Add</button>)}
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
      const lowerGrammar = `${term.vocabularySubcategorySubcategoryName.toLowerCase()}; ${term.use.toLowerCase()}; ${term.verbInfinitive.toLowerCase()}; ${term.conjugationTags.toString().toLowerCase()}`
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

  //function filterTagsByInput

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

  async function getStudentList () {
    console.log('getting Student List')
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openID email profile",
        },
      });
      //console.log(accessToken)
      const allStudentData = await getAllUsersFromBackend(accessToken)
      .then((result) => {
        //console.log(result)
        const usefulData = result;
        return usefulData
      });
      //console.log(examples)
      return allStudentData
    } catch (e) {
        console.log(e.message);
    }
  }

  let isMounted = false

  
  // called onced at the beginning
  useEffect(() => {
    async function startUp () {
      isMounted = true
      const getData = async () => {
        //console.log('init called')
        // retrieving the table data
        if (roles.includes('admin')){
          const studentListPromise = await getStudentList()
          //console.log(studentListPromise)
          setStudentList(studentListPromise[0])
        }
        const vocabPromise = await getVocab()
        const examplePromise = await getExamples()
        setVocabularyTable(await vocabPromise)
        setExampleTable(await examplePromise)
      };
      getData()
      //console.log('data fetched')
    }
    if (!isMounted) {
      startUp()
    }
  }, [])

  useEffect(() => {
    //console.log(activeStudent)
    if (activeStudent.recordId) {
      console.log('updating table with long name')
      if (isLoaded) {
        const studentCourse = activeStudent.relatedProgram
        updateActiveCourse(studentCourse)
      }
      updateActiveStudentExamplesTable()
    }
    setChoosingStudent(false)
  }, [activeStudent])

  useEffect(() => {
    if (!isLoaded) {
      if (roles.includes('admin')) {
        if(vocabularyTable[0] && exampleTable[0] && programTable[0] && studentList[0]) {
          setIsLoaded(true)
          console.log(studentList)
          if (activeStudent.recordId) {
            const activeCourse = programTable.find((item) => (activeStudent.relatedProgram === item.recordId))
            updateActiveCourse(activeCourse.recordId)
          }
          makeExamplesTable()
          //console.log(programTable)
        } else {
          setIsLoaded(false)
        }
      } else {
        if(vocabularyTable[0] && exampleTable[0] && programTable[0]) {
          setIsLoaded(true)
          if (activeStudent.recordId) {
            const activeCourse = programTable.find((item) => (activeStudent.relatedProgram === item.recordId))
            updateActiveCourse(activeCourse.recordId)
          }
          makeExamplesTable()
          //console.log(programTable)
        } else {
          setIsLoaded(false)
        }
      } 
    }
  }, [vocabularyTable, exampleTable, programTable, studentList])

  useEffect(() => {
    if(vocabularyTable[1]){
      filterVocabularyByInput(vocabSearchTerm,grammarSearchTerm)
      //console.log(suggestedVocab);
    }
  }, [vocabSearchTerm,grammarSearchTerm])

  useEffect(() => {
    makeExamplesTable()
  }, [selectedCourse, selectedLesson,requiredVocab,noSpanglish])

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
        {roles.includes('admin') && !choosingStudent && <div className='buttonBox'>
                {activeStudent.recordId && <button onClick={changeStudent}>Editing: {activeStudent.name} ({activeStudent.emailAddress})</button>}
                {!activeStudent.recordId && <button onClick={changeStudent}>Choose Student</button>}
            </div>}
        <div className='filterSection'>
          <div className='removeSpanglishBox'>
            <h3>Spanglish</h3>
            {(!noSpanglish) && (<button style={{backgroundColor: 'darkgreen'}} onClick={toggleSpanglish}>Included</button>)}
            {(noSpanglish) && (<button style={{backgroundColor: 'darkred'}} onClick={toggleSpanglish}>Excluded</button>)}
          </div>
          <div className='lessonFilter'>
            {roles.includes('admin') && choosingStudent && <form onSubmit={(e) => (e.preventDefault)}>
              <h3>Change Student</h3>
              <select className='studentList' value = {activeStudent?activeStudent.recordId:{}} onChange={(e) => updateActiveStudent(e.target.value)}>
                {makeStudentSelector()}
              </select>
              <div className='buttonBox'>
                <button onClick={keepStudent}>Select Student</button>
              </div>
            </form>}
            {!choosingStudent && <form onSubmit={(e) => (e.preventDefault)}>
              <h3>Search By lesson</h3>
              <select className='courseList' value = {selectedCourse?selectedCourse.recordId:2} onChange={(e) => updateActiveCourse(e.target.value)}>
                {makeCourseSelector()}
              </select>
              {(selectedCourse.lessons) && (<select className='lessonList' value = {selectedLesson?selectedLesson.lesson:''} onChange={(e) => updateActiveLesson(e.target.value)}>
                {makeLessonSelector()}
              </select>)}
            </form>}
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
                      <p className = 'vocabSubcategory'>Subcategory: {item.vocabularySubcategorySubcategoryName}</p>
                      <p className='vocabUse'>{item.use?'Use: ':undefined} {item.use}</p>
                      <p className='vocabInfinitive'>{item.verbInfinitive?'Infinitive: ':undefined} {item.verbInfinitive}</p>
                      <p className='vocabConjugation'>{item.conjugationTags[0]?'Conjugation: ':undefined} {item.conjugationTags.toString()}</p>
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
                    <p className = 'vocabSubcategory'>Subcategory: {item.vocabularySubcategorySubcategoryName}</p>
                    <p className='vocabUse'>{item.use?'Use: ':undefined} {item.use}</p>
                    <p className='vocabInfinitive'>{item.verbInfinitive?'Infinitive: ':undefined} {item.verbInfinitive}</p>
                    <p className='vocabConjugation'>{item.conjugationTags[0]?'Conjugation: ':undefined} {item.conjugationTags.toString()}</p>
                  </div>
                )
              })}
            </div>)}
          </div>
          {/*<div className='tagFilter'>
            <h3>Search By Tag</h3>
            <div className = 'tagSearchBox'>
                <div className='searchTermBox'>
                  <p>Grammatical Tag</p>
                  <input type='text' onChange={(e) =>setGrammarSearchTerm(e.target.value)}></input><br></br>
                </div>
            </div>
            {(vocabSearchTerm.length > 0 || grammarSearchTerm.length > 0) && suggestedVocab.length > 0 && (
              <div className = 'tagSuggestionBox'>
                {suggestedVocab.map((item) => {
                  return(
                    <div key={item.recordId} className='vocabCard' onClick = {() => addVocabToRequiredVocab(item.recordId)}>
                      <h4 className='vocabName'>{item.wordIdiom}</h4>
                      <p className = 'vocabSubcategory'>Subcategory: {item.vocabularySubcategorySubcategoryName}</p>
                      <p className='vocabUse'>{item.use?'Use: ':undefined} {item.use}</p>
                      <p className='vocabInfinitive'>{item.verbInfinitive?'Infinitive: ':undefined} {item.verbInfinitive}</p>
                      <p className='vocabConjugation'>{item.conjugationTags[0]?'Conjugation: ':undefined} {item.conjugationTags.toString()}</p>
                    </div>
                  )
                })}
              </div>
            )}
            {(requiredVocab.length > 0) && (<div className='selectedVocab'>
              <p>Required Tags:</p>
              {requiredVocab.map((item) => {
                return(
                  <div key={item.recordId} className='vocabCard' onClick = {() => removeVocabFromRequiredVocab(item.recordId)}>
                    <h4 className='vocabName'>{item.wordIdiom}</h4>
                    <p className = 'vocabSubcategory'>Subcategory: {item.vocabularySubcategorySubcategoryName}</p>
                    <p className='vocabUse'>{item.use?'Use: ':undefined} {item.use}</p>
                    <p className='vocabInfinitive'>{item.verbInfinitive?'Infinitive: ':undefined} {item.verbInfinitive}</p>
                    <p className='vocabConjugation'>{item.conjugationTags[0]?'Conjugation: ':undefined} {item.conjugationTags.toString()}</p>
                  </div>
                )
              })}
            </div>)}
            </div>*/}
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
