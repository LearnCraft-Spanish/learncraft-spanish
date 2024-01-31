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
        setFilterCoachless(argument)
    }

    function updateHoldFilter(argument) {
        setFilterHoldWeeks(argument)
    }

    function openMoreFilters () {
        openContextual('moreFilters')
    }

    function openCallPopup (recordId) {
        openContextual(`call${recordId}`)
    }

    function openAssignmentPopup (recordId) {
        openContextual(`assignment${recordId}`)
    }

    async function makeCoachList () {
        //console.log('getting userdata')
        try {
          const accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: audience,
              scope: "openid profile email read:current-student update:current-student read:all-students update:all-students",
            }
          });
          const coachList = await getCoachList(accessToken)
          .then((result) => {
            return result
          });
          return coachList;
        } catch (e) {
            console.log(e.message);
        }
    }

    async function makeCourseList () {
        //console.log('getting userdata')
        try {
          const accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: audience,
              scope: "openid profile email read:current-student update:current-student read:all-students update:all-students",
            }
          });
          const coachList = await getCourseList(accessToken)
          .then((result) => {
            return result
          });
          return coachList;
        } catch (e) {
            console.log(e.message);
        }
    }

    async function makeLessonList () {
        //console.log('getting userdata')
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
        //console.log('getting userdata')
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
        //console.log('getting userdata')
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
        //console.log('getting userdata')
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
            lessons.current = results[5]
            setStartupDataLoaded(true)
        })
    }

    function dateObjectToText (dateObject) {
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
        const coachUser = student.primaryCoach||{}
        const coach = coaches.current.find((coach) => coach.user.id === coachUser.id)||{}
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
        const groupAttendeeList = groupAttendees.current.filter((attendee)=> attendee.relatedStudent === weekId)
        return groupAttendeeList
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

    function makeCoachSelector () {
        const coachSelector = [<option key = {0} value = {0}>All Coaches</option>]
        coaches.current.forEach((coach)=>{
            coachSelector.push(<option key = {coach.recordId} value = {coach.recordId}> {coach.user.name}</option>)
        })
        return coachSelector
    }

    function makeCourseSelector () {
        const courseSelector = [<option key = {0} value = {0}>All Courses</option>]
        courses.current.forEach((course)=>{
            courseSelector.push(<option key = {course.recordId} value = {course.recordId}> {course.name}</option>)
        })
        return courseSelector
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

    function combinedFilterWeeks (weeks) {
        const filteredByCoachless = filterWeeksByCoachless(weeks)
        const filteredByWeeksAgo = filterWeeksByWeeksAgo(filteredByCoachless, filterByWeeksAgo)
        const filteredByCoach = filterWeeksByCoach(filteredByWeeksAgo, filterByCoach)
        const filteredByCourse = filterWeeksByCourse(filteredByCoach, filterByCourse)
        const filteredByOnHold = filterWeeksByOnHold(filteredByCourse)
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
        console.log(`Displaying ${filteredByOnHold.length} records`)
        return filteredByOnHold
    }
        
    const TableHeaderRow = () => {
        return <tr className="tableHeader">
            <th>Student</th>
            <th>Private Calls</th>
            <th>Group Calls</th>
            <th>Assignments</th>
            <th>Notes</th>
            <th>Lesson</th>
        </tr>;
    }

    const Calls = ({data}) => {
        if (data.length === 0) {
            return null
        } else {
            return data.map((call) => (
                <div key = {call.recordId}>
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

    const Assignments = ({data}) => {
        if (data.length === 0){
            return null
        } else {
            return data.map((assignment) => (
                <div key = {assignment.recordId}>
                    <button onClick={() => openAssignmentPopup(assignment.recordId)}>{assignment.assignmentType}: {assignment.rating}</button>
                    {contextual === `assignment${assignment.recordId}` && (
                        <div className="assignmentPopup" ref = {currentContextual}>
                            <h4>{assignment.assignmentType} by {getStudentFromMembershipId(getMembershipFromWeekId(assignment.relatedWeek).recordId).fullName}</h4>
                            <p>{assignment.date}</p>
                            {assignment.homeworkCorrector && <p>Corrected by {assignment.homeworkCorrector.name}</p>}
                            <p>Rating: {assignment.rating}</p>
                            <p>Notes: {assignment.notes}</p>
                            <p>Areas of Difficulty: {assignment.areasOfDifficulty}</p>
                            {(assignment.assignmentLink.length > 0) && <a target= {"_blank"} href={assignment.assignmentLink}>Assignment Link</a>}
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
                    <strong>{getStudentFromMembershipId(item.relatedMembership).fullName}</strong><br />
                    {getStudentFromMembershipId(item.relatedMembership).email}<br />
                    {(!filterByCourse.recordId) && (getCourseFromMembershipId(item.relatedMembership)?getCourseFromMembershipId(item.relatedMembership).name:"No Course")}
                    {(!filterByCourse.recordId) &&<br />}
                    {(!filterByCoach.recordId) && (getCoachFromMembershipId(item.relatedMembership).user?getCoachFromMembershipId(item.relatedMembership).user.name:"No Coach")}
                    {(!filterByCoach.recordId) &&<br />}
                    {(filterByWeeksAgo < 0) && item.weekStarts}
                </td>
                <td><Calls data = {getPrivateCallsFromWeekId(item.recordId)}/></td>
                <td>{(getGroupSessionsFromWeekId(item.recordId).length > 0)?getGroupSessionsFromWeekId(item.recordId).length:null}</td>
                <td><Assignments data = {getAssignmentsFromWeekId(item.recordId)} /></td>
                <td>{item.notes}</td>
                <td>{getLessonFromRecordId(item.currentLesson).lessonName}</td>
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
        if (startupDataLoaded) {
            const coachUser = coaches.current.find((coach) => coach.user.email === userData.emailAddress)
            if (coachUser){
                updateCoachFilter(coachUser.recordId)
            }
            setWeeksToDisplay(combinedFilterWeeks(weekRecords.current))
        }
    }, [startupDataLoaded, filterByCoach, filterByCourse, filterByWeeksAgo, filterCoachless, filterHoldWeeks])


    return ((
    <div className="coaching">
        {!startupDataLoaded && <p>This section is still under construction</p>}
        {startupDataLoaded && <div>
            <div className="filterSection">
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
                <button onClick = {openMoreFilters}>More Filters</button>
                {(contextual === 'moreFilters') && <div className="moreFilters" ref={currentContextual}>
                    <select value = {filterCoachless} onChange={(e) => updateCoachlessFilter(e.target.value)}>
                        <option value={1}>Don't show students without coaches</option>
                        <option value={0}>Show students without coaches</option>
                    </select>
                    <select value = {filterHoldWeeks} onChange={(e) => updateHoldFilter(e.target.value)}>
                        <option value = {1}>Don't show weeks on hold</option>
                        <option value={0}>Show weeks on hold</option>
                    </select>
                    <div className="buttonBox">
                        <button className = 'redButton' onClick={closeContextual}>Close</button>
                    </div>
                </div>}
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