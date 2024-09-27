import data from './mockBackendData.json' with { type: 'json' }

const audioExamplesTable = data.api.verifiedExamplesTable.filter(example => example.englishAudio)
console.log(JSON.stringify(audioExamplesTable))
export default audioExamplesTable
