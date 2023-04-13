const oldBackendUrl = 'lol'
const backendUrl = process.env.REACT_APP_BACKEND_URL;
//console.log(backendUrl);

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

export async function getLcspQuizzesFromBackend(token) {
    let fetchUrl = `${backendUrl}public/lcspQuizExamples`
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
        }
    })
    .catch(err => console.log(err))
    
    return tableFromBackend;
}

export async function getMyStudentExamplesFromBackend(token) {
    let fetchUrl = `${backendUrl}my-student-examples`

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

export async function updateStudentExample(token, updateId, reviewDate, newInterval) {
    const headers = {Authorization: `Bearer ${token}`, updateId: updateId, reviewDate: reviewDate, newInterval: newInterval}
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