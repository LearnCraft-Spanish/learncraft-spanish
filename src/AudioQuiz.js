import React, {useState, useEffect, useRef} from 'react';
import { getVocabFromBackend, getAudioExamplesFromBackend, getExamplesFromBackend, createStudentExample, getLessonsFromBackend, getProgramsFromBackend, getAllUsersFromBackend, getStudentExamplesFromBackend} from './BackendFetchFunctions';
import './App.css';
import ReactHowler from 'react-howler'
import MenuButton from './MenuButton';
import AudioBasedReview from './AudioBasedReview'
import { useAuth0 } from '@auth0/auth0-react';
import LessonSelector from './LessonSelector';


export default function AudioQuiz({roles, programTable, activeStudent, studentExamplesTable, updateBannerMessage, audioExamplesTable, activeLesson, activeProgram, filterExamplesByAllowedVocab}) {
    const [audioQuizExamples, setAudioQuizExamples] = useState([])
    const [audioQuizReady, setAudioQuizReady] = useState(false)
    function filterExamplesByEnglishAudio(examples) {
        const newExampleTable = [...examples]
        const tableToSet = newExampleTable.filter(example => {
            if (example.englishAudio.includes('.')){
                return true
            } else {
                return false
            }
        })
        return tableToSet
    }

    useEffect(() => {
        if (audioExamplesTable.length >0){
            //console.log(audioExamplesTable)
            const filteredExamples = filterExamplesByEnglishAudio(audioExamplesTable)
            setAudioQuizExamples(filteredExamples)
        }
    }, [audioExamplesTable])

    useEffect(() => {
        if (audioQuizExamples.length > 0) {
            //console.log(audioQuizExamples)
            console.log('quiz ready')
            setAudioQuizReady(true)
        }
    }, [audioQuizExamples])

    return (
        <div>
            <h2 className='comprehensionHeader'>Audio Quiz</h2>
            {audioQuizReady && <AudioBasedReview roles = {roles} activeStudent = {activeStudent} programTable = {programTable} studentExamplesTable={studentExamplesTable} updateBannerMessage={updateBannerMessage} audioExamplesTable={audioQuizExamples} filterExamplesByAllowedVocab={filterExamplesByAllowedVocab} activeLesson={activeLesson} activeProgram={activeProgram} willAutoplay={true} willStartWithSpanish={false}/>}
        </div>
    )
}