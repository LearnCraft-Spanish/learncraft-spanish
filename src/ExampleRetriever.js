import React, {useState, useEffect, useRef} from 'react';
import { getVocabFromBackend, getExamplesFromBackend, getLessonsFromBackend} from './BackendFetchFunctions';
import './App.css';
import { useAuth0 } from '@auth0/auth0-react';

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
export default function ExampleRetriever({resetFunction}) {
  const {getAccessTokenSilently} = useAuth0();
  const filteredExamples = useRef([])
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [lessonTable, setLessonTable] = useState([])
  const [exampleTable, setExampleTable] = useState([])
  const [vocabularyTable, setVocabularyTable] = useState([])
  const [suggestedVocab, setSuggestedVocab] = useState([])
  const [requiredVocab, setRequiredVocab] = useState([])
  const [allowedVocab, setAllowedVocab] =useState([])
  const [noSpanglish, setNoSpanglish] = useState(false)
  const [displayExamples, setDisplayExamples] = useState([])

  // called when user clicks 'Retrieve Sentences' button on top right of page
  // makes the page display the filtered example sentences on the bottom of page
  function handleRetrieveSentencesOnClick(e) {
    e.preventDefault() // prevents page from refreshing
    const selectedLesson = e.target.firstChild.value // gets selected value in dropdown list of lessons
    // if selected lesson is '' display all examples,
    // else 
    const filter1 = selectedLesson === '' ? exampleTable : filterExamplesBySelectedVocab(retrieveCombinedLessonVocab(selectedLesson, lessonTable), exampleTable)
    filteredExamples.current = filter1
  }

  function retrieveCombinedLessonVocab (selectedLessonName, lessonsTable) {
    let selectedLessonSortNumber;

    lessonsTable.forEach((lesson) => {
      if (lesson.lesson === selectedLessonName) {
        selectedLessonSortNumber = lesson.sortReference
      }
    })

    let firstRefIncluded
    if (selectedLessonSortNumber > 12) {
      firstRefIncluded = 13
    } else {
      firstRefIncluded = 1
    }
    let combinedLessonVocab = []
    lessonsTable.forEach((lesson) => {
      if(lesson.sortReference <= selectedLessonSortNumber && lesson.sortReference >= firstRefIncluded) {
        combinedLessonVocab = [...combinedLessonVocab, ...lesson.vocabIncluded]
    }
    })
    //console.log(combinedLessonVocab);
    return combinedLessonVocab;
  }

  function filterExamplesBySelectedVocab(vocabArr, examplesTable) {
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

  function filterExamplesByAllowedVocab() {

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
    const headers = 'Spanish\tEnglish\n'
    const table = displayExamples.map(example => {
        return example.spanishExample + '\t' + example.englishTranslation
    }).join('\n')

    const copiedText = headers + table
    navigator.clipboard.writeText(copiedText)
  }

  function filterVocabularyByInput (input) {
    function filterFunction (term) {
      const lowerTerm = term.wordIdiom.toLowerCase()
      const lowerInput = input.toLowerCase()
      if (lowerTerm.includes(lowerInput)){
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
        console.log('init called')
        // retrieving the table data
        const vocabPromise = await getVocab()
        const examplePromise = await getExamples()
        const lessonPromise = await getLessons()
        return [await vocabPromise, await examplePromise, await lessonPromise]
      };
      const beginningData = await getData()
      //console.log(beginningData[0])
      setVocabularyTable(beginningData[0])
      setAllowedVocab(beginningData[0])
      setExampleTable(beginningData[1])
      setLessonTable(beginningData[2])
      console.log('data fetched')
    }
    startUp()
  }, [])

  useEffect(() => {
    if(lessonTable[0] && vocabularyTable[0] && exampleTable[0]) {
      setIsLoaded(true)
    } else {
      setIsLoaded(false)
    }
  }, [lessonTable, vocabularyTable, exampleTable])

  useEffect(() => {
    if(vocabularyTable[1]){
      filterVocabularyByInput(searchTerm)
      //console.log(suggestedVocab);
    }
  }, [searchTerm])

  return(
    <div className='sentenceLookup'>
      {(!isLoaded) && (
        <div>
          <div className='buttonBox'>
            <button onClick={resetFunction}>Back to Menu</button>
          </div>
          <h2>Loading Flashcard Data...</h2>
        </div>
      )}
      {(isLoaded)&&(<div className='filterSection'>
        <div className='wordFilter'>
          <div className = 'wordSearchBox'>
              <p>Search By Word</p>
              <input type='text' onChange={(e) =>setSearchTerm(e.target.value)}></input>
          </div>
          {suggestedVocab[0] && (
            <div>
              {suggestedVocab.map((item) => {
                return(
                  <div key={item.recordId} className='vocabCard'>
                    <h4 className='vocabName'>{item.wordIdiom}</h4>
                    <p className = 'vocabSubcategory'>{item.vocabularySubcategorySubcategoryName}</p>
                    <p className='vocabUse'>{item.use}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div className='lessonFilter'>
          <div className='buttonBox'>
            <button onClick={resetFunction}>Back to Menu</button>
          </div>
          <form onSubmit={(e) => (e.preventDefault)}>
            <select className='courseList'>
              <list>
                <li></li>
              </list>
            </select>
          </form>

        </div>
      </div>)}
      <div className='examplesTable'>

      </div>
    </div>)
}
