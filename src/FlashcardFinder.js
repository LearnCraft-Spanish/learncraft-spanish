import React, {useState, useEffect, useRef} from 'react';
import { getVocabFromBackend, getVerifiedExamplesFromBackend, createStudentExample, createMyStudentExample, getLessonsFromBackend, getProgramsFromBackend, getAllUsersFromBackend} from './BackendFetchFunctions';
import './App.css';
import { useAuth0 } from '@auth0/auth0-react';
import LessonSelector from './LessonSelector' 
import { isLabelWithInternallyDisabledControl } from '@testing-library/user-event/dist/utils';

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
export default function FlashcardFinder({roles, activeStudent, programTable, studentExamplesTable, flashcardDataComplete, activeProgram, activeLesson, addToActiveStudentFlashcards}) {
  const {getAccessTokenSilently} = useAuth0();
  const [isLoaded, setIsLoaded] = useState(false)
  const [vocabSearchTerm, setVocabSearchTerm] = useState('')
  const [tagSearchTerm, setTagSearchTerm] = useState('')
  const [vocabularyTable, setVocabularyTable] = useState([])
  const [tagTable, setTagTable] = useState([])
  const [suggestedVocab, setSuggestedVocab] = useState([])
  const [suggestedTags, setSuggestedTags] = useState([])
  const [requiredVocab, setRequiredVocab] = useState([])
  const [requiredTags, setRequiredTags] = useState([])
  const [exampleTable, setExampleTable] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(activeLesson)
  const [selectedProgram, setSelectedProgram] = useState(activeProgram)
  const [noSpanglish, setNoSpanglish] = useState(false)
  const [displayExamples, setDisplayExamples] = useState([])

  function toggleSpanglish () {
    if (noSpanglish) {
      setNoSpanglish(false)
    } else {
      setNoSpanglish(true)
    }
  }

  //selected lesson is the one chosen up to a maximum of the student's Active lesson
  function updateSelectedLesson (lessonId) {
    console.log(lessonId)
    let newLesson = {}
    programTable.forEach(program =>{
      const foundLesson = program.lessons.find(item => item.recordId === parseInt(lessonId))
      if (foundLesson){
        newLesson = foundLesson
        console.log(foundLesson)
      }
    })
    setSelectedLesson(newLesson||activeLesson)
  }

  function updateSelectedProgram (programId) {
    const programIdNumber = parseInt(programId)
    const newProgram = programTable.find(program => program.recordId === programIdNumber)
    setSelectedProgram(newProgram||{})
    if (activeProgram.recordId){
      let lessonToSelect = 0
      newProgram.lessons.forEach((lesson)=>{
        if (parseInt(lesson.recordId) <= parseInt(activeLesson.recordId)){
          lessonToSelect = lesson.recordId
        }
      })
      updateSelectedLesson(lessonToSelect)
    } else {
      let lessonToSelect = 0
      newProgram.lessons.forEach((lesson)=>{
        lessonToSelect = lesson.recordId
      })
      updateSelectedLesson(lessonToSelect)
    }
  }

  function addVocabToRequiredVocab (vocabNumber) {
    const vocabObject = vocabularyTable.find(object => (object.recordId === vocabNumber))
    //console.log(vocabObject)
    const newRequiredVocab = [...requiredVocab];
    newRequiredVocab.push(vocabObject)
    //console.log(newRequiredVocab)
    setRequiredVocab(newRequiredVocab)
    setVocabSearchTerm("")
  }

  function addTagToRequiredTags (id) {
    console.log(id)
    const tagObject = tagTable.find(object => (object.id === id))
    console.log(tagObject)
    const newRequiredTags = [...requiredTags];
    newRequiredTags.push(tagObject)
    console.log(requiredTags)
    console.log(newRequiredTags)
    setRequiredTags(newRequiredTags)
    setTagSearchTerm("")
  }

  function removeVocabFromRequiredVocab (vocabNumber) {
    const newRequiredVocab = requiredVocab.filter((item) => item.recordId!==vocabNumber)
    setRequiredVocab(newRequiredVocab)
  }

  function removeTagFromRequiredTags (id) {
    const newRequiredTags = requiredTags.filter((item) => (item.id !==id))
    setRequiredTags(newRequiredTags)
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

  function labelAssignedExamples(examples) {
    examples.forEach(example => {
      const assignedExample = studentExamplesTable.find(item => item.relatedExample === example.recordId)
      if (assignedExample) {
        example.isAssigned = true
      } else {
        example.isAssigned = false
      }
    })
    return examples
  }

  function filterExamplesBySelectedTags(examples) {
    if (requiredTags.length > 0){
      const filteredExamples = examples.filter(example => {
          if(example.vocabIncluded.length === 0 || example.vocabComplete === false) {
              return false
          }
          //console.log(example.vocabIncluded)
          let isGood = false
          requiredTags.forEach((tag) => {
            //console.log(word.vocabName)
            if (!isGood) {
              switch (tag.type) {
                case 'subcategory':
                  example.vocabIncluded.forEach(item =>{
                    const word = vocabularyTable.find(element => element.vocabName === item)
                    if (word.vocabularySubcategorySubcategoryName === tag.tag){
                      isGood = true
                      return
                    }
                  })
                  break
                case 'infinitive':
                  example.vocabIncluded.forEach(item =>{
                    const word = vocabularyTable.find(element => element.vocabName === item)
                    if (word.verbInfinitive === tag.tag) {
                      isGood = true
                      return
                    }
                  })
                  break
                case 'conjugation':
                  example.vocabIncluded.forEach(item =>{
                    const word = vocabularyTable.find(element => element.vocabName === item)
                    word.conjugationTags.forEach(conjugationTag => {
                      if (conjugationTag === tag.tag){
                        isGood = true
                        return
                      }
                    })
                  })
                  break
              }
            } else {
              return
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
    console.log('refreshing example table')
    const allExamples = [...exampleTable]
    const filteredBySpanglish = filterBySpanglish(allExamples)
    const filteredByRequired = filterExamplesBySelectedVocab(filteredBySpanglish)
    const filteredByAllowed = filterExamplesByAllowedVocab(filteredByRequired)
    const filteredByTags = filterExamplesBySelectedTags(filteredByAllowed)
    const labeledByAssigned = labelAssignedExamples(filteredByTags)
    const shuffledSentences = shuffleExamples(labeledByAssigned)
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
        {(activeStudent.recordId && !item.isAssigned && <button className = 'addButton' value = {item.recordId} onClick = {(e) => addToActiveStudentFlashcards(e.target.value)}>Add</button>)}
        {(activeStudent.recordId && item.isAssigned && <button className = 'ownedButton' value = {item.recordId} >Owned</button>)}
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


  function filterVocabularyByInput (vocabInput) {
    //console.log(grammarInput)
    function filterByKnown (term) {
      if (selectedLesson.vocabKnown.includes(term.vocabName)||!selectedLesson.vocabKnown){
        return true
      }
      return false
    }

    function filterBySearch (term) {
      const lowerTerm = term.wordIdiom.toLowerCase()
      const lowerVocabInput = vocabInput.toLowerCase()
      if (lowerTerm.includes(lowerVocabInput)){
        return true
      }
      return false
    }

    function filterBySelected (term) {
      if (requiredVocab.includes(term)){
        return false
      }
      return true
    }

    const filteredByKnown = selectedLesson.vocabKnown?vocabularyTable.filter(filterByKnown):vocabularyTable
    const filteredBySearch = filteredByKnown.filter(filterBySearch)
    const filteredBySelected = filteredBySearch.filter(filterBySelected)
    const suggestTen = []
    for (let i = 0; i < 10; i++){
      if(filteredBySelected[i]) {
        suggestTen.push(filteredBySelected[i])
      }
    }
    setSuggestedVocab(suggestTen);
  }

  function filterTagsByInput (tagInput) {
    function filterBySearch (tag) {
      const lowerTerm = tag.tag.toLowerCase()
      const lowerTagInput = tagInput.toLowerCase()
      if (lowerTerm.includes(lowerTagInput)){
        return true
      }
      return false
    }
    const filteredBySearch = tagTable.filter(filterBySearch);
    const suggestTen = []
    for (let i = 0; i < 10; i++){
      if(filteredBySearch[i]) {
        suggestTen.push(filteredBySearch[i])
      }
    }
    setSuggestedTags(suggestTen);
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
      const tags = []
      vocab.forEach(term => {
        if (term.vocabularySubcategorySubcategoryName) {
          const subcatTag = {type: 'subcategory',tag: term.vocabularySubcategorySubcategoryName, id: tags.length}
          if (!tags.find(item => item.type === 'subcategory' && item.tag === term.vocabularySubcategorySubcategoryName)){
            tags.push(subcatTag)
          }
        }
        if (term.verbInfinitive) {
          const infinitiveTag = {type: 'infinitive', tag: term.verbInfinitive, id: tags.length}
          if (!tags.find(item => item.type === 'infinitive' && item.tag === term.verbInfinitive)){
            tags.push(infinitiveTag)
          }
        }
        if (term.conjugationTags.length > 0){
          term.conjugationTags.forEach(conjugation => {
            const conjugationTag = {type: 'conjugation', tag: conjugation, id: tags.length}
            if (!tags.find(item => item.type ==='conjugation' && item.tag === conjugation)){
              tags.push(conjugationTag)
            }
          })
        }
      })
      setTagTable(tags)
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
      const examples = await getVerifiedExamplesFromBackend(accessToken)
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

  let isMounted = false

  
  // called onced at the beginning
  useEffect(() => {
    async function startUp () {
      isMounted = true
      const getData = async () => {
        //console.log('init called')
        // retrieving the table data
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
    if (selectedLesson && selectedProgram) {
      setSelectedProgram(activeProgram)
      setSelectedLesson(activeLesson)
    }
  }, [activeProgram, activeLesson])

  useEffect(() => {
    if (!isLoaded) {
        if (roles.includes('admin')) {
          if(vocabularyTable[0] && tagTable[0] && exampleTable[0] && programTable[0]) {
            setIsLoaded(true)
            if (activeStudent.recordId) {
              const activeCourse = programTable.find((item) => (activeStudent.relatedProgram === item.recordId))
              updateSelectedProgram(activeCourse.recordId)
            }
            makeExamplesTable()
            //console.log(programTable)
          } else {
            setIsLoaded(false)
          }
        } else {
          if(vocabularyTable[0] && tagTable[0] && exampleTable[0] && programTable[0]) {
            setIsLoaded(true)
            if (activeStudent.recordId) {
              const activeCourse = programTable.find((item) => (activeStudent.relatedProgram === item.recordId))
              updateSelectedProgram(activeCourse.recordId)
            }
            makeExamplesTable()
            //console.log(programTable)
          } else {
            setIsLoaded(false)
          }
        } 
      }
  }, [vocabularyTable, tagTable, exampleTable, programTable])

  useEffect(() => {
    if(vocabularyTable[1]){
      filterVocabularyByInput(vocabSearchTerm)
      //console.log(suggestedVocab);
    }
  }, [vocabSearchTerm])

  useEffect(() => {
    filterTagsByInput(tagSearchTerm)
  }, [tagSearchTerm])

  useEffect(() => {
    if (selectedProgram && selectedLesson && flashcardDataComplete) {
      makeExamplesTable()
    }
  }, [selectedProgram, selectedLesson, requiredVocab, requiredTags, noSpanglish, studentExamplesTable, flashcardDataComplete])

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
          <div className='filterBox'>
            <div className='removeSpanglishBox'>
              <h3>Spanglish</h3>
              {(!noSpanglish) && (<button style={{backgroundColor: 'darkgreen'}} onClick={toggleSpanglish}>Included</button>)}
              {(noSpanglish) && (<button style={{backgroundColor: 'darkred'}} onClick={toggleSpanglish}>Excluded</button>)}
            </div>
            <LessonSelector programTable = {programTable} activeProgram = {activeProgram} activeLesson = {activeLesson} selectedLesson = {selectedLesson} updateSelectedLesson = {updateSelectedLesson} selectedProgram = {selectedProgram} updateSelectedProgram = {updateSelectedProgram} />
          </div>
          <div className='filterBox'>
            <div className='wordFilter'>
              <h3>Search By Word</h3>
              <div className = 'wordSearchBox'>
                  <div className='searchTermBox'>
                    <p>Word or Idiom</p>
                    <input type='text' onChange={(e) =>setVocabSearchTerm(e.target.value)}></input><br></br>
                  </div>
              </div>
              {(vocabSearchTerm.length > 0) && suggestedVocab.length > 0 && (
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
                <h5>Required Words:</h5>
                {requiredVocab.map((item) => {
                  return(
                    <div key={item.recordId} className='vocabSmallCard' onClick = {() => removeVocabFromRequiredVocab(item.recordId)}>
                      <h4 className='vocabName'>{item.vocabName}</h4>
                    </div>
                  )
                })}
              </div>)}
            </div>
            <div className='tagFilter'>
              <h3>Search By Tag</h3>
              <div className = 'tagSearchBox'>
                  <div className='searchTermBox'>
                    <p>Grammar Tag</p>
                    <input type='text' onChange={(e) =>setTagSearchTerm(e.target.value)}></input><br></br>
                  </div>
              </div>
              {(tagSearchTerm.length > 0) && suggestedTags.length > 0 && (
                <div className = 'tagSuggestionBox'>
                  {suggestedTags.map((item) => {
                    return(
                      <div key={item.tag} value = {item.id} className='vocabCard' onClick = {() => addTagToRequiredTags(item.id)}>
                        <h4 className='vocabName'>{item.tag}</h4>
                        <p className='vocabUse'>{'type: '+item.type}</p>
                      </div>
                    )
                  })}
                </div>
              )}
              {(requiredTags.length > 0) && (<div className='selectedVocab'>
                <h5>Required Tags:</h5>
                {requiredTags.map((item) => {
                  return(
                    <div key={item.tag} value = {item.id} className='vocabSmallCard' onClick = {() => removeTagFromRequiredTags(item.id)}>
                      <h4 className='vocabName'>{item.tag}</h4>
                    </div>
                  )
                })}
              </div>)}
            </div>
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
