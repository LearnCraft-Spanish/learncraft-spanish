import React, {useState, useEffect, useRef} from 'react';
import { getVocabFromBackend, getAudioExamplesFromBackend, getExamplesFromBackend, createStudentExample, getLessonsFromBackend, getProgramsFromBackend, getAllUsersFromBackend, getStudentExamplesFromBackend} from './BackendFetchFunctions';
import './App.css';
import ReactHowler from 'react-howler'
import MenuButton from './MenuButton';
import AudioBasedReview from './AudioBasedReview';
import { useAuth0 } from '@auth0/auth0-react';
import LessonSelector from './LessonSelector';


export default function ComprehensionQuiz({roles, programTable, activeStudent, studentExamplesTable, updateBannerMessage, audioExamplesTable, activeLesson, activeProgram, filterExamplesByAllowedVocab}) {
    const {getAccessTokenSilently} = useAuth0()
    const [currentExample, setCurrentExample] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)
    const [playing, setPlaying] = useState(true)
    const [selectedLesson, setSelectedLesson] = useState(activeLesson)
    const [selectedProgram, setSelectedProgram] = useState(activeProgram)
    const [examplesToPlay, setExamplesToPlay] = useState([])
    const [quizReady, setQuizReady] = useState(false)
    let rendered = false
    const example = examplesToPlay[currentExample]||{}

    useEffect (() =>{
        if (!rendered){
            rendered = true
        }
    }, [])


    return (
        <div className='quiz'>
            <h2 className='comprehensionHeader'>Comprehension Quiz</h2>
            <AudioBasedReview roles = {roles} activeStudent = {activeStudent} programTable = {programTable} studentExamplesTable={studentExamplesTable} updateBannerMessage={updateBannerMessage} audioExamplesTable={audioExamplesTable} filterExamplesByAllowedVocab={filterExamplesByAllowedVocab} activeLesson={activeLesson} activeProgram={activeProgram} willAutoplay={false} willStartWithSpanish={true}/>
        </div>
    )
}