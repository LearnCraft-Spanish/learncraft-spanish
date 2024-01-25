import React, { useState, useRef, useEffect } from "react";
import LessonSelector from "./LessonSelector";
import { getVocabFromBackend, getSpellingsFromBackend, getCoachList, getLastThreeWeeks, getActiveMemberships, getActiveStudents, getLessonList, getCourseList } from "./BackendFetchFunctions";
import { useAuth0 } from "@auth0/auth0-react";

export default function Coaching () {
    const { user, isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
    const audience = process.env.REACT_APP_API_AUDIENCE
    const [weeksToDisplay, setWeeksToDisplay] = useState([])
    const [startupDataLoaded, setStartupDataLoaded] = useState(false)
    const [filterByUser, setFilterByUser] = useState({})
    const [filterByCourse, setFilterByCourse] = useState({})
    const [filterByWeek, setFilterByWeek] = useState({})
    const [filterOrder, setFilterOrder] = useState(['user', 'course', 'week'])
    const [searchTerm, setSearchTerm] = useState('')
    const rendered = useRef(false)
    const students = useRef([])
    const memberships = useRef([])
    const weekRecords = useRef([])
    const coaches = useRef([])
    const courses = useRef([])
    const lessons = useRef([])
  
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
          console.log(coachList)
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
          console.log(coachList)
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
          const coachList = await getLessonList(accessToken)
          .then((result) => {
            return result
          });
          console.log(coachList)
          return coachList;
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
            console.log(studentRecords)
            return studentRecords;
            } catch (e) {
                console.log(e.message);
            }
    }

    async function getStudents () {
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
            console.log(studentRecords)
            return studentRecords;
            } catch (e) {
                console.log(e.message);
            }
    }

    async function getMemberships () {
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
            console.log(studentRecords)
            return studentRecords;
            } catch (e) {
                console.log(e.message);
            }
    }

    async function loadStartupData () {
        const studentsPromise = getStudents()
        const membershipsPromise = getMemberships()
        const weekRecordsPromise = getThreeWeeksOfRecords()
        const coachesPromise = makeCoachList()
        const coursesPromise = makeCourseList()
        const lessonsPromise = makeLessonList()
        Promise.all([studentsPromise, membershipsPromise, weekRecordsPromise, coachesPromise, coursesPromise, lessonsPromise]).then((results) => {
            students.current = results[0]
            memberships.current = results[1]
            weekRecords.current = results[2]
            coaches.current = results[3]
            courses.current = results[4]
            lessons.current = results[5]
            setStartupDataLoaded(true)
            filterWeekRecordsByThisWeek(weekRecords.current)
            filterWeekRecordsByLastWeek(weekRecords.current)
            filterWeekRecordsByTwoWeeksAgo(weekRecords.current)
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

    function filterWeekRecordsByThisWeek(array) {
        const nowString = Date.now()
        const now = new Date(nowString)
        const dayOfWeek = now.getDay()
        const sundayString = now - (dayOfWeek * 86400000)
        const sunday = new Date(sundayString)
        const sundayText = dateObjectToText(sunday)
        console.log(sundayText)
        function filterFunction (weekRecord) {
            if (weekRecord.weekStarts === sundayText) {
                return true
            } else {
                return false
            }
        }
        const thisWeekRecords = array.filter(filterFunction)
        console.log(thisWeekRecords.length)
        return thisWeekRecords
    }

    function filterWeekRecordsByLastWeek(array) {
        const nowString = Date.now()
        const now = new Date(nowString)
        const dayOfWeek = now.getDay()
        const sundayString = now - (dayOfWeek * 86400000) - 604800000
        const sunday = new Date(sundayString)
        const sundayText = dateObjectToText(sunday)
        console.log(sundayText)
        function filterFunction (weekRecord) {
            if (weekRecord.weekStarts === sundayText) {
                return true
            } else {
                return false
            }
        }
        const thisWeekRecords = array.filter(filterFunction)
        console.log(thisWeekRecords.length)
        return thisWeekRecords
    }

    function filterWeekRecordsByTwoWeeksAgo(array) {
        const nowString = Date.now()
        const now = new Date(nowString)
        const dayOfWeek = now.getDay()
        const sundayString = now - (dayOfWeek * 86400000) - 1209600000
        const sunday = new Date(sundayString)
        const sundayText = dateObjectToText(sunday)
        console.log(sundayText)
        function filterFunction (weekRecord) {
            if (weekRecord.weekStarts === sundayText) {
                return true
            } else {
                return false
            }
        }
        const thisWeekRecords = array.filter(filterFunction)
        console.log(thisWeekRecords.length)
        return thisWeekRecords
    }

    function getFullNameFromMembershipId (membershipId) {
        const membership = memberships.current.find((item) => item.recordId === membershipId)
        const studentId = membership.relatedStudent
        const student = students.current.find((item)=> item.recordId === studentId)
        const studentName = student.fullName
        return studentName
    }

    function displayWeeks () {
        console.log(weeksToDisplay)
        const weekDisplay = weeksToDisplay.map((item) => {
            return (
            <div key = {item.recordId}>
                <h3>{getFullNameFromMembershipId(item.relatedMembership)}</h3>
                <p>{item.week}</p>
                <p>{item.notes}</p>
                <p>{item.weekStarts}</p>
            </div>)
        })
        return weekDisplay
    }

    useEffect(() => {
        if (!rendered.current){
            rendered.current = true
            loadStartupData()
        }
    }, [])

    useEffect(() => {
        if (startupDataLoaded) {
            setWeeksToDisplay([weekRecords.current[0]])
        }
    }, [startupDataLoaded])


    return ((
    <div className="coaching">
        {!startupDataLoaded && <p>This section is still under construction</p>}
        {startupDataLoaded && <div>
            <p>Students: {students.current.length}</p>    
            <p>Memberships: {memberships.current.length}</p>    
            <p>Weeks: {weekRecords.current.length}</p>    
            <p>Coaches: {coaches.current.length}</p>    
            <p>Courses: {courses.current.length}</p>    
            <p>Lessons: {lessons.current.length}</p>    
            <div>
                {weeksToDisplay.length > 0 && displayWeeks()}
            </div>
        </div>}
    </div>
    )
    )
};