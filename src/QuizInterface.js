import React, {useState, useRef, useEffect, useCallback} from 'react'
import { qb } from './QuickbaseTablesInfo';
import { fetchAndCreateTable, updateStudentExample } from './QuickbaseFetchFunctions';
import './QuizInterface.css';

// related student 8
// related example 9
// last reviewed date 6
// review interval 7

// This script displays the SRS Quiz Tool (Quiz Interface)
// where user go throughs 20 example sentences & then rates their difficulty
export default function QuizInterface() {
    const tables = useRef({ studentExamples: [], examples: [] })

    const [currentIndex, setCurrentIndex] = useState(-1)
    const [totalCompletedExamples, setTotalCompletedExamples] = useState(0)
    const filteredStudentExamples = useRef([])
    const [reviewIntervalIncrements, setReviewIntervalIncrements] = useState([])
    const [showSpanish, setShowSpanish] = useState(false)
    const todaysDate = new Date()

    // get all the student examples that belong to student with studentID & that have last review date earlier than today's date - review interval squared
    // called by init()
    function retrieveExamplesByStudent(studentID, studentExamples, examples) {
        const filteredByStudentID = studentExamples.filter(stuEx => stuEx.relatedStudent === studentID)
        console.log('filteredByStudentID', filteredByStudentID)
        const filteredByDateLogic = filteredByStudentID.filter(stuEx => {
            const today = new Date()
            const newDay = new Date(stuEx.lastReviewedDate)
            newDay.setDate(newDay.getDate() + parseInt(Math.pow(2, stuEx.reviewInterval)))
            return todaysDate >= newDay
        })
        console.log('filteredByDateLogic', filteredByDateLogic)
        return filteredByDateLogic
    }

    // grabs the 1st 20 examples of shuffled array
    // called by init()
    function randomize20(studentExamples) {
        return shuffleArray(studentExamples).filter((stuEx, index)=>index<20)
        //return studentExamples
    }

    // returns a shuffled version of examples array passed in
    // called by randomize20()
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

    // gets user token & retrieves table data
    async function init() {
        const queryParams = new URLSearchParams(window.location.search)
        const ut = queryParams.get('ut')
        let stuid = queryParams.get('stuid')
        if(stuid === null) {
            stuid = 2
        } else {
            stuid = parseInt(stuid)
        }

        console.log('stuid:  ', stuid)      
        tables.current.studentExamples = await fetchAndCreateTable(ut, qb.studentExamples)
        console.log('student examples')
        tables.current.examples = await fetchAndCreateTable(ut, qb.examples)
        console.log('example')
        console.log('tables: ', tables.current)
        filteredStudentExamples.current = randomize20(retrieveExamplesByStudent(stuid, tables.current.studentExamples, tables.current.examples))
        console.log('length of filStuEx: ', filteredStudentExamples.current.length)

        tables.current.examples.forEach(ex => 
            {
                filteredStudentExamples.current.forEach(stuEx => {
                    if(stuEx.relatedExample === ex.recordId) {
                        stuEx.spanishExample = ex.spanishExample
                        stuEx.englishTranslation = ex.englishTranslation
                        stuEx.reviewIntervalIncrement = 0
                    }
                })
            })
        console.log('check', filteredStudentExamples.current)
        if(filteredStudentExamples.current.length != 0) {
            setReviewIntervalIncrements(filteredStudentExamples.current.map(stuEx => stuEx.reviewIntervalIncrement))
            setCurrentIndex(0)
            //window.addEventListener('keyup', handleKeyUp)
        } else {
            setCurrentIndex(-2)
        }
      }


/*
    // OLD Version not in use anymore
    function changeCurrentIndexOLD(index, isIncrement) {
        if(index <= totalCompletedExamples || isIncrement) {
            setCurrentIndex(prevState => {
                let newIndex = index
                if(totalCompletedExamples < filteredStudentExamples.current.length) {
                    if(newIndex < 0) {
                        newIndex = totalCompletedExamples // filteredStudentExamples.current.length - 1
                    } else if(newIndex > totalCompletedExamples && isIncrement) { //} filteredStudentExamples.current.length - 1) {
                        newIndex = 0
                    }
                } else {
                    if(newIndex < 0) {
                        newIndex = totalCompletedExamples - 1
                    } else if(newIndex > totalCompletedExamples - 1) { //} filteredStudentExamples.current.length - 1) {
                        newIndex = 0
                    }
                }
                return newIndex
            })
            if(reviewIntervalIncrements[index] === 0) {
                setShowSpanish(false)
            } else {
                setShowSpanish(true)
            }
        }
    }
    // this previous function used to allow the user to loop to beginning when user moved past current limit before complete all questions
    // but this functionality was removed
    function changeCurrentIndex2(index, isIncrement) { 
        if(index <= totalCompletedExamples || isIncrement) {
            let newIndex = index
            const highestIndex = totalCompletedExamples < filteredStudentExamples.current.length ? totalCompletedExamples : totalCompletedExamples - 1
            if(newIndex < 0) {
                newIndex = highestIndex // filteredStudentExamples.current.length - 1
            } else if(newIndex > highestIndex && isIncrement) { //} filteredStudentExamples.current.length - 1) {
                newIndex = 0
            }
            setCurrentIndex(newIndex)
            setShowSpanish(reviewIntervalIncrements[newIndex] !== 0)
        }
    }
*/
    // called when user clicks LEFT/RIGHT arrow key or clicks PREV/NEXT buttons or clicks on timeline
    // switches the current example to previous or next
    function changeCurrentIndex3(index, isIncrement) {
        let newIndex = index
        if(totalCompletedExamples == filteredStudentExamples.current.length) {
            if(newIndex < 0) {
                newIndex = filteredStudentExamples.current.length - 1
            } else if(newIndex > filteredStudentExamples.current.length - 1) {
                newIndex = 0
            }
            setCurrentIndex(newIndex)
            setShowSpanish(reviewIntervalIncrements[newIndex] !== 0)
        } else if(index <= totalCompletedExamples && index >= 0) {
            setCurrentIndex(newIndex)
            setShowSpanish(reviewIntervalIncrements[newIndex] !== 0)
        }
    }

    // redirects user to menu page
    // called when user clicks 'Return to Main Menu'
    function goBackToMenu(e) {
        e.preventDefault()
        const queryParams = new URLSearchParams(window.location.search)
        const ut = queryParams.get('ut')
        const link = 'https://nicholas7238.github.io/asqb/?ut=' + ut + '#/Menu'
        
        window.location.href=link
    }

    // called when user clicks arrow UP/DOWN or Review More/Review Less buttons
    // changes rating increment on quickbase database
    async function changeReviewIntervalIncrement(increment) {     
        console.log('old Inc: ', filteredStudentExamples.current[currentIndex].reviewIntervalIncrement)
        const newIncrement = increment
        console.log('new Inc: ', newIncrement)
        
        filteredStudentExamples.current[currentIndex].reviewIntervalIncrement = newIncrement // ?

        // make the update here & if its works then continue with the set
        const queryParams = new URLSearchParams(window.location.search)
        const ut = queryParams.get('ut')
        const recordId = filteredStudentExamples.current[currentIndex].recordId
        // Last Review Date
        const today = new Date()
        console.log('today: ', todaysDate.toISOString().substring(0, 10))
        const lastReviewedDate = todaysDate.toISOString().substring(0, 10)
        console.log('tyu: ', filteredStudentExamples.current[currentIndex].lastReviewedDate)
        //
        const reviewInterval = filteredStudentExamples.current[currentIndex].reviewInterval + newIncrement < 0 ? 0 : filteredStudentExamples.current[currentIndex].reviewInterval + newIncrement
        // console.log('update params: ', n, recordId, lastReviewedDate, reviewInterval)
        // console.log('current: ', filteredStudentExamples.current[currentIndex])
        try {
            // This where you make call to quickbase api to update table in order to change last review data & review interval
            const updateInfo = await updateStudentExample(recordId, lastReviewedDate, reviewInterval, ut)
            console.log('updateInfo: ', updateInfo)

            if(reviewIntervalIncrements[currentIndex] === 0) {
                setTotalCompletedExamples(totalCompletedExamples + 1)
            }

            setReviewIntervalIncrements(prevState => {
                const newState = prevState.map(elem=>elem)
                newState[currentIndex] = newIncrement
                return newState
            })
            setShowSpanish(true)
        } catch(err) {
            console.log(err)
        }
    }

    // called when user clicks space, shift, or clicks on Show Spanish button
    // shows or hides Spanish sentence
    function toggleShowSpanish() {
        setShowSpanish(prevState => !prevState)
    }

    // key input
    function handleKeyUp(e) {
        e.preventDefault()
        switch(e.keyCode) {
            case 37: // left
                changeCurrentIndex3(currentIndex-1, true)
                break
            case 38: // up
                changeReviewIntervalIncrement(-1)
                break
            case 39: // right
                changeCurrentIndex3(currentIndex+1, true)
                break
            case 40: // down
                changeReviewIntervalIncrement(1)
                break
            case 32: // space
                toggleShowSpanish()
                break
            case 16: // shift
                toggleShowSpanish()
                break
        }
    }

    useEffect(() => {       
        init() 
    }, [tables])

    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp)    
        return () => window.removeEventListener('keyup', handleKeyUp)
    }, [currentIndex, reviewIntervalIncrements])

    return (
        <div className='quizInterface'>
            <div style={{ textAlign: 'left' }} className='returnButton'><button style={{ fontSize: 'large', padding: '10px'}} onClick={(e) => goBackToMenu(e)}>Return to Main Menu</button></div>
            {   
                currentIndex === -1 ? (<div>Loading...</div>) : currentIndex < -1 ? (<div>There are no new practice sentences today</div>) : 
            <>
            {/* Progress Bar */}
            <div className='progressBarContainer'>
                {/* <div className='progressBar'>
                    <div style={{width: (100 * (currentIndex+1) / filteredStudentExamples.current.length) + '%'}} className='progress'>.</div>
                </div> */}
                <div className='progressBar2'>
                    {filteredStudentExamples.current.map((stuEx, index) => {
                        const color = index === currentIndex ? 'white' : 'black'
                        let bgColor = reviewIntervalIncrements[index] === -1 ? 'crimson' : (reviewIntervalIncrements[index] === 1 ? 'lime' : (index === totalCompletedExamples ? 'slateGrey' : 'grey'))
                        //console.log('revIntIncs: ', reviewIntervalIncrements)
                        
                        return(<div key={index} style={{width: (100 / filteredStudentExamples.current.length) - 1 + '%', borderColor: color, color: color, backgroundColor: bgColor}} className='progressBox' onClick={()=>changeCurrentIndex3(index, false)}>{index + 1}</div>)
                    })}
                    
                </div>
                <div className='progressBarDescription'>{totalCompletedExamples} of {filteredStudentExamples.current.length} completed</div>
                {/* totalCompletedExamples == filteredStudentExamples.current.length ? (<button style={{ fontSize: 'large', padding: '10px' }} onClick={(e) => goBackToMenu(e)}>Return to Main Menu</button>) : (<div></div>) */}
            </div>
            
            {/* English Example */}
            <div className='englishTranslation'>{filteredStudentExamples.current[currentIndex].englishTranslation}</div>
            {/* Spanish Example */}
            <div className='spanishExample' onClick={()=>toggleShowSpanish()}>
            { !showSpanish ? 'Show Spanish' : 
            filteredStudentExamples.current[currentIndex].spanishExample}
            </div>

            {/* Bottom buttons: Prev, Next, Review More, Review Less */}
            <div className='buttonsContainer'>
                <div><button className='buttonReviewMore' onClick={()=>changeReviewIntervalIncrement(-1)}>Review More ^</button></div>
                <div>
                    <button onClick={()=>changeCurrentIndex3(currentIndex-1, true)}>{'<-- Prev'}</button>
                    {/* <button onClick={()=>handleReviewButton(-1)}>Review More ^</button> */}
                    <button className='buttonReviewLess' onClick={()=>changeReviewIntervalIncrement(1)}>Review Less v</button>
                    <button onClick={()=>changeCurrentIndex3(currentIndex+1, true)}>{'Next -->'}</button>
                </div>
            </div>
            </>
            }
        </div>
    )
}
