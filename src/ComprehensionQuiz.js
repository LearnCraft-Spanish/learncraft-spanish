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

    function readyQuiz () {
        setQuizReady(true)
    }
    
    function unReadyQuiz () {
        setQuizReady(false)
    }

    function updateSelectedLesson (lessonId) {
        console.log(lessonId)
        let newLesson = {}
        programTable.forEach(program =>{
          const foundLesson = program.lessons.find(item => item.recordId === parseInt(lessonId))
          if (foundLesson){
            newLesson = foundLesson
            console.log(foundLesson)
          }
        })
        setSelectedLesson(newLesson||activeLesson)
      }
    
      function updateSelectedProgram (programId) {
        const programIdNumber = parseInt(programId)
        const newProgram = programTable.find(program => program.recordId === programIdNumber)||{}
        setSelectedProgram(newProgram)
        if (activeProgram.recordId){
          let lessonToSelect = 0
          newProgram.lessons.forEach((lesson)=>{
            if (parseInt(lesson.recordId) <= parseInt(activeLesson.recordId)){
              lessonToSelect = lesson.recordId
              console.log(lesson)
            }
          })
          console.log(lessonToSelect)
          updateSelectedLesson(lessonToSelect)
        } else {
          let lessonToSelect = 0
          if (newProgram.lessons){
            newProgram.lessons.forEach((lesson)=>{
                lessonToSelect = lesson.recordId
              })
          }
          updateSelectedLesson(lessonToSelect)
        }
      }

      function shuffleExamples (examples) {
        let shuffled = examples
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
        return shuffled
      }

    function incrementExample () {
        if (currentExample < examplesToPlay.length-1) {
            const nextExample = currentExample + 1
            setCurrentExample(nextExample)
        } else {
            setCurrentExample(examplesToPlay.length-1)
        }
        setCurrentStep(0)
    }

    function decrementExample () {
        if(currentExample > 0) {
            const prevExample = currentExample - 1
            setCurrentExample(prevExample)
        } else {
            setCurrentExample(0)
        }

    }
    function startPlay(){
        setPlaying(true)
    }

    function endPlay () {
        setPlaying(false)
    }

    function cycle () {
        if (!playing) {
            switch (currentStep) {
                case 0:
                    setCurrentStep(1)
                    break
                case 1:
                    setCurrentStep(2)
                    break
                case 2:
                    incrementExample()
                    break
                default:
                    setCurrentStep(0)
            }
        }
    }

    function makeComprehensionQuiz () {
        const allowedAudioExamples = filterExamplesByAllowedVocab(audioExamplesTable, selectedLesson.recordId)
        //console.log(allowedAudioExamples)
        const shuffledExamples = shuffleExamples(allowedAudioExamples)
        setExamplesToPlay(shuffledExamples)
    }

    useEffect (() =>{
        if (!rendered){
            rendered = true
            console.log(activeStudent)
        }
    }, [])

    useEffect (() =>{
        console.log(example)
        setCurrentStep(0)
        if (!playing) {
            startPlay()
        }
    }, [currentExample])

    useEffect(() => {
        if (selectedLesson && selectedProgram) {
          setSelectedProgram(activeProgram)
          setSelectedLesson(activeLesson)
        }
      }, [activeProgram, activeLesson])

    useEffect(() => {
    if (selectedLesson && selectedProgram) {
        makeComprehensionQuiz()
    }
    }, [selectedProgram, selectedLesson])

    useEffect (() =>{
        console.log(currentStep)
        switch (currentStep) {
            case 0:
                startPlay()
                break
            case 1:
                startPlay()
                break
            case 2:
                endPlay()
                break
            default:
        }
    }, [currentStep])

    return (
        <div className='quiz'>
            <h2 className='comprehensionHeader'>Comprehension Quiz</h2>
            <AudioBasedReview roles = {roles} activeStudent = {activeStudent} programTable = {programTable} studentExamplesTable={studentExamplesTable} updateBannerMessage={updateBannerMessage} audioExamplesTable={audioExamplesTable} filterExamplesByAllowedVocab={filterExamplesByAllowedVocab} activeLesson={activeLesson} activeProgram={activeProgram} willAutoplay={false} willStartWithSpanish={true}/>
        </div>
    )
}