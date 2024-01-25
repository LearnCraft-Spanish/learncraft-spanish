
const backendUrl = process.env.REACT_APP_BACKEND_URL;
//console.log(backendUrl);

export async function getProgramsFromBackend(token) {
    let fetchUrl = `${backendUrl}public/programs`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend; 
}

export async function getLessonsFromBackend(token) {
    let fetchUrl = `${backendUrl}public/lessons`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend; 
}

export async function getVocabFromBackend(token) {
    let fetchUrl = `${backendUrl}public/vocabulary`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend;
    
}

export async function getSpellingsFromBackend(token) {
    let fetchUrl = `${backendUrl}public/spellings`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend;
    
}

export async function getExamplesFromBackend(token) {
    let fetchUrl = `${backendUrl}public/examples`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend; 
}

export async function getVerifiedExamplesFromBackend(token) {
    let fetchUrl = `${backendUrl}public/verified-examples`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend; 
}

export async function getAudioExamplesFromBackend(token) {
    let fetchUrl = `${backendUrl}public/audio-examples`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend; 
}

export async function getLcspQuizzesFromBackend(token) {
    let fetchUrl = `${backendUrl}public/allQuizExamples`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend; 
}

export async function getAllUsersFromBackend(token) {
    let fetchUrl = `${backendUrl}all-students`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET',headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                function sortFunction (a,b){
                    if(a.sortReference > b.sortReference){
                        return 1;
                    }
                    if(a.sortReference < b.sortReference){
                        return -1;
                    }
                    return 0

                }
                const data = [res];
                data.sort(sortFunction);
                //console.log(data);
                return data;
            }) 
        } else if (res.status === '403') {
            console.log ('unauthorized')
        }
    })
    .catch(err => console.log(err))
    
    return tableFromBackend;
}

export async function getActiveExamplesFromBackend(token, studentId, studentEmail) {
    let fetchUrl = `${backendUrl}${studentId}/examples`
    //console.log(`Fetching ${fetchUrl}`)

    const tableFromBackend = await fetch(fetchUrl,{method:'GET',headers: {Authorization: `Bearer ${token}`, EmailAddress: studentEmail}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = [res];
                //console.log(data);
                return data;
            }) 
        } else if (res.status === '403') {
            console.log ('unauthorized')
        }
    })
    .catch(err => console.log(err))
    
    return tableFromBackend[0];
}



export async function getUserDataFromBackend(token) {
    let fetchUrl = `${backendUrl}my-data`
    //console.log(`Fetching ${fetchUrl}`)

    const tableFromBackend = await fetch(fetchUrl,{method:'GET',headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                function sortFunction (a,b){
                    if(a.sortReference > b.sortReference){
                        return 1;
                    }
                    if(a.sortReference < b.sortReference){
                        return -1;
                    }
                    return 0

                }
                const data = [res];
                data.sort(sortFunction);
                //console.log(data);
                return data;
            }) 
        } else if (res.status === '403') {
            console.log ('unauthorized')
        }
    })
    .catch(err => console.log(err))
    
    return tableFromBackend;
}

export async function getMyExamplesFromBackend(token) {
    let fetchUrl = `${backendUrl}my-examples`

    //console.log(`Fetching ${fetchUrl}`)

    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    
    return tableFromBackend;
}

export async function createMyStudentExample(token, exampleId) {
    const headers = {Authorization: `Bearer ${token}`, exampleid: exampleId}
    //console.log(headers)
    let fetchUrl = `${backendUrl}create-my-student-example`
    //console.log(`Fetching ${fetchUrl}`)
    const messageFromBackend = await fetch(fetchUrl,{method:'POST', headers: headers})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    
    return messageFromBackend;
}

export async function createStudentExample(token, studentId, exampleId) {
    const headers = {Authorization: `Bearer ${token}`, studentid: studentId, exampleid: exampleId}
    //console.log(headers)
    let fetchUrl = `${backendUrl}create-student-example`
    //console.log(`Fetching ${fetchUrl}`)
    const messageFromBackend = await fetch(fetchUrl,{method:'POST', headers: headers})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    
    return messageFromBackend;
}

export async function updateMyStudentExample(token, updateId, newInterval) {
    const headers = {Authorization: `Bearer ${token}`, updateId: updateId, newInterval: newInterval}
    //console.log(headers)
    let fetchUrl = `${backendUrl}update-my-student-example`
    //console.log(`Fetching ${fetchUrl}`)
    const messageFromBackend = await fetch(fetchUrl,{method:'POST', headers: headers})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    
    return messageFromBackend;
}

export async function updateStudentExample(token, updateId, newInterval) {
    const headers = {Authorization: `Bearer ${token}`, updateId: updateId, newInterval: newInterval}
    //console.log(headers)
    let fetchUrl = `${backendUrl}update-student-example`
    //console.log(`Fetching ${fetchUrl}`)
    const messageFromBackend = await fetch(fetchUrl,{method:'POST', headers: headers})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    
    return messageFromBackend;
}

export async function deleteMyStudentExample(token, recordId) {
    const headers = {Authorization: `Bearer ${token}`, deleteid: recordId}
    //console.log(headers)
    let fetchUrl = `${backendUrl}delete-my-student-example`
    //console.log(`Fetching ${fetchUrl}`)
    const messageFromBackend = await fetch(fetchUrl,{method:'DELETE', headers: headers})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                console.log(res)
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    
    return messageFromBackend;
}

export async function deleteStudentExample(token, recordId) {
    const headers = {Authorization: `Bearer ${token}`, deleteid: recordId}
    //console.log(headers)
    let fetchUrl = `${backendUrl}delete-student-example`
    //console.log(`Fetching ${fetchUrl}`)
    const messageFromBackend = await fetch(fetchUrl,{method:'DELETE', headers: headers})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                console.log(res)
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    
    return messageFromBackend;
}

export async function getCoachList(token) {
    let fetchUrl = `${backendUrl}coaching/coaches`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend; 
}

export async function getCourseList(token) {
    let fetchUrl = `${backendUrl}coaching/courses`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend; 
}

export async function getLessonList(token) {
    let fetchUrl = `${backendUrl}coaching/lessons`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend; 
}

export async function getActiveStudents(token) {
    let fetchUrl = `${backendUrl}coaching/active-students`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend; 
}

export async function getActiveMemberships(token) {
    let fetchUrl = `${backendUrl}coaching/active-memberships`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend; 
}

export async function getLastThreeWeeks(token) {
    let fetchUrl = `${backendUrl}coaching/last-three-weeks`
    //console.log(`Fetching ${fetchUrl}`)
    const tableFromBackend = await fetch(fetchUrl,{method:'GET', headers: {Authorization: `Bearer ${token}`}})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = res;
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    return tableFromBackend; 
}

