import React, {useState, useEffect, useRef} from 'react';
import { qb } from './QuickbaseTablesInfo';
import { fetchAndCreateTable, getVocabFromBackend, getExamplesFromBackend, getLessonsFromBackend, getStudentsFromBackend} from './QuickbaseFetchFunctions';
import './App.css';

export default function SimpleQuizApp() {

    const tables = useRef({ examples: [] , students: []});
    const [currentStudent, setCurrentStudent] = useState([]);

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

      function createStudentLoadingList () {
        const loadingList = []
        for (let i=0;i < 10;i++) {
          loadingList.push({name: 'Loading Students...'})
        }
        return loadingList;
      }

      async function init() {
        // getting the user token
        //const queryParams = new URLSearchParams(window.location.search)
        //const ut = queryParams.get('ut') // user token
        // retrieving the table data
        console.log(tables.current.students)
        tables.current.students = createStudentLoadingList()
        console.log(tables.current.students)
        tables.current.students = await getStudentsFromBackend();
        console.log(tables.current.students)
        //console.log(tables.current.vocab[32]);
        //console.log('vocab')
        tables.current.examples = await getExamplesFromBackend();
        console.log(tables.current.examples)
        //console.log('example')
        //console.log(tables.current.examples[12]);
        //console.log('lessons')
        //console.log(tables.current.lessons[12]);
      }

      useEffect(() => {       
        init() 
        //console.log(tables)       
    }, [tables])

return (
    <div className='quizInterface'>
        <div className='div-header'>
            <h1>Quizzing App</h1>
            <div className='returnButton'><button onClick={goBackToMenu}>{'< Back to Menu'}</button></div>
        </div>

        <form onSubmit={goBackToMenu}>
            <p>Reviewing as:</p>
              <select className='student-select'>
                <option value=''>-Choose a Student-</option>
                {tables.current.students.map((student, id)=>(<option key={id} title={student.name}>{student.name}</option>))}
              </select>
              <button className='begin-review'>Begin Review</button>
            </form>
        
        {/* Progress Bar */}
        <div className='progressBarContainer'>
            <div className='progressBar2'>                
            </div>
            <div className='progressBarDescription'>Number of number completed</div>
        </div>
        <div className='englishTranslation'></div>
        <div className='spanishExample' >
        </div>

        {/* Bottom buttons: Prev, Next, Review More, Review Less */}
        <div className='buttonsContainer'>
            <div><button className='buttonReviewMore'>Review More ^</button></div>
            <div>
                <button>{'<-- Prev'}</button>
            
            </div>
        </div>
    </div>
        
)}