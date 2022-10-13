import React, {useState, useEffect, useRef} from 'react';
import { qb } from './QuickbaseTablesInfo';
import { fetchAndCreateTable, getVocabFromBackend, getExamplesFromBackend, getLessonsFromBackend, getStudentsFromBackend} from './QuickbaseFetchFunctions';
import './App.css';

export default function SimpleQuizApp() {

    function createStudentLoadingList () {
        const loadingList = []
        for (let i=0;i < 10;i++) {
          loadingList.push({recordId: i, name: 'Loading Students...'})
        }
        return loadingList;
      }

    const loadingList = createStudentLoadingList()

    const [loadStatus, setloadStatus] = useState([])
    const tables = useRef({ examples: [], students: loadingList});
    const [currentStudent, setCurrentStudent] = useState(tables.current.students[0].name);
    const [quizReady,setQuizReady] = useState(false);
    const [examplesToReview, setExamplesToReview] = useState ([])
    const [currentExampleNumber, setCurrentExampleNumber] = useState(1)

    function toggleQuizReady() {
        if (quizReady) {
            setQuizReady(false)
        } else {
            setQuizReady(true)
        }
    }

    function incrementExample() {
        if (currentExampleNumber < examplesToReview.length){
            setCurrentExampleNumber(currentExampleNumber+1)
        } else {
            setCurrentExampleNumber(examplesToReview.length)
        }
    }
    
    function decrementExample() {
        if (currentExampleNumber > 1){
            setCurrentExampleNumber(currentExampleNumber-1)
        } else {
            setCurrentExampleNumber(1)
        }
    }

    function filterByCurrentStudent (example) {
        if (example.combinedTextStudentName.length === 0){
            return false
        }
        //console.log('has students')
        for(const student of example.combinedTextStudentName) {
            if(example.combinedTextStudentName.includes(currentStudent)) {
                return true
            }
        }
        return false
    }

    function handleSetupQuiz () {
        setExamplesToReview(tables.current.examples.filter(filterByCurrentStudent));
        console.log(examplesToReview)
        toggleQuizReady();
    }

    function goBackToMenu(e) {
        e.preventDefault();
        const link = '#/Menu/';
        window.location=link;
    }

    function filterExamples(vocabArr, examplesTable) {
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

    function makeOptionFromStudent(student, key) {
        return <option key={key} value = {student.name}>{student.name}</option>
    }

    async function init() {
        console.log('init called')
        // getting the user token
        //const queryParams = new URLSearchParams(window.location.search)
        //const ut = queryParams.get('ut') // user token
        // retrieving the table data
        tables.current.students = await getStudentsFromBackend();
        //console.log(tables.current.vocab[32]);
        //console.log('vocab')
        tables.current.examples = await getExamplesFromBackend();
        //console.log(tables.current.examples)

        //console.log('example')
        //console.log(tables.current.examples[12]);
        //console.log('lessons')
        //console.log(tables.current.lessons[12]);
        
        console.log('init completed')
        setloadStatus('loaded')
      }

    useEffect(() => {
        init()
    }, [tables])

    

return (
    <div className='quizInterface'>
        <div className='div-header'>
            <h1>Quizzing App</h1>
            <div className='returnButton'><button onClick={goBackToMenu}>{'< Back to Menu'}</button></div>
        </div>

        <form style = {{display:quizReady?'none':'inline'}} onSubmit={handleSetupQuiz}>
            <p>Reviewing as:</p>
            <select onChange={(e)=>setCurrentStudent(e.target.value)}>
                {tables.current.students.map((student, id) => (<option key={id} value={student.name}>{student.name}</option>))}
            {loadStatus}
            {console.log('list rendered')}
            </select>
            <button className='begin-review'>Begin Review</button>
        </form>
        
        {/* Quiz App */}
        <div style = {{display:quizReady?'block':'none'}} className='quiz'>
            <div className='progressBar2'>                
            <div className='progressBarDescription'>{currentExampleNumber} of {examplesToReview.length} completed</div>
            </div>
            <div className='exampleBox'>
                <div className='englishTranslation'>
                    {examplesToReview[currentExampleNumber-1]?examplesToReview[currentExampleNumber-1].englishTranslation:''}
                </div>
                <div className='spanishExample' >
                    {examplesToReview[currentExampleNumber-1]?examplesToReview[currentExampleNumber-1].spanishExample:''}
                </div>
            </div>
            <div className='buttonBox'>
                <button onClick={decrementExample}>Previous Example</button>
                <button onClick={incrementExample}>Next Example</button>
                <button onClick={toggleQuizReady}>Restart Quiz</button>
            </div>
        </div>
    </div>
        
)}