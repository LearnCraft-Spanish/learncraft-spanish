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
    const [languageShowing, setLanguageShowing] = useState('english')

    function toggleQuizReady() {
        if (quizReady) {
            setQuizReady(false)
            setCurrentExampleNumber(1)
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
        setLanguageShowing('english')
    }
    
    function decrementExample() {
        if (currentExampleNumber > 1){
            setCurrentExampleNumber(currentExampleNumber-1)
        } else {
            setCurrentExampleNumber(1)
        }
        setLanguageShowing('english')
    }

    async function toggleLanguageShowing () {
        if (languageShowing === 'spanish'){
            setLanguageShowing('english')
        } else {
            setLanguageShowing('spanish')
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
        const quizExamples = tables.current.examples.filter(filterByCurrentStudent);
        function randomize (array) {
            const randomizedArray = []
            const vanishingArray = [...array];
            for (let i = 0; i < array.length; i++) {
                const randIndex = Math.floor(Math.random()*vanishingArray.length)
                const randomArrayItem = vanishingArray[randIndex]
                vanishingArray.splice(randIndex, 1)
                randomizedArray[i] = randomArrayItem
                }
            return randomizedArray
        }
        const randomizedQuizExamples = randomize(quizExamples);
        setExamplesToReview(randomizedQuizExamples)
        toggleQuizReady();
    }

    function goBackToMenu(e) {
        e.preventDefault();
        const link = '#/Menu/';
        window.location=link;
    }

    async function init() {
        console.log('init called')
        tables.current.students = await getStudentsFromBackend();
        tables.current.examples = await getExamplesFromBackend();
        console.log('init completed')
        setCurrentStudent(tables.current.students[0].name)
        setloadStatus('loaded')
      }

    useEffect(() => {
        init()
    }, [])

    

return (
    <div className='quizInterface'>
        <div className='div-header'>
            <h1>Quizzing App</h1>
            <div className='returnButton'><button onClick={goBackToMenu}>{'< Back to Menu'}</button></div>
        </div>

        <form style = {{display:quizReady?'none':'flex'}} onSubmit={handleSetupQuiz} className='studentSelect'>
            <h2>Reviewing as:</h2>
            <div>
                <select onChange={(e)=>setCurrentStudent(e.target.value)}>
                    {tables.current.students.map((student, id) => (<option key={id} value={student.name}>{student.name}</option>))}
                {loadStatus}
                </select>
                <input type = 'submit' className='begin-review' value ='Begin Review'></input>
            </div>
        </form>
        
        {/* Quiz App */}
        <div style = {{display:quizReady?'flex':'none'}} className='quiz'>
            <div className='exampleBox'>
                <div style = {{display:(languageShowing==='english')?'flex':'none'}} className='englishTranslation'>
                    <p>{examplesToReview[currentExampleNumber-1]?examplesToReview[currentExampleNumber-1].englishTranslation:''}</p>
                </div>
                <div style = {{display:(languageShowing==='spanish')?'flex':'none'}}className='spanishExample' >
                    <p>{examplesToReview[currentExampleNumber-1]?examplesToReview[currentExampleNumber-1].spanishExample:''}</p>
                </div>
            </div>
            <div className='buttonBox'>
                <button onClick={decrementExample}>Previous Example</button>
                <button onClick={incrementExample}>Next Example</button>
            </div>
            <div className='buttonBox'>
                <button onClick={toggleLanguageShowing}>Flip Card</button>
                <button onClick={toggleQuizReady}>Restart Quiz</button>
            </div>
            <div className='progressBar2'>                
                <div className='progressBarDescription'>Example {currentExampleNumber} of {examplesToReview.length}</div>
            </div>
        </div>
    </div>
        
)}