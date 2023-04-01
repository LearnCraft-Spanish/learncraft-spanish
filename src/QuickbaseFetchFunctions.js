import { qb } from './QuickbaseTablesInfo';
// These are all the functions needed to access the data on the quickbase database
// These get called whenever a page needs to retrieve, update, or create data on quickbase
// Every request to quickbase requires a header & a body, so there are functions dedicated to just creating the header or the body

// creates headers needed for querying data from quickbase
// this is pretty much the same for each quickbase request
function createHeaders(userToken) {
    const headers = {
        'QB-Realm-Hostname': 'masterofmemory.quickbase.com',
        'User-Agent': 'NickApp',
        'Authorization': userToken,
        'Content-Type': 'application/json'
    }
    return headers
}

// creates body needed for querying data from quickbase
// (if there's ever a case where the tables has more columns than 25, the "select" array will need to be increased)
function createBody(tableID) {
    return {
        "from": tableID,
        "select": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],
    }
}

// go thru each row of fields & print (mainly used for testing)  
function printFields(json) { 
    console.log('Fields', json.fields)
}

// camelizes string and also removes special characters like #
// for ex: converts 'Record ID#' to 'recordId', 'word/idiom' to 'wordIdiom', 'spanglish?' to 'spanglish'
function camelize(str) {
    const strArr = str.replaceAll(/[^\w\s]/gi, ' ')
    const strArr2 = strArr.split(' ')
    const camelArr = strArr2.map((word, index) => index === 0 ? word.toLowerCase(): word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    return camelArr.join('')
}

// creates object that maps fieldNames to their corresponding numbers on quickbase database
// essentially linking the fields names to the number they are associated with on quickbase
function createFieldsJSON(fieldNames, jsonFields) {
    const newArr = fieldNames.map(fieldName => {
        return {
            name: camelize(fieldName),
            number: jsonFields.find(element => element.label.toLowerCase() === fieldName.toLowerCase()).id
        }
    })
    //console.log('createFieldsJSON: ', newArr)
    return newArr
}
// old version, only worked with vocab
function createTable(data, linksArr) {
    //console.log('creatTable')
    return data.map(element => {
        const stringedJSON = '{' +  linksArr.map(link => { return ('\"' + link.name + '\"' + ':' + '\"' + element[link.number].value.replaceAll('"', '\\\"') + '\"')}).join(', ') + '}'
        //console.log('stringedJSON: ', stringedJSON)
        const parsedJSON = JSON.parse(stringedJSON)
        
        //console.log('parsedJSON: ', parsedJSON)
        return parsedJSON
    })
}
// new improved version that differentiates btwn array & string
// creates the table object from the quickbase table
function createTable2(data, linksArr) {
    //console.log('creatTable')
    return data.map(element => {
        const stringedJSON = '{' +  linksArr.map(link => { return ('\"' + link.name + '\"' + ':' + null)}).join(', ') + '}'
        //console.log('stringedJSON: ', stringedJSON)
        const parsedJSON = JSON.parse(stringedJSON)
        
        //console.log('parsedJSON: ', parsedJSON)
        linksArr.forEach(link => {
            parsedJSON[link.name] = element[link.number].value
        });
        //console.log('parsedJSON2: ', parsedJSON)
        return parsedJSON
    })
}

// creates & returns tables object, which is what all the pages, like Example Retriever, use to get data from
export async function fetchAndCreateTable(userToken, tableInitInfo) {
    try {
        const res = await fetch('https://api.quickbase.com/v1/records/query',
        {
        method: 'POST',
        headers: createHeaders(userToken),
        body: JSON.stringify(createBody(tableInitInfo.id))
        })
        if(res.ok) {
            // if database is ASCII
            const buffer = await res.arrayBuffer()
            const decoder = new TextDecoder('ASCII')
            const text = decoder.decode(buffer)
            const json = JSON.parse(text)

            //console.log('json: ', json)

            printFields(json) // don't delete

            const linkedFieldsToNumsArr = createFieldsJSON(tableInitInfo.fields, json.fields)
            const tableArr = createTable2(json.data, linkedFieldsToNumsArr)
            return tableArr
        }
    } catch (err) {
        console.log(err)
    }
}

// test func
function createBodyForUpdateTest(tableID) {
    return {
        "to": tableID,
        "data": [
            {
                "3": { "value": "3" },
                "7": { "value": "5"}
            }
        ],
        "fieldsToReturn": [3, 6, 7, 8, 9]
    }
}

// test func
export async function testUpdate(userToken, tableInitInfo) {
    try {
        const res = await fetch('https://api.quickbase.com/v1/records',
        {
        method: 'POST',
        headers: createHeaders(userToken),
        body: JSON.stringify(createBodyForUpdateTest(tableInitInfo.id))
        })
        if(res.ok) {
            return res.json().then(res => console.log(res))
        }
        return res.json().then(resBody => Promise.reject({status: res.status, ...resBody}))
    } catch (err) {
        console.log(err)
    }
}

// 3: RecordID
// 6: Last Review Date
// 7: Review Interval
// This is a COPY/PASTE/EDIT of createBody()
// but is used for updating data on Student Examples table, instead of just retrieving data
// called by updateStudentExample()
function createBodyForUpdateStudentExample(recordID, lastReviewDate, reviewInterval, tableID) {
    return {
        "to": tableID,
        "data": [
            {
                "3": { "value": recordID },
                "6": { "value": lastReviewDate },
                "7": { "value": reviewInterval }
            }
        ],
        "fieldsToReturn": [3, 6, 7, 8, 9]
    }
}

// This is a COPY/PASTE/EDIT of createBody()
// but is used for creating data on Student Examples table, instead of just retrieving data
// called by createStudentExample()
function createBodyForCreateStudentExample(exampleID, studentID, lastReviewDate, reviewInterval, tableID) {
    return {
        "to": tableID,
        "data": [
            {
                //"3": { "value": recordID },
                "6": { "value": lastReviewDate },
                "7": { "value": reviewInterval },
                "8": { "value": studentID },
                "9": { "value": exampleID }
            }
        ],
        "fieldsToReturn": [3, 6, 7, 8, 9]
    }
}



// This is a COPY/PASTE/EDIT of fetchAndCreateTable()
// used by the SRS Quiz interface to update the review interval when user rates example
export async function updateStudentExample(recordID, lastReviewDate, reviewInterval, userToken) {
    try {
        const res = await fetch('https://api.quickbase.com/v1/records',
        {
        method: 'POST',
        headers: createHeaders(userToken),
        body: JSON.stringify(createBodyForUpdateStudentExample(recordID, lastReviewDate, reviewInterval, qb.studentExamples.id))
        })
        if(res.ok) {
            //return res.json().then(res => console.log(res))
            return res.json().then(res => Promise.resolve(res))
        }
        return res.json().then(resBody => Promise.reject({status: res.status, ...resBody}))
    } catch (err) {
        console.log(err)
    }
}

// This is a COPY/PASTE/EDIT of fetchAndCreateTable()
// used by the SRSBuilder.js, to add examples to the student examples table that will be used for the corresponding student in the SRS quiz interface.
export async function createStudentExample(exampleID, studentID, lastReviewDate, reviewInterval, userToken) {
    try {
        const res = await fetch('https://api.quickbase.com/v1/records',
        {
        method: 'POST',
        headers: createHeaders(userToken),
        body: JSON.stringify(createBodyForCreateStudentExample(exampleID, studentID, lastReviewDate, reviewInterval, qb.studentExamples.id))
        })
        if(res.ok) {
            //return res.json().then(res => console.log(res))
            return res.json().then(res => Promise.resolve(res))
        }
        return res.json().then(resBody => Promise.reject({status: res.status, ...resBody}))
    } catch (err) {
        console.log(err)
    }
}

//const backendUrl = 'http://localhost:8000/'
const oldBackendUrl = 'https://as-vocab-backend.herokuapp.com/'
const backendUrl = 'https://lcs-api.herokuapp.com/'

export async function getVocabFromBackend() {
    let fetchUrl = `${oldBackendUrl}qb-vocabulary`

    //console.log(`Fetching ${fetchUrl}`)

    const tableFromBackend = await fetch(fetchUrl,{method:'GET'})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                function sortFunction (a,b){
                    if(a.frequencyRank > b.frequencyRank){
                        return 1;
                    }
                    if(a.frequencyRank < b.frequencyRank){
                        return -1;
                    }
                    return 0
                }
                const data = JSON.parse(res);
                data.sort(sortFunction);
                //console.log(data);
                return data;
            }) 
        }
        
    })
    .catch(err => console.log(err))

    return tableFromBackend
    
}

