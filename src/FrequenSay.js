import React, { useState, useRef, useEffect } from "react";
import LessonSelector from "./LessonSelector";
import { getVocabFromBackend } from "./BackendFetchFunctions";
import { useAuth0 } from "@auth0/auth0-react";

export default function FrequenSay ({activeStudent, programTable, selectedLesson, updateSelectedLesson, selectedProgram, updateSelectedProgram}) {
  const { isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect} = useAuth0();
  const [userInput, setUserInput] = useState("")
  const [vocabularyTable, setVocabularyTable] = useState([])
  const [unknownWordCount, setUnknownWordCount] = useState([])
  const [acceptableWordSpellings, setAcceptableWordSpellings] = useState([])
  const wordCount = useRef([])
  const rendered = useRef(false)
  const audience = process.env.REACT_APP_API_AUDIENCE

  function sortVocab (a, b) {
    if (a.frequencyRank===b.frequencyRank){
        if (!a.wordIdiom.includes(" ") && b.wordIdiom.includes(" ")){
          return 1;
        } else if (a.wordIdiom.includes(" ") && !b.wordIdiom.includes(" ")){
          return -1
        }
    } else {
      return a.frequencyRank - b.frequencyRank
    }
  }

  async function getVocab () {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: audience,
          scope: "openID email profile",
        },
      });
      //console.log(accessToken)
      const vocab = await getVocabFromBackend(accessToken)
      .then((result) => {
        //console.log(result)
        const usefulData = result;
        return usefulData
      });
      return vocab.sort(sortVocab)
    } catch (e) {
        console.log(e.message);
    }
  }

  function updateUserInput (newInput) {
    const sanitizedArray = countVocabularyWords(newInput)
    setUserInput(newInput)
    wordCount.current = sanitizedArray
    return(sanitizedArray)
  }

  function countVocabularyWords (string) {
    const segmenter = new Intl.Segmenter([], { granularity: 'word' });
    const segmentedText = segmenter.segment(string);
    /*
    const allowedCharacters = 'abcdefghijklmnopqrstuvwxyzáéíóúüñ '
    let sanitizedString = ''
    let i = 0
    while (i < string.length) {
      const character = string[i].toLowerCase()
      if (allowedCharacters.includes(character)){
        sanitizedString += character
      }
      i++
    }
    */
    const sanitizedArray = [...segmentedText].filter(s => s.isWordLike).map(s => s.segment.toLowerCase());
    console.log(sanitizedArray)
    let u = 0
    const wordCount = []
    while (u < sanitizedArray.length) {
      const thisWord = sanitizedArray[u]
      const wordFound = wordCount.find(word => word.word===thisWord)
      if (wordFound) {
        wordFound.count++
      } else {
        wordCount.push({word: thisWord, count: 1 })
      }
      u++
    }
    wordCount.sort((a,b) => {return (b.count - a.count)})
    console.log(wordCount)
    return wordCount
  }

  function filterWordCountByUnknown () {
    function filterWordsByUnknown (word) {
      if (acceptableWordSpellings.includes(word.word)) {
        return false
      } else {
        return true
      }
    }
    const unknownWordCount = wordCount.current.filter(filterWordsByUnknown)
    setUnknownWordCount(unknownWordCount)
  }

  function getAcceptableWordSpellingsFromSelectedLesson () {
    if (selectedLesson.recordId){
      const acceptableSpellings = selectedLesson.vocabKnown.map(vocabName => {
        const vocabularyItem = vocabularyTable.find(item => item.vocabName === vocabName)
        if (vocabularyItem) {
          return vocabularyItem.wordIdiom
        }
      })
      return acceptableSpellings
    }
  }

  function makeUnknownWordList() {
    const tableToDisplay = unknownWordCount.map((item) => {
      return (<div className='exampleCard' key={item.word}>
        <div className='exampleCardSpanishText'>
          <h3>{item.word}</h3>
        </div>
        <div className='exampleCardEnglishText'>
          <h4>{item.count}</h4>
        </div>
      </div>)
      })
    return tableToDisplay
  }

  function copyTable() {
    const headers = 'Word\tCount\n'
    const table = unknownWordCount.map(word => {
        return word.word + '\t' + word.count
    }).join('\n')

    const copiedText = headers + table
    navigator.clipboard.writeText(copiedText)
  }

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
      async function setupVocabTable () {
        const vocab = getVocab()
        setVocabularyTable(await vocab)
      }
      setupVocabTable()
    }
  }, [])

  useEffect(() => {
    //console.log(vocabularyTable)
  }, [vocabularyTable])

  useEffect(() => {
    if (vocabularyTable.length > 0){
      const acceptableSpellings = getAcceptableWordSpellingsFromSelectedLesson()
      setAcceptableWordSpellings(acceptableSpellings)
    }
  }, [selectedLesson, vocabularyTable])

  useEffect(() => {
    if (selectedLesson) {
      if (selectedLesson.recordId) {
        filterWordCountByUnknown()
      }
    }
  }, [selectedLesson, vocabularyTable, userInput, acceptableWordSpellings])
  

  return ((
    <div className="frequensay">
        <h2>FrequenSay</h2>
        <LessonSelector programTable = {programTable} selectedLesson = {selectedLesson} updateSelectedLesson = {updateSelectedLesson} selectedProgram = {selectedProgram} updateSelectedProgram = {updateSelectedProgram} />
        <form onSubmit={e => (e.preventDefault)}>
            <textarea value={userInput} rows={12} cols={85} onChange={e => updateUserInput(e.target.value)}>
            </textarea>
        </form>
        {unknownWordCount.length && (<div>
          <div className="buttonBox">
            <button onClick={copyTable}>Copy Word List</button>
          </div>
          {makeUnknownWordList()}
        </div>)}
    </div>
  ))
};