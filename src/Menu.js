import React, {useState, useRef, useEffect} from 'react'
import { qb } from './QuickbaseTablesInfo';
import { fetchAndCreateTable } from './QuickbaseFetchFunctions';
import './App.css'
import { useAuth0 } from "@auth0/auth0-react";

// this script displays the Menu page, where user can access
// - Database tool (Example Retriever)
// - old Database tool
// - SRS Builder
// - SRS Quiz Platform (Quiz Interface)
// - SRS Quiz Platform Version that does not update database
export default function Menu() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    //const tables = useRef({ students: [] })
    const [studentsTable, setStudentsTable] = useState([])
    const [currentStudent, setCurrentStudent] = useState(3)

    // called whenever user clicks a button
    // redirects user to appropriate page
    function handleOnClick(pageName) {
        const queryParams = new URLSearchParams(window.location.search)
        const ut = queryParams.get('ut')
        //const linkBase = 'http://localhost:3000'
        const linkBase = 'https://app-lcs.s3.us-east-2.amazonaws.com/index.html'
        const linkStr = linkBase + '#/' + pageName
        //console.log(linkStr)
        window.location.href = (
            //'http://localhost:3000/',
            linkStr
        )
    }

    // called by useEffect() when loading
    // gets user token & initializes tables data
    async function init() {
        const queryParams = new URLSearchParams(window.location.search)
        const ut = queryParams.get('ut')
        if (ut) {
            const stuTable =  await fetchAndCreateTable(ut, qb.students)
            setStudentsTable(stuTable)
            console.log('students')
        }
      }
    // called once in the beginning
    useEffect(() => {       
        init() 
        //console.log(tables)       
    }, [])
  return (
    isAuthenticated && (
    <div>
        <h2>App Options:</h2>
        <div className= 'menu-buttons'>
            <button onClick={()=>handleOnClick('ExampleRetriever')}>Example Lookup</button>
            <button onClick={()=>handleOnClick('SimpleQuizApp')}>Quizzing App</button>
        </div>
    </div>
  ))
}

/*<h2>SRS Quiz Interface</h2>
        <div className='div-examples-header'>
        <div>
            <select style={{'padding': '8px'}} value={currentStudent} onChange={(e)=>setCurrentStudent(parseInt(e.target.value))}>
                {studentsTable.map((student, id) => (<option key={student.recordId} value={student.recordId}>{student.name}</option>))}
            </select>
            <button onClick={()=>handleOnClick('QuizInterface')} style={{'fontWeight': 'bold'}} title='This uses the SRS logic & will update the DB'>Interface with SRS Logic</button>
            <button onClick={()=>handleOnClick('QuizInterfaceNoUpdate')} style={{'fontWeight': 'bold'}} title='This does not use the SRS logic & will not update the DB'>Interface only</button>
        </div>
        </div>*/
