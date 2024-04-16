import React, { useState, useRef, useEffect, forwardRef } from "react";
import LessonSelector from "./LessonSelector";
import { getVocabFromBackend, getSpellingsFromBackend, getCoachList, getLastThreeWeeks, getActiveMemberships, getActiveStudents, getLessonList, getCourseList } from "./BackendFetchFunctions";
import { useAuth0 } from "@auth0/auth0-react";

const Coaching = forwardRef(function Coaching ({userData, contextual, openContextual, closeContextual}, currentContextual) {
    const { user, isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
    const audience = process.env.REACT_APP_API_AUDIENCE
    const [weeksToDisplay, setWeeksToDisplay] = useState([])
    const [startupDataLoaded, setStartupDataLoaded] = useState(false)
    const [filterByCoach, setFilterByCoach] = useState({})
    const [filterByCourse, setFilterByCourse] = useState({})
    const [filterByWeeksAgo, setFilterByWeeksAgo] = useState(0)
    const [filterCoachless, setFilterCoachless] = useState(1)
    const [filterHoldWeeks, setFilterHoldWeeks] = useState(1)
    const [filterIncomplete, setFilterIncomplete] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const rendered = useRef(false)
    const students = useRef([])
    const memberships = useRef([])
    const weekRecords = useRef([])
    const coaches = useRef([])
    const courses = useRef([])
    const lessons = useRef([])
    const privateCalls = useRef([])
    const groupCalls = useRef([])
    const groupAttendees = useRef([])
    const assignments = useRef([])
    const currentAttendee = useRef(null)
    const coachUser = useRef(null)

    function updateSearchTerm(term) {
        setSearchTerm(term.toLowerCase())
    }

    function updateCoachFilter(coachId){
        const coachToSet = coaches.current.find((coach)=>coach.recordId === Number(coachId))||{}
        console.log(coachToSet)
        setFilterByCoach(coachToSet)
    }

    function updateCourseFilter(courseId){
        const courseToSet = courses.current.find((course)=>course.recordId === Number(courseId))||{}
        setFilterByCourse(courseToSet)
    }

    function updateWeeksAgoFilter(weeksAgo){
        setFilterByWeeksAgo(weeksAgo)
    }

    function updateCoachlessFilter(argument) {
        setFilterCoachless(parseInt(argument))
    }

    function updateHoldFilter(argument) {
        setFilterHoldWeeks(parseInt(argument))
    }

    function updateFilterIncomplete(argument) {
        setFilterIncomplete(parseInt(argument))
    }

    function openMoreFilters () {
        openContextual('moreFilters')
    }

    function openStudentPopup (recordId) {
        openContextual(`student${recordId}`)
    }

    function openCallPopup (recordId) {
        openContextual(`call${recordId}`)
    }

    function openNewCallPopup (weekRecordId) {
        openContextual(`newCallForWeek${weekRecordId}`)
    }

    function openGroupSessionPopup (recordId) {
        currentAttendee.current = null
        openContextual(`groupSession${recordId}`)
    }

    function openAttendeePopup (recordId) {
        openContextual(`attendee${recordId}`)
    }

    function openAssignmentPopup (recordId) {
        openContextual(`assignment${recordId}`)
    }

    async function makeCoachList () {
        try {
          const accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: audience,
              scope: "openid profile email read:current-student update:current-student read:all-students update:all-students",
            }
          });
          const coachList = await getCoachList(accessToken)
          .then((result) => {
            result.sort((a,b) => {
                if (a.user && b.user) {
                    if (a.user.name > b.user.name) {
                        return 1
                    } else {
                        return -1
                    }
                }
            })
            return result
          });
          return coachList;
        } catch (e) {
            console.log(e.message);
        }
    }

    async function makeCourseList () {
        try {
          const accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: audience,
              scope: "openid profile email read:current-student update:current-student read:all-students update:all-students",
            }
          });
          const coachList = await getCourseList(accessToken)
          .then((result) => {
            result.sort((a,b) => {
                if (a.name > b.name) {
                    return 1
                } else {
                    return -1
                }
            })
            return result
          });
          return coachList;
        } catch (e) {
            console.log(e.message);
        }
    }

    async function makeLessonList () {
        try {
          const accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: audience,
              scope: "openid profile email read:current-student update:current-student read:all-students update:all-students",
            }
          });
          const lessonList = await getLessonList(accessToken)
          .then((result) => {
            return result
          });
          return lessonList;
        } catch (e) {
            console.log(e.message);
        }
    }


    async function getThreeWeeksOfRecords () {
        try {
            const accessToken = await getAccessTokenSilently({
                authorizationParams: {
                audience: audience,
                scope: "openid profile email read:current-student update:current-student read:all-students update:all-students",
                }
            });
            const studentRecords = await getLastThreeWeeks(accessToken)
            .then((result) => {
                
                return result
            });
            return studentRecords;
            } catch (e) {
                console.log(e.message);
            }
    }

    async function makeStudentList () {
        try {
            const accessToken = await getAccessTokenSilently({
                authorizationParams: {
                audience: audience,
                scope: "openid profile email read:current-student update:current-student read:all-students update:all-students",
                }
            });
            const studentRecords = await getActiveStudents(accessToken)
            .then((result) => {
                
                return result
            });
            return studentRecords;
            } catch (e) {
                console.log(e.message);
            }
    }

    async function makeMembershipList () {
        try {
            const accessToken = await getAccessTokenSilently({
                authorizationParams: {
                audience: audience,
                scope: "openid profile email read:current-student update:current-student read:all-students update:all-students",
                }
            });
            const studentRecords = await getActiveMemberships(accessToken)
            .then((result) => {
                
                return result
            });
            return studentRecords;
            } catch (e) {
                console.log(e.message);
            }
    }

    async function loadStartupData () {
        const studentsPromise = makeStudentList()
        const membershipsPromise = makeMembershipList()
        const weekRecordsPromise = getThreeWeeksOfRecords()
        const coachesPromise = makeCoachList()
        const coursesPromise = makeCourseList()
        const lessonsPromise = makeLessonList()
        Promise.all([studentsPromise, membershipsPromise, weekRecordsPromise, coachesPromise, coursesPromise, lessonsPromise]).then((results) => {
            students.current = results[0]
            memberships.current = results[1]
            weekRecords.current = results[2][0]
            privateCalls.current = results[2][1]
            groupCalls.current = results[2][2]
            groupAttendees.current = results[2][3]
            assignments.current = results[2][4]
            coaches.current = results[3]
            courses.current = results[4]
            console.log(courses.current)
            lessons.current = results[5]
            setStartupDataLoaded(true)
        },console.log('couldn\'t load data'))
    }

    function dateObjectToText (dateObject) {
        console.log(typeof(dateObject))
        function formatMonth (date) {
            const unformattedMonth = date.getMonth()+1
            if (unformattedMonth < 10) {
                const formattedMonth = '0'+unformattedMonth.toString()
                return formattedMonth
            } else {
                const formattedMonth = unformattedMonth.toString()
                return formattedMonth
            }
        }
        function formatDate(date) {
            let dateString = date.getDate().toString()
            if (Number(dateString) < 10) {
                dateString = '0'+ dateString
            }
            return dateString
        }
    
        function formatYear (date) {
            console.log(date)
            const formattedYear = date.getFullYear().toString()
            return formattedYear
        }
        const formattedFullDate = `${formatYear(dateObject)}-${formatMonth(dateObject)}-${formatDate(dateObject)}`
        return formattedFullDate
    }

    function getStudentFromMembershipId (membershipId) {
        const membership = memberships.current.find((item) => item.recordId === membershipId)||{}
        const studentId = membership.relatedStudent
        const student = students.current.find((item)=> item.recordId === studentId)||{}
        return student
    }

    function getCoachFromMembershipId (membershipId) {
        const membership = memberships.current.find((item) => item.recordId === membershipId)||{}
        const studentId = membership.relatedStudent
        const student = students.current.find((item)=> item.recordId === studentId)||{}
        const userObject = student.primaryCoach||{}
        const coach = coaches.current.find((coach) => coach.user.id === userObject.id)||{}
        return coach
    }

    function getCourseFromMembershipId (membershipId) {
        const membership = memberships.current.find((item) => item.recordId === membershipId)||{}
        const courseId = membership.relatedCourse
        const course = courses.current.find((item) => item.recordId === courseId)||{}
        return course
    }

    function getLessonFromRecordId(lessonId) {
        const lesson = lessons.current.find((item) => item.recordId === lessonId)||{}
        return lesson
    }

    function getPrivateCallsFromWeekId(weekId){
        const callList = privateCalls.current.filter((call) => call.relatedWeek === weekId)
        return callList
    }

    function getGroupSessionsFromWeekId(weekId){
        const groupAttendeeList = groupAttendees.current.filter((attendee)=> attendee.student === weekId)||[]
        if (typeof(groupAttendeeList) !== 'object'){
            console.log(typeof(groupAttendeeList))
        }
        if (groupAttendeeList.length > 0) {
            const groupSessionList = groupAttendeeList.map((attendee) => groupCalls.current.find((call) => call.recordId === attendee.groupSession))||[]
            const fixedSessionList = groupSessionList.filter((item) => item)
            return fixedSessionList
        } else {
            return []
        }
    }

    function getAttendeeWeeksFromGroupSessionId(sessionId) {
        const attendeeList = groupAttendees.current.filter((attendee) => attendee.groupSession === sessionId) ||[]
        const weekList = attendeeList.map((attendee) => weekRecords.current.find((week) => week.recordId === attendee.student)||{})||[]
        return weekList
    }

    function getAssignmentsFromWeekId(weekId) {
        const assignmentList = assignments.current.filter((assignment) => assignment.relatedWeek === weekId)
        return assignmentList
    }

    function getMembershipFromWeekId(weekId) {
        const week = weekRecords.current.find((week) => week.recordId ===weekId) ||{}
        const membershipId = week.relatedMembership
        const membership = memberships.current.find((membership) => membership.recordId === membershipId)
        return membership

    }

    function weekGetsPrivateCalls (weekId) {
        const membership = getMembershipFromWeekId(weekId)
        const course = getCourseFromMembershipId(membership.recordId)
        const hasPrivateCalls = (course.weeklyPrivateCalls > 0)
        return hasPrivateCalls
    }

    function weekGetsGroupCalls (weekId) {
        const membership = getMembershipFromWeekId(weekId)
        const course = getCourseFromMembershipId(membership.recordId)
        const hasGroupCalls = course.hasGroupCalls
        return hasGroupCalls
    }

    function makeCoachSelector () {
        const coachSelector = [<option key = {0} value = {0}>All Coaches</option>]
        coaches.current.forEach((coach)=>{
            const coachHasActiveStudent = students.current.filter((student) => (student.primaryCoach?student.primaryCoach.id:undefined) === (coach.user?coach.user.id:0)).length > 0
            if (coachHasActiveStudent){
                coachSelector.push(<option key = {coach.recordId} value = {coach.recordId}> {coach.user.name}</option>)
            }
        })
        return coachSelector
    }

    function makeCourseSelector () {
        const courseSelector = [<option key = {0} value = {0}>All Courses</option>]
        courses.current.forEach((course)=>{
            const courseHasActiveMembership = memberships.current.filter((item) => item.relatedCourse === course.recordId).length > 0
            if (courseHasActiveMembership) {
                courseSelector.push(<option key = {course.recordId} value = {course.recordId}> {course.name}</option>)
            }
        })
        return courseSelector
    }

    function filterWeeksBySearchTerm(array, searchTerm) {
        if (searchTerm.length > 0) {
            function filterFunction (week) {
                const student = getStudentFromMembershipId(week.relatedMembership)
                const nameMatches = student.fullName?student.fullName.toLowerCase().includes(searchTerm):false
                const emailMatches = student.email?student.email.toLowerCase().includes(searchTerm):false
                const noteMatches = week.notes?week.notes.toLowerCase().includes(searchTerm):false
                return (nameMatches||emailMatches||noteMatches)
            }
            return array.filter(filterFunction)
        } else {
            return array
        }
    }

    function filterWeeksByWeeksAgo(array, numberOfWeeksAgo) {
        if (numberOfWeeksAgo >= 0) {
            const nowTimestamp = Date.now()
            const now = new Date(nowTimestamp)
            const dayOfWeek = now.getDay()
            const thisSundayTimestamp = now - (dayOfWeek * 86400000)
            const chosenSundayTimestamp = thisSundayTimestamp - numberOfWeeksAgo*604800000
            const sunday = new Date(chosenSundayTimestamp)
            const sundayText = dateObjectToText(sunday)
            function filterFunction (weekRecord) {
                if (weekRecord.weekStarts === sundayText) {
                    return true
                } else {
                    return false
                }
            }
            const filteredWeeks = array.filter(filterFunction)
            return filteredWeeks
        } else {
            return array
        }
    }
    
    function filterWeeksByCoach (weeks, coach) {
        if (coach.user) {
            const coachEmail = coach.user.email
            const filteredWeeks = weeks.filter((week) => (getCoachFromMembershipId(week.relatedMembership).recordId?getCoachFromMembershipId(week.relatedMembership).user.email:"") === coachEmail)    
            return filteredWeeks
        } else {
            return weeks
        }
        
    }

    function filterWeeksByCourse (weeks, course) {
        if (course.recordId){
            const courseRecordId = Number(course.recordId)
            const filteredWeeks = weeks.filter((week) => getCourseFromMembershipId(week.relatedMembership).recordId === courseRecordId)
            return filteredWeeks
        } else {
            return weeks
        }
    }

    function filterWeeksByOnHold (weeks) {
        if (filterHoldWeeks > 0) {
            const filteredWeeks = weeks.filter((week) => !week.holdWeek)
            return filteredWeeks
        } else {
            return weeks
        }
        
    }

    function filterWeeksByCoachless (weeks) {
        if (filterCoachless > 0 && !filterByCoach.recordId) {
            function filterfunction (week) {
                const coach = getCoachFromMembershipId(week.relatedMembership)
                return coach.recordId
            }
            const filteredWeeks = weeks.filter(filterfunction)
            return filteredWeeks
        } else {
            return weeks
        }
    }

    function filterWeeksByIncomplete (weeks) {
        if (filterIncomplete === 1) {
            console.log("Incomplete Only")
            const filteredWeeks = weeks.filter((week) => !week.recordsComplete)
            return filteredWeeks
        } else  if (filterIncomplete === 2) {
            console.log("Complete only")
            const filteredWeeks = weeks.filter((week) => week.recordsComplete)
            return filteredWeeks
        } else {
            return weeks
        }
    }

    function combinedFilterWeeks (weeks) {
        const filteredBySearchTerm = filterWeeksBySearchTerm(weeks, searchTerm)
        const filteredByCoachless = filterWeeksByCoachless(filteredBySearchTerm)
        const filteredByWeeksAgo = filterWeeksByWeeksAgo(filteredByCoachless, filterByWeeksAgo)
        const filteredByCoach = filterWeeksByCoach(filteredByWeeksAgo, filterByCoach)
        const filteredByCourse = filterWeeksByCourse(filteredByCoach, filterByCourse)
        const filteredByIncomplete = filterWeeksByIncomplete(filteredByCourse)
        const filteredByOnHold = filterWeeksByOnHold(filteredByIncomplete)
        function weekSorter (a,b,) {
            const courseA = getCourseFromMembershipId(a.relatedMembership).name;
            const courseB = getCourseFromMembershipId(b.relatedMembership).name;
            if (courseA !== courseB){
                return (courseA > courseB) ? 1 : -1;
            }
            if (getCoachFromMembershipId(a.relatedMembership).user && getCoachFromMembershipId(b.relatedMembership).user) {
                const coachA = getCoachFromMembershipId(a.relatedMembership).user.name;
                const coachB = getCoachFromMembershipId(b.relatedMembership).user.name;
                if (coachA !== coachB) {
                    return (coachA > coachB) ? 1 : -1;
                }
            }
            const lessonA = getLessonFromRecordId(a.currentLesson);
            const lessonB = getLessonFromRecordId(b.currentLesson);
            if (lessonA.weekRef !== lessonB.weekRef) {
                return lessonA.weekRef - lessonB.weekRef
            } else if (lessonA.lessonName !== lessonB.lessonName) {
                return (lessonA.lessonName > lessonB.lessonName)? 1: -1;
            }
        }
        filteredByOnHold.sort(weekSorter)
        return filteredByOnHold
    }
        
    const TableHeaderRow = () => {
        return <tr className="tableHeader">
            <th>Student</th>
            {weeksToDisplay.filter(item => weekGetsPrivateCalls(item.recordId)).length > 0 && <th>Private Calls</th>}
            {weeksToDisplay.filter(item => weekGetsGroupCalls(item.recordId)).length > 0 && <th>Group Calls</th>}
            <th>Assignments</th>
            <th>Notes</th>
            <th>Lesson</th>
        </tr>;
    }

    const Student = ({week}) => {
        const student = getStudentFromMembershipId(week.relatedMembership)
        const currentMemberships = memberships.current.filter((membership) => membership.relatedStudent === student.recordId)
        return (
            <div>
                <div className="studentBox" onClick={student.recordId?() => openStudentPopup(student.recordId):null}>
                    <strong>{student.fullName}</strong><br />
                    {student.email}<br />
                    {(!filterByCoach.recordId) && (student.primaryCoach?student.primaryCoach.name:"No Coach")}
                    {(!filterByCoach.recordId) &&<br />}
                    {(!filterByCourse.recordId) && (getCourseFromMembershipId(week.relatedMembership)?getCourseFromMembershipId(week.relatedMembership).name:"No Course")}
                    {(!filterByCourse.recordId) &&<br />}
                    {(filterByWeeksAgo < 0) && week.weekStarts}
                </div>
                {(contextual === `student${student.recordId}`) && student.recordId && (
                    <div className="studentPopup" ref = {currentContextual}>
                        {console.log(student)}
                        <h4>{student.fullName}</h4>
                        <p>Email: {student.email}</p>
                        {student.primaryCoach.id && <p> Primary Coach: {student.primaryCoach.name}</p>}
                        <h5>Active Memberships:</h5>
                        {currentMemberships.map((membership) => {
                            return (
                                <p key = {membership.recordId}>{getCourseFromMembershipId(membership.recordId).name} since {membership.startDate}{membership.onHold?', currently on Hold.':"."}</p>
                            )
                        })}
                        {student.fluencyGoal. length > 1 && <h5>Fluency Goal:</h5>}
                        {student.fluencyGoal. length > 1 && <p>{student.fluencyGoal}</p>}
                        {student.startingLevel.length > 1 && <h5>Starting Level:</h5>}
                        {student.startingLevel.length > 1 && <p>{student.startingLevel}</p>}
                        <div className="buttonBox">
                            <button className="redButton" onClick={closeContextual}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const Calls = ({data}) => {
        const callData = getPrivateCallsFromWeekId(data.recordId)
        const callPopups = (data) => {
            if (data.length === 0) {
                return null
            } else {
                return data.map((call) => (
                    <div className='assignmentBox' key = {call.recordId}>
                        <button onClick={() => openCallPopup(call.recordId)}>{call.rating}</button>
                        {contextual === `call${call.recordId}` && (
                            <div className="callPopup" ref={currentContextual}>
                                <h4>{getStudentFromMembershipId(getMembershipFromWeekId(call.relatedWeek).recordId).fullName} on {call.date}</h4>
                                <p>Rating: {call.rating}</p>
                                <p>Notes: {call.notes}</p>
                                <p>Difficulties: {call.areasOfDifficulty}</p>
                                {(call.recording.length > 0) && <a target= {"_blank"} href={call.recording}>Recording Link</a>}
                                <div className="buttonBox">
                                    <button className="redButton" onClick={closeContextual}>Close</button>
                                </div>
                            </div>
                        )}
                    </div>))
            }
        }
        return <div className="callBox">
            {callPopups(callData)}
            {weekGetsPrivateCalls(data.recordId) && <button className="greenButton" onClick={() => openNewCallPopup(data.recordId)}>New</button>}
            {contextual === `newCallForWeek${data.recordId}` && (
                <div className="callPopup" ref={currentContextual}>
                    <h4>{getStudentFromMembershipId(getMembershipFromWeekId(data.recordId).recordId).fullName} {getCourseFromMembershipId(getMembershipFromWeekId(data.recordId).recordId).name} call on {dateObjectToText(new Date(Date.now()))}</h4>
                    <label for="start">Start date:</label>
                    <input type="date" id="start" name="trip-start" value={dateObjectToText(new Date(Date.now()))} min="2018-01-01" max="2026-12-31" />
                    <p>Rating:</p>
                    <select value = 'Fair'>
                        <option value = 'Terrible'>Terrible</option>
                        <option value = 'Poor'>Poor</option>
                        <option value = 'Fair'>Fair</option>
                        <option value = 'Good'>Good</option>
                        <option value = 'Very Good'>Very Good</option>
                        <option value = 'Excellent'>Excellent</option>
                        <option value= 'Late Cancel'>Late Cancel</option>
                        <option value= 'No-Show'>No-Show</option>
                    </select>
                    <p>Notes:</p>
                    <input type="textArea" />
                    <p>Difficulties:</p>
                    <input type="textArea" />
                    <p>Recording Link</p>
                    <input type="textArea" />
                    <div className="buttonBox">
                        <button className="greenButton" onClick={closeContextual}>Submit</button>
                    </div>
                    <div className="buttonBox">
                        <button className="redButton" onClick={closeContextual}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    }

    const GroupSessions = ({data}) => {
        if (data.length === 0) {
            return null
        } else {
            function changeAttendee (attendeeId, groupSessionId) {
                currentAttendee.current = students.current.find((student)=> student.recordId === attendeeId)||{}
                openAttendeePopup(`${attendeeId}-${groupSessionId}`)
            }
            return data.map((groupSession) => (
                <div className='assignmentBox' key = {groupSession.recordId}>
                    <button onClick={() => openGroupSessionPopup(groupSession.recordId)}>{groupSession.sessionType}</button>
                    {contextual === `groupSession${groupSession.recordId}` && (
                        <div className="groupSessionPopup" ref={currentContextual}>
                            <h4>{groupSession.sessionType} on {groupSession.date}</h4>
                            <p>Coach: {groupSession.coach?groupSession.coach.name:''}</p>
                            <p>Topic: {groupSession.topic}</p>
                            <p>Comments: {groupSession.comments}</p>
                            <p><strong>Attendees:</strong></p>
                            <div className="groupAttendeeList">
                                {getAttendeeWeeksFromGroupSessionId(groupSession.recordId).map((attendee) => <button key={attendee.recordId} className="groupAttendee" onClick={() => changeAttendee(getStudentFromMembershipId(attendee.relatedMembership).recordId, groupSession.recordId)}>{getStudentFromMembershipId(attendee.relatedMembership).fullName}</button>)}
                            </div>
                            {(groupSession.callDocument?groupSession.callDocument.length > 0:false) && <p><a target= {"_blank"} href={groupSession.callDocument}>Call Document</a></p>}
                            {(groupSession.zoomLink?groupSession.zoomLink.length > 0:false) && <p><a target= {"_blank"} href={groupSession.zoomLink}>Recording Link</a></p>}
                            <div className="buttonBox">
                                <button className="redButton" onClick={closeContextual}>Close</button>
                            </div>
                        </div>
                    )}
                    {(contextual === `attendee${currentAttendee.current?currentAttendee.current.recordId:undefined}-${groupSession.recordId}`) && (
                        <div className="studentPopup" ref = {currentContextual}>
                            <h4>{currentAttendee.current.fullName}</h4>
                            <p>{currentAttendee.current.email}</p>
                            <p> Primary Coach: {currentAttendee.current.primaryCoach.name}</p>
                            <h5>Fluency Goal:</h5>
                            <p>{currentAttendee.current.fluencyGoal}</p>
                            <h5>Starting Level:</h5>
                            <p>{currentAttendee.current.startingLevel}</p>
                            <div className="buttonBox">
                                <button className="redButton" onClick={() => openGroupSessionPopup(groupSession.recordId)}>Back</button>
                            </div>
                        </div>
                    )}
                    
                </div>))
        }
    }

    const Assignments = ({data}) => {
        if (data.length === 0){
            return null
        } else {
            return data.map((assignment) => (
                <div className='assignmentBox' key = {assignment.recordId}>
                    <button onClick={() => openAssignmentPopup(assignment.recordId)}>{assignment.assignmentType}: {assignment.rating}</button>
                    {contextual === `assignment${assignment.recordId}` && (
                        <div className="assignmentPopup" ref = {currentContextual}>
                            <h4>{assignment.assignmentType} by {getStudentFromMembershipId(getMembershipFromWeekId(assignment.relatedWeek).recordId).fullName}</h4>
                            <p>{assignment.date}</p>
                            {assignment.homeworkCorrector && <p>Corrected by {assignment.homeworkCorrector.name}</p>}
                            <p>Rating: {assignment.rating}</p>
                            <p>Notes: {assignment.notes}</p>
                            <p>Areas of Difficulty: {assignment.areasOfDifficulty}</p>
                            {(assignment.assignmentLink?assignment.assignmentLink.length > 0:false) && <a target= {"_blank"} href={assignment.assignmentLink}>Assignment Link</a>}
                            <div className="buttonBox">
                                <button className="redButton" onClick={closeContextual}>Close</button>
                            </div>
                        </div>
                    )}
                </div>))
        }
    }
        
    const TableRow = ({data}) => {
        return data.map((item) =>
            <tr key = {item.recordId} className="studentWeek">
                <td className="studentHeader">
                    <Student week = {item}/>
                </td>
                {weeksToDisplay.filter(item => weekGetsPrivateCalls(item.recordId)).length > 0 && <td><Calls data = {item}/></td>}
                {weeksToDisplay.filter(item => weekGetsGroupCalls(item.recordId)).length > 0 && <td><GroupSessions data = {getGroupSessionsFromWeekId(data.recordId)}/></td>}
                <td><Assignments data = {getAssignmentsFromWeekId(item.recordId)} /></td>
                <td className="studentWeekNotes">{item.notes}</td>
                <td className="studentWeekNotes">{getLessonFromRecordId(item.currentLesson).lessonName}</td>
            </tr>   
        );
    }
        
    const DisplayWeeks = ({data}) => {
        return (
            <table className="studentRecords">
                <thead>
                    <TableHeaderRow />
                </thead>
                <tbody>
                    <TableRow data={data} />
                </tbody>
            </table>
        );
    }

    useEffect(() => {
        if (!rendered.current){
            rendered.current = true
            loadStartupData()
        }
    }, [])

    useEffect(() => {
        if (startupDataLoaded){
            coachUser.current = coaches.current.find((coach) => coach.user.email === userData.emailAddress)||null
            if (coachUser.current?coachUser.current.recordId:false){
                updateCoachFilter(coachUser.current.recordId)
            }
        }
    }, [startupDataLoaded, userData])

    useEffect(() => {
        if (startupDataLoaded) {
            setWeeksToDisplay(combinedFilterWeeks(weekRecords.current))
        }
    }, [startupDataLoaded, searchTerm, filterByCoach, filterByCourse, filterByWeeksAgo, filterCoachless, filterHoldWeeks, filterIncomplete])


    return ((
    <div className="coaching">
        {!startupDataLoaded && <p>This section is still under construction</p>}
        {startupDataLoaded && <div>
            <div className="coachingFilterSection">
                <div className="numberShowing">
                    <h4>Search:</h4>
                </div>
                <div className="searchOrButton">
                    <input className="weekSearch" type="text" value={searchTerm} onChange={(e) => updateSearchTerm(e.target.value)}></input>
                </div>
                <div className="searchOrButton">
                    <button className="moreFiltersButton" onClick = {openMoreFilters}>More Filters</button>
                </div>
                <div className="numberShowing">
                    <h4>Showing: {weeksToDisplay.length} records</h4>
                </div>
                {(contextual === 'moreFilters') && <div className="moreFilters" ref={currentContextual}>
                    <div className="coachingFilterSection">
                        <select value = {filterCoachless} onChange={(e) => updateCoachlessFilter(e.target.value)}>
                            <option value = {1}>Don't show students without coaches</option>
                            <option value = {0}>Show students without coaches</option>
                        </select>
                    </div>
                    <div className="coachingFilterSection">
                        <select value = {filterHoldWeeks} onChange={(e) => updateHoldFilter(e.target.value)}>
                            <option value = {1}>Don't show weeks on hold</option>
                            <option value = {0}>Show weeks on hold</option>
                        </select>
                    </div>
                    <div className="coachingFilterSection">
                        <select value = {filterIncomplete} onChange={(e) => updateFilterIncomplete(e.target.value)}>
                            <option value = {0}>All records</option>
                            <option value = {1}>Incomplete only</option>
                            <option value = {2}>Complete only</option>
                        </select>
                    </div>
                    <div className="buttonBox">
                        <button className = 'redButton' onClick={closeContextual}>Close</button>
                    </div>
                </div>}
            </div>
            <div className="coachingFilterSection">
                <select onChange={(e) => updateCoachFilter(e.target.value)}>
                    {makeCoachSelector()}
                </select>
                <select onChange={(e) => updateCourseFilter(e.target.value)}>
                    {makeCourseSelector()}
                </select>
                <select onChange={(e) => updateWeeksAgoFilter(e.target.value)}>
                    <option value = {0}>This Week</option>
                    <option value = {1}>Last Week</option>
                    <option value = {2}>Two Weeks Ago</option>
                    <option value = {-1}>Last Three Weeks (All)</option>
                </select>
            </div>
            <div>
                {weeksToDisplay.length > 0 && <DisplayWeeks data={weeksToDisplay} />}
            </div>
        </div>}
    </div>
    )
    )
});

export default Coaching