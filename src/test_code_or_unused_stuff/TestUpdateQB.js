import React, {useState, useRef, useEffect} from 'react'
import { qb } from './QuickbaseTablesInfo';
import { testUpdate } from './QuickbaseFetchFuntions';

export default function TestUpdateQB() {
    async function init() {
        const queryParams = new URLSearchParams(window.location.search)
        const ut = queryParams.get('ut')
        
        const tu = await testUpdate(ut, qb.studentExamples)
        console.log('init tu: ', tu)
        console.log('student examples')
    }
    useEffect(() => {       
        init() 
        //console.log(tables)       
    }, [])

  return <div>halo dunia</div>; 

//   return (
//     <div className='quizInterface'>
//         {   
//             currentIndex < 0 ? (<div>Loading...</div>) : 
//         <>
//         <div className='progressBar'>
//             <div style={{width: (100 * currentIndex / filteredStudentExamples.current.length) + '%'}} className='progress'>_</div>
//         </div>
//         <div>{currentIndex} of {filteredStudentExamples.current.length}</div>
//         <div className='englishTranslation'>{filteredStudentExamples.current[currentIndex].englishTranslation}</div>
//         <hr />
//         { !showSpanish ? <button className='showSpanishButton' onClick={()=>setShowSpanish(true)}>Show Spanish</button> : 
//         <>
//         <div className='spanishExample'>{filteredStudentExamples.current[currentIndex].spanishExample}</div>
        
//         </> }
//         <div><button onClick={()=>handleReviewButton(-1)}>Review More ^</button></div>
//         <div>
//             <button>{'<-- Prev'}</button>
//             {/* <button onClick={()=>handleReviewButton(-1)}>Review More ^</button> */}
//             <button onClick={()=>handleReviewButton(1)}>Review Less v</button>
//             <button>{'Next -->'}</button>
//         </div>
//         </>
//         }
//     </div>
// )
}


// unused
/*
async function f2() { // gets user token & creates the student examples table
    const queryParams = new URLSearchParams(window.location.search)
    const ut = queryParams.get('ut')
    
    //console.log('Table Arr:', await fetchAndCreateTable(ut, tableInitialInfo))
    //console.log(qb.studentExamples)
    //console.log('Table Arr:', await fetchAndCreateTable(ut, qb.studentExamples))
    const studentExamplesTable = await fetchAndCreateTable(ut, qb.studentExamples)
    console.log('set: ', studentExamplesTable)
    //f3('1', studentExamplesTable)
    //test(studentExamplesTable)
}

function f3(studentNum, studentExamplesTable) {
    const newArr = studentExamplesTable.filter(row => row.relatedStudent === studentNum) // string or num?
    console.log('filtered res: ', newArr)
    const newArr2 = newArr.filter(row => {
        const today = new Date()
        const newDay = new Date(row.lastReviewedDate)
        newDay.setDate(newDay.getDate() + parseInt(Math.pow(2, row.reviewInterval)))
        return today >= newDay
    })
    console.log('newArr2: ', newArr2)
}

function test(studentExamplesTable) {
    console.log('last rev date of stu0: ', studentExamplesTable[0].lastReviewedDate)
    const revInt = studentExamplesTable[0].reviewInterval
    const d = new Date(studentExamplesTable[0].lastReviewedDate)
    console.log('d: ', d)
    const today = new Date()
    console.log('today: ', today)
    if(today > d) {
        console.log('today is greater than last rev date')
    }

    console.log('revInt: ', revInt)
    console.log('pow: ', Math.pow(2, revInt))
    d.setDate(d.getDate() + parseInt(Math.pow(2, revInt)))
    console.log('newD: ', d)
}

function handleReviewButton(increment) {
    //
    if(currentIndex < filteredStudentExamples.current.length - 1) {
        setCurrentIndex(currentIndex + 1)
    }
    setShowSpanish(false)
    console.log('old review interval: ', filteredStudentExamples.current[currentIndex].reviewInterval)

    filteredStudentExamples.current[currentIndex].reviewInterval += increment
    if(filteredStudentExamples.current[currentIndex].reviewInterval < 0) {
        filteredStudentExamples.current[currentIndex].reviewInterval = 0
    }
    
    console.log('new review interval: ', filteredStudentExamples.current[currentIndex].reviewInterval)

    console.log('last date: ', filteredStudentExamples.current[currentIndex].lastReviewedDate)
    const today = new Date()
    console.log('new date: ', today.toISOString())
    
    
}

    // useEffect(() => {       
    //     f2()        
    // }, [])
    function changeCurrentIndex(increment) {
        // console.log('cahnge cur in:', increment)
        // let newIndex = increment + currentIndex
        // if(newIndex < 0) {
        //     newIndex = filteredStudentExamples.current.length - 1
        // } else if(newIndex > filteredStudentExamples.current.length - 1) {
        //     newIndex = 0
        // }
        // console.log('inc: ', increment, ', curIn: ', currentIndex, ', newIn: ', newIndex)
        //setCurrentIndex(newIndex)
        setCurrentIndex(preState => {
            let newIndex = increment + preState
            if(newIndex < 0) {
                newIndex = filteredStudentExamples.current.length - 1
            } else if(newIndex > filteredStudentExamples.current.length - 1) {
                newIndex = 0
            }
            changeButtonUpDownStyle(filteredStudentExamples.current[newIndex].reviewIntervalIncrement)
            console.log('revIntInc: ', filteredStudentExamples.current[newIndex].reviewIntervalIncrement)
            return newIndex
        })
        setShowSpanish(false)
    }

    
    // const abc = useCallback(() => {
    //     console.log('currentIndex: ', currentIndex)
    // }, [currentIndex])

    function changeButtonUpDownStyle(increment) {
        switch(increment) {
            case 0:
                //console.log('gry', increment)
                setButtonUpDownStyles({ upStyle: {borderColor: 'grey'}, downStyle: {borderColor: 'grey'} })
                break
            case -1:
                //console.log('red', increment)
                setButtonUpDownStyles({ upStyle: {borderColor: 'red'}, downStyle: {borderColor: 'grey'} })
                break
            case 1:
                //console.log('blu', increment)
                setButtonUpDownStyles({ upStyle: {borderColor: 'grey'}, downStyle: {borderColor: 'blue'} })
                break
        }
    }

    function getButtonStyle(num, isUpButton) {
        if(isUpButton && num === -1) {
            if(num === -1) {
                return {borderColor: 'red'}
            }
        } else if(!isUpButton && num === 1) {
            if(num === 1) {
                return {borderColor: 'blue'}
            }
        } else {
            return {borderColor: 'grey'}
        }
    }

    */