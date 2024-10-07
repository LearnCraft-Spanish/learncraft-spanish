import data from './mockBackendData.json' with { type: 'json' }

const audioExamplesTable = data.api.verifiedExamplesTable.filter(
  example => example.englishAudio,
)
// eslint-disable-next-line no-console
console.log(JSON.stringify(audioExamplesTable))
export default audioExamplesTable
