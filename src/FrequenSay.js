import React, { useState, useRef, useEffect } from "react";
import LessonSelector from "./LessonSelector";
import { getVocabFromBackend, getSpellingsFromBackend } from "./BackendFetchFunctions";
import { useAuth0 } from "@auth0/auth0-react";

export default function FrequenSay ({activeStudent, programTable, selectedLesson, updateSelectedLesson, selectedProgram, updateSelectedProgram}) {
  const { isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect} = useAuth0();
  const [userInput, setUserInput] = useState("")
  const [userAddedVocabulary, setUserAddedVocabulary] = useState("")
  const [addManualVocabulary, setAddManualVocabulary] = useState(false)
  const [vocabularyTable, setVocabularyTable] = useState([])
  const [unknownWordCount, setUnknownWordCount] = useState([])
  const [acceptableWordSpellings, setAcceptableWordSpellings] = useState([])
  const passageLength = useRef(0)
  const comprehensionPercentage = useRef(0)
  const wordCount = useRef([])
  const extraAcceptableWords = useRef([])
  const rendered = useRef(false)
  const audience = process.env.REACT_APP_API_AUDIENCE

  function additionalVocab () {
    console.log('setting true')
    setAddManualVocabulary(true)
  }

  function noAdditionalVocab () {
    updateUserAddedVocabulary('')
    console.log('setting')
    setAddManualVocabulary(false)
  }
  
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

  async function getSpellings () {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: audience,
          scope: "openID email profile",
        },
      });
      //console.log(accessToken)
      const spellings = await getSpellingsFromBackend(accessToken)
      .then((result) => {
        //console.log(result)
        const usefulData = result;
        return usefulData
      });
      return spellings
    } catch (e) {
        console.log(e.message);
    }
  }

  async function getVocab () {
    try {
      const spellings = getSpellings()
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: audience,
          scope: "openID email profile",
        },
      });
      //console.log(accessToken)
      const vocab = await getVocabFromBackend(accessToken)
      .then(async (result) => {
        //console.log(result)
        const usefulData = result;
        await spellings
        .then ( result => {
          console.log(result)
          result.forEach(element => {
            const relatedVocab = usefulData.find(record => record.recordId === element.relatedWordIdiom)
            if (relatedVocab && relatedVocab.spellings){
              relatedVocab.spellings.push(element.spellingOption)
            } else if (relatedVocab) {
              relatedVocab.spellings = [element.spellingOption]
            }
          });
        })
        return usefulData
      });
      vocab.sort(sortVocab)
      console.log(vocab)
      return vocab
    } catch (e) {
        console.log(e.message);
    }
  }

  function updateUserInput (newInput) {
    const vocabWordCount = countVocabularyWords(newInput)
    const uniqueWordsWithCounts = vocabWordCount[0]
    const totalWordCount = vocabWordCount[1]
    setUserInput(newInput)
    wordCount.current = uniqueWordsWithCounts
    passageLength.current = totalWordCount
    return(vocabWordCount)
  }

  function updateUserAddedVocabulary (newInput) {
    const vocabWordCount = countVocabularyWords(newInput)
    const uniqueWordsWithCounts = vocabWordCount[0]
    const totalWordCount = vocabWordCount[1]
    setUserAddedVocabulary(newInput)
    extraAcceptableWords.current = uniqueWordsWithCounts
    return(uniqueWordsWithCounts)
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
    let u = 0
    const wordCount = []
    while (u < sanitizedArray.length) {
      const thisWord = sanitizedArray[u]
      const wordFound = wordCount.find(word => word.word===thisWord)
      if (wordFound) {
        wordFound.count++
      } else  if (Number.isNaN(parseFloat(thisWord))) {
        wordCount.push({word: thisWord, count: 1 })
      }
      u++
    }
    wordCount.sort((a,b) => {return (b.count - a.count)})
    return [wordCount, sanitizedArray.length]
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
    let totalWordsUnknown = 0
    unknownWordCount.forEach(count => {
      totalWordsUnknown += count.count
    })
    comprehensionPercentage.current = passageLength.current > 0?100-Math.floor(totalWordsUnknown/passageLength.current*100):100
    setUnknownWordCount(unknownWordCount)
  }

  function getAcceptableWordSpellingsFromSelectedLesson () {
    const acceptableSpellings = []
    if (selectedLesson.recordId){
      selectedLesson.vocabKnown.forEach(vocabName => {
        const vocabularyItem = vocabularyTable.find(item => item.vocabName === vocabName)
        if (vocabularyItem) {
          vocabularyItem.spellings && vocabularyItem.spellings.forEach(word => {
            acceptableSpellings.push(word)
          })
        }
      })
    }
    return acceptableSpellings
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
      extraAcceptableWords.current.forEach(word => {
        acceptableSpellings.push(word.word)
      })
      setAcceptableWordSpellings(acceptableSpellings)
    }
  }, [selectedLesson, vocabularyTable, userAddedVocabulary])

  useEffect(() => {
    if (selectedLesson) {
      if (selectedLesson.recordId) {
        filterWordCountByUnknown()
      }
    }
  }, [selectedLesson, vocabularyTable, userInput, acceptableWordSpellings])

  useEffect (() => {
    console.log(addManualVocabulary)
  }, [addManualVocabulary])
  

  return ((
    <div className="frequensay">
        <h2>FrequenSay</h2>
        <LessonSelector programTable = {programTable} selectedLesson = {selectedLesson} updateSelectedLesson = {updateSelectedLesson} selectedProgram = {selectedProgram} updateSelectedProgram = {updateSelectedProgram} />
        <div className="buttonBox">
          {!addManualVocabulary && (<button className="greenButton" onClick={() => additionalVocab()}>Add Extra Vocabulary</button>)}
          {addManualVocabulary && (<button className="'redButton" onClick={() => noAdditionalVocab()}>Cancel Extra Vocabulary</button>)}
        </div>
        {addManualVocabulary && (<form onSubmit={e => (e.preventDefault)}>
            <textarea value={userAddedVocabulary} rows={7} cols={25} onChange={e => updateUserAddedVocabulary(e.target.value)}>
            </textarea>
        </form>)}
        <form onSubmit={e => (e.preventDefault)}>
            <textarea value={userInput} rows={12} cols={85} onChange={e => updateUserInput(e.target.value)}>
            </textarea>
        </form>
        <div>
          <p>Word Count: {passageLength.current}</p>
          <p>Words Known: {comprehensionPercentage.current}%</p>
        </div>
        {unknownWordCount.length && (<div>
          <h3>{unknownWordCount.length} Unknown Words:</h3>
          <div className="buttonBox">
            <button onClick={copyTable}>Copy Word List</button>
          </div>
          {makeUnknownWordList()}
        </div>)}
    </div>
  ))
};