export async function getLessonsFromBackend() {
    let fetchUrl = `${oldBackendUrl}qb-lessons`

    //console.log(`Fetching ${fetchUrl}`)

    const tableFromBackend = await fetch(fetchUrl,{method:'GET'})
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
                const data = JSON.parse(res);
                data.sort(sortFunction);
                //console.log(data);
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    
    return tableFromBackend;
}

export async function getStudentsFromBackend() {
    let fetchUrl = `${oldBackendUrl}qb-students`

    //console.log(`Fetching ${fetchUrl}`)

    const tableFromBackend = await fetch(fetchUrl,{method:'GET'})
    .then((res) => {
        if(res.ok){
            return res.json().then((res) => {
                const data = JSON.parse(res);
                //data.sort(sortFunction);
                return data;
            }) 
        }
    })
    .catch(err => console.log(err))
    
    return tableFromBackend;
}

export async function getUserDataFromBackend(studentID, token) {//actually currently email address – FIX THIS
    let fetchUrl = `${backendUrl}public/${studentID}`//actually currently email address – FIX THIS

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

export async function getStudentExamplesFromBackend(studentID, token) {
    let fetchUrl = `${backendUrl}public/${studentID}/student-examples`

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

export async function getExamplesFromBackend(studentID, token) {
    let fetchUrl = `${backendUrl}public/${studentID}/examples`

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