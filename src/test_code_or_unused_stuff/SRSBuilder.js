import React, {useState, useEffect, useRef} from 'react';
import { qb } from './QuickbaseTablesInfo';
import { fetchAndCreateTable, createStudentExample } from './QuickbaseFetchFunctions';
import './SRSBuilder.css'

// This is a COPY/PASTE/EDIT of ExampleRetriever.js
// The new functions are:
// - setAllCheckedboxes()
// - setOneCheckedbox()
// - handleAddCheck()
//
// init() & the return <div> are also slighly different from ExampleRetriever.js's
//
// This script displays the SRS Builder, which is what user uses to add more examples to be used in SRS quiz tool
export default function SRSBuilder() {
  const tables = useRef({ vocab: [], lessons: [], students: [], studentExamples: [] })
  // vocab
  const [filteredVocab, setFilteredVocab] = useState([])
  const [customSearchVocab, setCustomSearchVocab] = useState([])
  // examples
  const [noSpanglish, setNoSpanglish] = useState(false)
  const [shuffledSentences, setShuffledSentences] = useState(false)
  const filteredExamples = useRef([])
  const [displayExamples, setDisplayExamples] = useState([])

  const [currentStudent, setCurrentStudent] = useState(3)
  const [selectAll, setSelectAll] = useState(false)






  function setAllCheckboxes(isChecked) {
    const newDisplayExamples = displayExamples.map(ex=>{
      ex.selected = isChecked
      return ex
    })
    setSelectAll(!selectAll)
    setDisplayExamples(newDisplayExamples)
  }

  function setOneCheckbox(isChecked, rid) {
    const newDisplayExamples = displayExamples.map(ex=>{
      ex.selected = ex.recordId === rid ? !ex.selected : ex.selected
      return ex
    })
    if(selectAll) {
      setSelectAll(false)
    }
    setDisplayExamples(newDisplayExamples)
  }

  // called when clicking 'Added checked sentences to student's SRS list' button
  // creates new entry on student examples for every checked example for corresponding student
  // also checks if example already exists, so it does not create duplicate
  async function handleAddChecked() {
    // console.log('display exs: ', displayExamples.map(ex=>ex.selected))
    // const hace10m = new Date()
    // hace10m.setMinutes(hace10m.getMinutes() - 10)
    // if(hace10m < 0) {
    //   //style is red
    // }
    // const today = new Date()
    // console.log('today', today)
    // today.setMinutes(today.getMinutes() - 10)
    // console.log('today - 10', today)
    // const day2 = tables.current.studentExamples[0].dateCreated
    // const day3 = new Date(day2)
    // console.log('day2: ', day2)
    // console.log('day3: ', day3)
    // const d4 = day3 + 100
    // console.log('d4: ', d4)

    // console.log('if: ', day3 < today)
    // //newDay.setDate(newDay.getDate() + parseInt(Math.pow(2, stuEx.reviewInterval)))
    // //return todaysDate >= newDay



    //
    const queryParams = new URLSearchParams(window.location.search)
    const ut = queryParams.get('ut')

    const hace2d = new Date()
    hace2d.setDate(hace2d.getDate() - 2)
    console.log('hace2d: ', hace2d)
    const hace2dFormatted = hace2d.toISOString().substring(0, 10)
    console.log('hace2dFormatted: ', hace2dFormatted)
    await displayExamples.forEach(async (ex)=>{
      if(ex.selected) {
        
        const exID = ex.recordId
        const stuID = currentStudent
        const lastReviewedDate = hace2dFormatted // yesterday's date
        const reviewInterval = 0
        console.log(exID, stuID, lastReviewedDate, reviewInterval)
        if(tables.current.studentExamples.find(stuEx=>(stuEx.relatedExample===exID && stuEx.relatedStudent===stuID))) {
          //
          console.log('found')
        } else {
          console.log('not found')
        
          
          //  
          try {
            const updateInfo = await createStudentExample(exID, stuID, lastReviewedDate, reviewInterval, ut)
            console.log('updateInfo: ', updateInfo)
            setAllCheckboxes(false)
            setSelectAll(false)
          } catch(err) {
            console.log(err)
          }
        }
      }
    })
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

  function handleRetrieveSentencesOnClick(e) {
    e.preventDefault()
    const selectedLesson = e.target.firstChild.value
    const filter1 = selectedLesson === '' ? tables.current.examples : filterExamplesStrict(retrieveCombinedLessonVocab(selectedLesson, tables.current.lessons), tables.current.examples)
    const filter2 = filterExamplesLenient(customSearchVocab, filter1)
    filteredExamples.current = filter2
    filterExamplesHelper()
  }

  // checks if noSpanglish & shuffleSentences and then sets the displayExamples
  function filterExamplesHelper() {
    const filter2 = filteredExamples.current
    const filter3 = noSpanglish ? filter2.filter(example => example.spanglish === 'esp') : filter2
    const filter4 = shuffledSentences ? shuffleArray(filter3) : filter3
    const filterSelected = filter4.map(ex=>{
      ex.selected = false
      return ex
    })
    console.log('filter selected: ', filterSelected)
    setDisplayExamples(filterSelected)
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

  function copySentences() {
    const englishSentences = displayExamples.map(example => {
        return example.englishTranslation
    }).join('\n')
    const spanishSentences = displayExamples.map(example => {
        return example.spanishExample
    }).join('\n')
    //
    const copiedText = englishSentences + '\n\n' + spanishSentences

    //console.log(englishSentences)
    navigator.clipboard.writeText(copiedText)
  }

  function copyTable() {
    const headers = 'Spanish\tEnglish\n'
    const table = displayExamples.map(example => {
        return example.spanishExample + '\t' + example.englishTranslation
    }).join('\n')

    const copiedText = headers + table
    navigator.clipboard.writeText(copiedText)
  }



  async function init() { // gets user token & creates the student examples table
    const queryParams = new URLSearchParams(window.location.search)
    const ut = queryParams.get('ut')

    tables.current.students = await fetchAndCreateTable(ut, qb.students)
    console.log('students')
    tables.current.studentExamples = await fetchAndCreateTable(ut, qb.studentExamples)
    console.log('student examples')
    tables.current.vocab = await fetchAndCreateTable(ut, qb.vocabulary)
    console.log('vocab')
    tables.current.examples = await fetchAndCreateTable(ut, qb.examples)
    console.log('example')
    tables.current.lessons = await fetchAndCreateTable(ut, qb.lessons)
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
    //console.log('lessons: ', tables.current.lessons)
    setFilteredVocab(tables.current.vocab)

    //const lessons = [{name:'SI1M Lesson', length: 20}, {name:'AS Lesson', length: 12}]

    //setLessonTitleSelect(createLessonsSelectOptions(lessons))

    //const lessonsSelectOptions = createLessonsSelectOptions()

    console.log(tables)
  }

  useEffect(() => {       
    init() 
    //console.log(tables)       
}, [tables])

  useEffect(() => {
    if(tables.current.lessons.length !== 0) {
    filterExamplesHelper()
    }
  }, [noSpanglish, shuffledSentences])

  return <div>
      <div className='div-header'><h1 style={{'backgroundColor': 'darkCyan'}}>SRS Builder</h1></div>
      <div className='div-vocab'>
        {/* Top Left - Vocab search bar section */}
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
        {/* Top Right - Lesson filter & Retrieve Sentences Button section */}
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
      {/* Middle - Example List */}
      <div className='div-examples-header'>
        <div>
          <button onClick={copySentences}>Copy as List</button>
          <button onClick={copyTable}>Copy as Table</button>
          <input type='checkbox' name='spanglishCheckbox' onChange={(e) => setNoSpanglish(e.target.checked)}></input><label htmlFor='spanglishCheckbox'>No Spanglish? </label>
          <input type='checkbox' name='shuffledCheckbox'  onChange={(e) => setShuffledSentences(e.target.checked)}></input><label htmlFor='shuffledCheckbox'>Shuffle Sentences? </label>
        </div>
        
        <div>Num of Results: {displayExamples.length}</div>
      </div>
      <div className='div-examples'>
        <table>
          <thead>
            <tr>
                <th><input type='checkbox' onChange={(e)=>setAllCheckboxes(e.target.checked)} checked={selectAll}></input></th>
              <th>Spanish</th>
              <th>English</th>
              <th>Vocab/Idioms</th>
            </tr>
          </thead>
          <tbody>
            { displayExamples.map((example, id) => {
              return(<tr key={id}>
                  {/* {example.selected?(<td><input type='checkbox' onChange={(e)=>setOneCheckbox(e.target.checked, example.recordId)} checked></input></td>):<td><input type='checkbox' onChange={(e)=>setOneCheckbox(e.target.checked, example.recordId)}></input></td>} */}
                  <td><input type='checkbox' onChange={(e)=>setOneCheckbox(e.target.checked, example.recordId)} checked={example.selected}></input></td>
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
      <div>_</div>
      {/* Bottom - Student's examples section */}
      <div className='div-examples-header'>
          <div>
          <button style={{'fontWeight': 'bold'}} onClick={()=>handleAddChecked()}>Add checked sentences to student's SRS list</button>
          {/* <label style={{'fontSize': 'larger', 'color': 'darkCyan', 'fontWeight': 'bold'}}>SRS sentences of Student: </label> */}
          <select style={{'padding': '8px'}} value={currentStudent} onChange={(e)=>setCurrentStudent(parseInt(e.target.value))}>
              {tables.current.students.map((student, id) => (<option key={student.recordId} value={student.recordId}>{student.name}</option>))}
          </select>
          
          </div>
          <div>Num of student's current SRS sentences: {tables.current.studentExamples.filter(stuEx=>stuEx.relatedStudent === currentStudent).length}</div>
      </div>
      <div className='div-examples'>
          <table>
              <thead>
                  <tr>
                      <th>ID</th>
                      <th>Spanish</th>
                      <th>English</th>
                      <th>Last Review Date</th>
                      <th>Review Interval</th>
                      <th>Date Created</th>
                  </tr>
              </thead>
              <tbody>
                  {tables.current.studentExamples.filter(stuEx=>stuEx.relatedStudent === currentStudent).map((stuEx, index)=> {
                      const example = tables.current.examples.find(ex=>ex.recordId===stuEx.relatedExample)
                      const hace10m = new Date()
                      hace10m.setMinutes(hace10m.getMinutes() - 10)
                      //hace10m.setDate(hace10m.getDate()-10)
                      const exDateCreated = new Date(stuEx.dateCreated)
                      let ridStyle = {}
                      if(hace10m < exDateCreated) {
                        //style is red
                        ridStyle = {'color': '#d00'}
                      }
                      if(true) {
                        //
                      }
                      return(<tr key={stuEx.recordId}>
                        <td style={ridStyle}>{example.recordId}</td>  
                        <td>{example.spanishExample}</td>
                        <td>{example.englishTranslation}</td>
                        <td>{stuEx.lastReviewedDate}</td>
                        <td>{stuEx.reviewInterval}</td>
                        <td>{stuEx.dateCreated.split('T')[0]}</td>
                        </tr>)
                  })}
              </tbody>
          </table>
      </div>
  </div>;
}
