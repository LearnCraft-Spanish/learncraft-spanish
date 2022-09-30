import React, {useState, useEffect, useRef} from 'react';
import { qb } from './QuickbaseTablesInfo';
import { fetchAndCreateTable, getVocabFromBackend, getExamplesFromBackend, getLessonsFromBackend} from './QuickbaseFetchFunctions';
import './App.css';

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
export default function ExampleRetriever() {
  // stores data of tables
  const tables = useRef({ vocab: [], lessons: [] })
  // vocab related variables
  // array of suggested vocab that shows up under search bar & changes whenever a user types something in the search bar
  const [filteredVocab, setFilteredVocab] = useState([])
  // array of vocab that user builds, which is then used to filter example sentences
  const [customSearchVocab, setCustomSearchVocab] = useState([])

  // examples related variables
  const [noSpanglish, setNoSpanglish] = useState(false)
  const [shuffledSentences, setShuffledSentences] = useState(false)
  // array of examples, stores the first part of the filtering
  const filteredExamples = useRef([])
  // array of examples that are displayed, does the 2nd part of the filtering
  // it is split into 2 separate variables in order to avoid redundancy
  const [displayExamples, setDisplayExamples] = useState([])



  
  // called when user clicks 'Retrieve Sentences' button on top right of page
  // makes the page display the filtered example sentences on the bottom of page
  function handleRetrieveSentencesOnClick(e) {
    e.preventDefault() // prevents page from refreshing
    const selectedLesson = e.target.firstChild.value // gets selected value in dropdown list of lessons
    // if selected lesson is '' display all examples,
    // else 
    const filter1 = selectedLesson === '' ? tables.current.examples : filterExamplesStrict(retrieveCombinedLessonVocab(selectedLesson, tables.current.lessons), tables.current.examples)
    const filter2 = filterExamplesLenient(customSearchVocab, filter1)
    filteredExamples.current = filter2
    filterExamplesHelper()
  }

  // helper function called by handleRetrieveSentencesOnClick()
  // returns an array of all lessons with same title and lower/equal lesson number
  // for example: AS Lesson 3 will return ['AS Lesson 1', 'AS Lesson 2', 'AS Lesson 3']
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

  // helper function called by handleRetrieveSentencesOnClick()
  // returns filtered array of examples by vocab with a strict filter
  // meaning each example MUST include all vocab in vocabArr
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

  // helper function called by handleRetrieveSentencesOnClick()
  // returns filtered array of examples by vocab with a lenient filter
  // meaning as long as the example contains at least one of the vocab in vocabArr, then the example will be in the returned array
  function filterExamplesLenient(vocabArr, examplesTable) {
      const filteredExamples = vocabArr.length === 0 ? examplesTable : examplesTable.filter(example => {
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

  // helper function called by handleRetrieveSentencesOnClick() & the 2nd useEffect() below
  // checks if noSpanglish & shuffleSentences and then sets the displayExamples
  function filterExamplesHelper() {
    const filter2 = filteredExamples.current
    const filter3 = noSpanglish ? filter2.filter(example => example.spanglish === 'esp') : filter2
    const filter4 = shuffledSentences ? shuffleArray(filter3) : filter3
    setDisplayExamples(filter4)
  }

  // helper function called by filterExamplesHelper()
  // returns a shuffled array of examples array in parameter 
  function shuffleArray(arr) {       
    const shuffledArr = [...arr]
    for(let i = shuffledArr.length; i > 0; i--) {
        const newIndex = Math.floor(Math.random() * (i - 1))
        const oldValue = shuffledArr[newIndex]
        shuffledArr[newIndex] = shuffledArr[i - 1]
        shuffledArr[i - 1] = oldValue
    }
    return shuffledArr
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

  // called by 1st useEffect(), when first loading the page
  // gets user token & retrieves all table data & stores it into tables variable
  // to set up all needed variables
  async function init() {
    // getting the user token
    //const queryParams = new URLSearchParams(window.location.search)
    //const ut = queryParams.get('ut') // user token
    
    // retrieving the table data
    tables.current.vocab = await getVocabFromBackend();
    console.log(tables.current.vocab[32]);
    console.log('vocab')
    tables.current.examples = await getExamplesFromBackend();
    console.log('example')
    console.log(tables.current.examples[12]);
    tables.current.lessons = await getLessonsFromBackend();
    // this logic below sorts the lesssons in order by number
    tables.current.lessons.sort((a, b)=>{
      const splitArrA = a.lesson.split(' ')
      const numA = parseInt(splitArrA.pop())
      const titleA = splitArrA.join(' ')

      const splitArrB = b.lesson.split(' ')
      const numB = parseInt(splitArrB.pop())
      const titleB = splitArrB.join(' ')

      return titleA === titleB ? numA - numB : titleA - titleB
    })
    console.log('lessons')
    console.log(tables.current.lessons[12]);
    setFilteredVocab(tables.current.vocab)
  }

  // called onced at the beginning
  useEffect(() => {       
    init() 
    //console.log(tables)       
}, [tables])

  // called everytime user clicks the checkbox for noSpanish or shuffleSentences
  useEffect(() => {
    if(tables.current.lessons.length !== 0) {
    filterExamplesHelper()
    }
  }, [noSpanglish, shuffledSentences])

  return <div>
      <div className='div-header'><h1>Example Retriever</h1></div>
      <div className='div-vocab'>
        {/* Top left section--------------------------------------------------------------------------- */}
        <div className='div-vocab-left'>
          <div className='div-vocab-left-header'>    
            <form onSubmit={(e) => {
              e.preventDefault()
              setCustomSearchVocab([...customSearchVocab, e.target.firstChild.value])
              e.target.firstChild.value = ''
              setFilteredVocab(tables.current.vocab)
            }}>    
              <input className='search' type='text' onChange={(e)=>setFilteredVocab(tables.current.vocab.filter(vocab => vocab.vocabName.toLowerCase().includes(e.target.value.toLowerCase())))}></input>
              <button className='add-to-search-query'>Add to Search Query {'>>'} </button>
            </form>
          </div>
          <ul className='suggestions'>
            {filteredVocab.map((vocab, id) => {
                return (<li key={id} onClick={(e) => setCustomSearchVocab([...customSearchVocab, vocab.vocabName])}>{vocab.vocabName}</li>)
            })}
          </ul>
        </div>
        {/* Top right section---------------------------------------------------------------------------- */}
        <div className='div-vocab-right'>
          <div className='div-vocab-right-header'>
            <form onSubmit={(e)=>handleRetrieveSentencesOnClick(e)}>
              <select className='lesson-select'>
                <option value=''>No lesson filter</option>
                {/*lessonTitleSelect.options.map((option, id) => (<option key={id} title={createLessonTitle(option)}>{option}</option>))*/
                tables.current.lessons.map((lesson, id)=>(<option key={id} title={lesson.vocabIncluded.join('\n')}>{lesson.lesson}</option>))
                }
              </select>
              <button className='retrieve-sentences'>Retrieve Sentences</button>
            </form>
          </div>
          <div>
            {customSearchVocab.map((vocab, id) => (<button key={id} className='custom-vocab' onClick={(e)=>setCustomSearchVocab(customSearchVocab.filter(vocab=>vocab!==e.target.value))} value={vocab}>{vocab}</button>))}
          </div>
        </div>
      </div>
      {/* Mid section with the copy buttons------------------------------------------------------------------ */}
      <div className='div-examples-header'>
        <div>
          <button onClick={copySentences}>Copy as List</button>
          <button onClick={copyTable}>Copy as Table</button>
          <input type='checkbox' name='spanglishCheckbox' onChange={(e) => setNoSpanglish(e.target.checked)}></input><label htmlFor='spanglishCheckbox'>No Spanglish? </label>
          <input type='checkbox' name='shuffledCheckbox'  onChange={(e) => setShuffledSentences(e.target.checked)}></input><label htmlFor='shuffledCheckbox'>Shuffle Sentences? </label>
        </div>
        <div>Num of Results: {displayExamples.length}</div>
      </div>
      {/* Bottom section with list of examples-------------------------------------------------------------- */}
      <div className='div-examples'>
        <table>
          <thead>
            <tr>
              <th>Spanish</th>
              <th>English</th>
              <th>Vocab/Idioms</th>
            </tr>
          </thead>
          <tbody>
            { displayExamples.map((example, id) => {
              return(<tr key={id}>
                <td>{example.spanishExample}</td>
                <td>{example.englishTranslation}</td>
                <td>{example.vocabIncluded.map((vocab, id) => {
                    return(<button key={id} className='vocab-included-button' disabled>{vocab}</button>)
                })}</td>
              </tr>)
            })}
          </tbody>
        </table>
      </div>
  </div>;
}
