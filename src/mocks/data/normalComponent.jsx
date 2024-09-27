import { useBackend } from '../../hooks/useBackend'
import data from './quizExamplesTable.json'

// This is a helper component, only used to generate data for mockData

export default function DummyComponent() {
  const { getQuizExamplesFromBackend } = useBackend()

  // currently, gets quiz examples and outputs them to innerHTML
  async function getQuizExamplesHelperFunction() {
    // const data = await getMyExamplesFromBackend();
    // fs.writeFileSync('data.json', JSON.stringify(data));
    const p = document.getElementById('data')
    const quizExamplesTable = {}
    data.courses.forEach((course) => {
      quizExamplesTable[course.code] = []
      course.quizzes.forEach(async (quiz) => {
        const quizNicknameArray = quiz.quizNickname.split(' ')
        const examples = await getQuizExamplesFromBackend(quizNicknameArray[quizNicknameArray.length - 1])
        const finalExamples = []
        examples.forEach((example) => {
          const temp = { ...example, allStudents: [] }
          finalExamples.push(temp)
        })
        p.innerHTML += `"${course.code}, ${quizNicknameArray[quizNicknameArray.length - 1]}": ${JSON.stringify(finalExamples)},`
        quizExamplesTable[course.code].push(finalExamples)
      })
    })
  }

  function handleSubmit() {
    getQuizExamplesHelperFunction()
  }

  return (
    <div>
      <button type="button" onClick={() => handleSubmit()}>dummy</button>
      <p id="data"></p>
    </div>

  )
}
