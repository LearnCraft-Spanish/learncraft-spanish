import SwipeableViews from 'react-swipeable-views'
import { useSwipeable } from 'react-swipeable';
import React, {useState, useRef, useEffect, useCallback} from 'react'
import { qb } from './QuickbaseTablesInfo';
import { fetchAndCreateTable, updateStudentExample } from './QuickbaseFetchFuntions';
import './QuizInterface.css';

import { virtualize, bindKeyboard } from 'react-swipeable-views-utils';
import { mod } from 'react-swipeable-views-core';

const VirtualizeSwipeableViews = bindKeyboard(virtualize(SwipeableViews));

// related student 8
// related example 9
// last reviewed date 6
// review interval 7

export default function QuizInterfaceMobileTest() {
    const tables = useRef({ studentExamples: [], examples: [] })

    const [currentIndex, setCurrentIndex] = useState(-1)
    const [totalCompletedExamples, setTotalCompletedExamples] = useState(0)
    const filteredStudentExamples = useRef([])
    const [reviewIntervalIncrements, setReviewIntervalIncrements] = useState([])
    const [showSpanish, setShowSpanish] = useState(false)
    const [disablePrevButton, setEnablePrevButton] = useState(true)
    const [disableNextButton, setEnableNextButton] = useState(true)
    const [buttonsUpDownStyles, setButtonUpDownStyles] = useState({ upStyle: {}, downStyle: {} })
    const todaysDate = new Date()

    const swipeHandlers = useSwipeable({
        onSwipedUp: () => changeReviewIntervalIncrement(-1),
        onSwipedDown: () => changeReviewIntervalIncrement(1),
        delta: 20,
        preventDefaultTouchmoveEvent: false,
        trackTouch: false,
        trackMouse: true
    })


    const styles = {
        slide: {
          padding: 15,
          minHeight: 100,
          color: '#fff',
          borderColor: 'black',
          borderStyle: 'solid'
        }
    }
    function createSlideRenderer(index) {
        return (
            <div key={index}>
            <div className='englishTranslation'>Ingles {index}</div>              

            <div className='spanishExample' onClick={()=>toggleShowSpanish()}>
            Espanol {index}
            </div>
        </div>
        )
    }
    // for swipeable-views
    const slideRenderer = useCallback(({key, index}) => (
        // <div key={key} style={styles.slide}>
        //     {id}    
        // </div>
        // <div key={key}>
        //     <div className='englishTranslation'>Ingles {index}</div>              

        //     <div className='spanishExample' onClick={()=>toggleShowSpanish()}>
        //     Espanol {key}
        //     </div>
        // </div>

        <div key={key}>
            <div className='englishTranslation'>{index} {key} {index > -1?filteredStudentExamples.current[index].englishTranslation:'ingles'}</div>              

            <div className='spanishExample' onClick={()=>toggleShowSpanish()}>
            { !showSpanish ? 'Show Spanish' : filteredStudentExamples.current ?
            filteredStudentExamples.current[0].spanishExample : 'espanol'}
            </div>
        </div>
    ), [filteredStudentExamples.current])


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
        //return filteredByStudentID
        return filteredByDateLogic
    }





    async function init() { // gets user token & creates the student examples table
        const queryParams = new URLSearchParams(window.location.search)
        const ut = queryParams.get('ut')
        
        tables.current.studentExamples = await fetchAndCreateTable(ut, qb.studentExamples)
        console.log('student examples')
        tables.current.examples = await fetchAndCreateTable(ut, qb.examples)
        console.log('example')

        console.log('tables: ', tables.current)

        filteredStudentExamples.current = retrieveExamplesByStudent(2, tables.current.studentExamples, tables.current.examples)
        console.log('length of filStuEx: ', filteredStudentExamples.current.length)
        // console.log('unsorted: ', filteredStudentExamples.current)
        // filteredStudentExamples.current.sort((a, b) => a.relatedExample - b.relatedExample)
        // console.log('sorted: ', filteredStudentExamples.current)
        
        // const test = tables.current.examples.filter(ex => filteredStudentExamples.current.map(elem => elem.relatedExample).includes(ex.recordId))
        // //let newArr = []
        tables.current.examples.forEach(ex => 
            {
                filteredStudentExamples.current.forEach(stuEx => {
                    if(stuEx.relatedExample === ex.recordId) {
                        //console.log('ni')
                        stuEx.spanishExample = ex.spanishExample
                        stuEx.englishTranslation = ex.englishTranslation
                        //newArr.push( { ...stuEx, spanishExample: ex.spanishExample, englishTranslation: ex.englishTranslation} )
                        stuEx.reviewIntervalIncrement = 0
                    }
                })
            })
        //console.log('test', test)
        //console.log('filt:', newArr)
        console.log('check', filteredStudentExamples.current)
        if(filteredStudentExamples.current.length != 0) {
            setReviewIntervalIncrements(filteredStudentExamples.current.map(stuEx => stuEx.reviewIntervalIncrement))
            setCurrentIndex(0)
            //window.addEventListener('keyup', handleKeyUp)
        } else {
            setCurrentIndex(-1)
        }
      }



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

    // arrow UP & DOWN
    async function changeReviewIntervalIncrement(increment) {
        
        console.log('old Inc: ', filteredStudentExamples.current[currentIndex].reviewIntervalIncrement)
        const newIncrement = increment
        console.log('new Inc: ', newIncrement)
        
        filteredStudentExamples.current[currentIndex].reviewIntervalIncrement = newIncrement // is this even used?

        //changeButtonUpDownStyle(newIncrement)

        // make the update here & if its works then continue with the set
        const queryParams = new URLSearchParams(window.location.search)
        const ut = queryParams.get('ut')
        const n = filteredStudentExamples.current[currentIndex].reviewIntervalIncrement
        const recordId = filteredStudentExamples.current[currentIndex].recordId
        // Last Review Date
        const today = new Date()
        console.log('today: ', todaysDate.toISOString().substring(0, 10))
        const lastReviewedDate = todaysDate.toISOString().substring(0, 10)
        //const lastReviewedDate = filteredStudentExamples.current[currentIndex].lastReviewedDate
        console.log('tyu: ', filteredStudentExamples.current[currentIndex].lastReviewedDate)
        //
        const reviewInterval = filteredStudentExamples.current[currentIndex].reviewInterval + newIncrement < 0 ? 0 : filteredStudentExamples.current[currentIndex].reviewInterval + newIncrement
        // console.log('update params: ', n, recordId, lastReviewedDate, reviewInterval)
        // console.log('current: ', filteredStudentExamples.current[currentIndex])
        try {
            //uncomment this
            //const updateInfo = await updateStudentExample(recordId, lastReviewedDate, reviewInterval, ut)
            //console.log('updateInfo: ', updateInfo)

            if(reviewIntervalIncrements[currentIndex] === 0) {
                setTotalCompletedExamples(totalCompletedExamples + 1)
            }

            setReviewIntervalIncrements(prevState => {
                const newState = prevState.map(elem=>elem)
                newState[currentIndex] = newIncrement
                return newState
            })
        } catch(err) {
            console.log(err)
        }
    }


    function toggleShowSpanish() {
        setShowSpanish(prevState => !prevState)
    }

    function handleKeyUp(e) {
        e.preventDefault()
        switch(e.keyCode) {
            case 37: // left
                changeCurrentIndex2(currentIndex-1, true)
                break
            case 38: // up
                changeReviewIntervalIncrement(-1)
                break
            case 39: // right
                changeCurrentIndex2(currentIndex+1, true)
                break
            case 40: // down
                changeReviewIntervalIncrement(1)
                break
            case 32: // space
                toggleShowSpanish()
                break
            case 13: // enter does not work
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
            {   
                currentIndex < 0 ? (<div>Loading...</div>) : 
            <>
            <VirtualizeSwipeableViews {...swipeHandlers} enableMouseEvents
            index={currentIndex}
            onChangeIndex={(index)=>setCurrentIndex(index)}
            slideRenderer={slideRenderer}
            />
            <div className='progressBarContainer'>
                <div className='progressBar2'>
                    {filteredStudentExamples.current.map((stuEx, index) => {
                        const color = index === currentIndex ? 'white' : 'black'
                        let bgColor = reviewIntervalIncrements[index] === -1 ? 'red' : (reviewIntervalIncrements[index] === 1 ? 'deepSkyBlue' : (index === totalCompletedExamples ? 'slateGrey' : 'grey'))
                        //console.log('revIntIncs: ', reviewIntervalIncrements)
                        
                        return(<div key={index} style={{width: (100 / filteredStudentExamples.current.length) - 1 + '%', borderColor: color, color: color, backgroundColor: bgColor}} className='progressBox' onClick={()=>changeCurrentIndex2(index, false)}>{index + 1}</div>)
                    })}
                    
                </div>
                <div className='progressBarDescription'>{totalCompletedExamples} of {filteredStudentExamples.current.length} completed</div>
            </div>
            <SwipeableViews {...swipeHandlers} enableMouseEvents onChangeIndex={(index)=>setCurrentIndex(index)}>
            {
                filteredStudentExamples.current.filter((stuEx, id) => (id <= totalCompletedExamples)).map((stuEx, id) => {
                    return(
                    <div key={id}>
                        <div className='englishTranslation'>{filteredStudentExamples.current[id].englishTranslation}</div>              

                        <div className='spanishExample' onClick={()=>toggleShowSpanish()}>
                        { !showSpanish ? 'Show Spanish' : 
                        filteredStudentExamples.current[id].spanishExample}
                        </div>
                    </div>)
                })
            }
            </SwipeableViews>
            <div className='progressBarContainer'>
                <div className='progressBar2'>
                    {filteredStudentExamples.current.map((stuEx, index) => {
                        const color = index === currentIndex ? 'white' : 'black'
                        let bgColor = reviewIntervalIncrements[index] === -1 ? 'red' : (reviewIntervalIncrements[index] === 1 ? 'deepSkyBlue' : (index === totalCompletedExamples ? 'slateGrey' : 'grey'))
                        //console.log('revIntIncs: ', reviewIntervalIncrements)
                        
                        return(<div key={index} style={{width: (100 / filteredStudentExamples.current.length) - 1 + '%', borderColor: color, color: color, backgroundColor: bgColor}} className='progressBox' onClick={()=>changeCurrentIndex2(index, false)}>{index + 1}</div>)
                    })}
                    
                </div>
                <div className='progressBarDescription'>{totalCompletedExamples} of {filteredStudentExamples.current.length} completed</div>
            </div>
            
            
            <div>
                <div className='englishTranslation'>{filteredStudentExamples.current[currentIndex].englishTranslation}</div>              

                <div className='spanishExample' onClick={()=>toggleShowSpanish()}>
                { !showSpanish ? 'Show Spanish' : 
                filteredStudentExamples.current[currentIndex].spanishExample}
                </div>
            </div>
            <div className='buttonsContainer'>
                <div><button className='buttonReviewMore' onClick={()=>changeReviewIntervalIncrement(-1)}>Review More ^</button></div>
                <div>
                    <button onClick={()=>changeCurrentIndex2(currentIndex-1, true)}>{'<-- Prev'}</button>
                    {/* <button onClick={()=>handleReviewButton(-1)}>Review More ^</button> */}
                    <button className='buttonReviewLess' onClick={()=>changeReviewIntervalIncrement(1)}>Review Less v</button>
                    <button onClick={()=>changeCurrentIndex2(currentIndex+1, true)}>{'Next -->'}</button>
                </div>
            </div>
            </>
            }
        </div>
    )
}
