import React, {useState, useEffect, useRef} from 'react';

export default function LessonSelector({programTable, activeProgram, activeLesson, selectedLesson, updateSelectedLesson, selectedProgram, updateSelectedProgram}) {

    
    function makeCourseSelector () {
        if (!activeProgram.recordId){
            const courseSelector = [<option key = {0} value = {0} >–Choose Course–</option>]
            programTable.forEach((item)=> {
                courseSelector.push(<option key = {item.recordId} value = {item.recordId}> {item.name}</option>)
            })
            return courseSelector
        } else {
            const courseSelector = <option key = {activeProgram.recordId} value = {activeProgram.recordId}>{activeProgram.name}</option>
            return courseSelector
        }
    }
    
    function makeLessonSelector () {
    const lessonSelector = []
    if (activeProgram.recordId) {
        const activeLessonArray = activeLesson.lesson.split(' ')
        const activeLessonNumber = parseInt(activeLessonArray.slice(-1)[0])
        selectedProgram.lessons.forEach((lesson)=>{
        const lessonArray = lesson.lesson.split(" ")
        const lessonNumber = lessonArray.slice(-1)[0]
        if (activeLessonNumber >= lessonNumber){
            lessonSelector.push(<option key = {lesson.lesson} value = {lesson.recordId}> Lesson {lessonNumber}</option>)
        }
        })
    } else {
        selectedProgram.lessons.forEach((lesson)=>{
        const lessonArray = lesson.lesson.split(" ")
        const lessonNumber = lessonArray.slice(-1)[0]
        lessonSelector.push(<option key = {lesson.lesson} value = {lesson.recordId}> Lesson {lessonNumber}</option>)
        })
    }
        return lessonSelector
    }

    return (<div>
        <div className='lessonFilter'>
            <form onSubmit={(e) => (e.preventDefault)}>
              <h3>Set Level</h3>
              <select className='courseList' value = {selectedProgram.recordId} onChange={(e) => updateSelectedProgram(e.target.value)}>
                {makeCourseSelector()}
              </select>
              {(selectedLesson && selectedProgram.lessons) && (<select className='lessonList' value = {selectedLesson.recordId} onChange={(e) => updateSelectedLesson(e.target.value)}>
                {makeLessonSelector()}
              </select>)}
            </form>
        </div>
    </div>)

}