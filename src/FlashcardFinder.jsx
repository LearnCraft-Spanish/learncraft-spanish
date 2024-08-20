import React, { forwardRef, useEffect, useRef, useState } from 'react'

import {
  getVerifiedExamplesFromBackend,
  getVocabFromBackend,
} from './functions/BackendFetchFunctions'

import { formatSpanishText } from './functions/formatFlashcardText'

import './App.css'

import LessonSelector from './LessonSelector'

// This script displays the Database Tool (Example Retriever), where coaches can lookup example sentences on the database by vocab word
const FlashcardFinder = forwardRef(
  (
    {
      activeStudent,
      programTable,
      getAccessToken,
      studentExamplesTable,
      flashcardDataComplete,
      selectedProgram,
      selectedLesson,
      updateSelectedProgram,
      updateSelectedLesson,
      addToActiveStudentFlashcards,
      contextual,
      openContextual,
    },
    currentContextual,
  ) => {
    const isMounted = useRef(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [tagSearchTerm, setTagSearchTerm] = useState('')
    const [vocabularyTable, setVocabularyTable] = useState([])
    const [tagTable, setTagTable] = useState([])
    const [suggestedTags, setSuggestedTags] = useState([])
    const [requiredTags, setRequiredTags] = useState([])
    const [exampleTable, setExampleTable] = useState([])
    const [noSpanglish, setNoSpanglish] = useState(false)
    const [displayExamples, setDisplayExamples] = useState([])

    function filterByHasAudio(example) {
      if (example.spanishAudioLa) {
        if (example.spanishAudioLa.length > 0) {
          return true
        }
        return false
      }
      return false
    }

    const displayExamplesWithAudio = displayExamples.filter(filterByHasAudio)

    function toggleSpanglish() {
      if (noSpanglish) {
        setNoSpanglish(false)
      }
      else {
        setNoSpanglish(true)
      }
    }

    function updateTagSearchTerm(target) {
      openContextual('tagSuggestionBox')
      setTagSearchTerm(target.value)
    }

    function addTagToRequiredTags(id) {
      const tagObject = tagTable.find(object => object.id === id)
      if (!requiredTags.find(tag => tag.id === id)) {
        const newRequiredTags = [...requiredTags]
        newRequiredTags.push(tagObject)
        setRequiredTags(newRequiredTags)
      }
    }

    function removeTagFromRequiredTags(id) {
      const newRequiredTags = requiredTags.filter(item => item.id !== id)
      setRequiredTags(newRequiredTags)
    }

    function filterExamplesByAllowedVocab(examples) {
      if (selectedLesson.vocabKnown) {
        const allowedVocab = selectedLesson.vocabKnown
        // console.log(allowedVocab)
        const filteredByAllowed = examples.filter((item) => {
          let isAllowed = true
          if (item.vocabIncluded.length === 0 || item.vocabComplete === false) {
            isAllowed = false
          }
          item.vocabIncluded.forEach((word) => {
            if (!allowedVocab.includes(word)) {
              isAllowed = false
            }
          })
          // console.log(`Item: ${item.vocabIncluded} Status: ${isAllowed}`)
          return isAllowed
        })
        return filteredByAllowed
      }
      else {
        return examples
      }
    }

    function labelAssignedExamples(examples) {
      examples.forEach((example) => {
        const assignedExample = studentExamplesTable.find(
          item => item.relatedExample === example.recordId,
        )
        if (assignedExample) {
          example.isAssigned = true
        }
        else {
          example.isAssigned = false
        }
      })
      return examples
    }

    function filterExamplesBySelectedTags(examples) {
      if (requiredTags.length > 0) {
        const filteredExamples = examples.filter((example) => {
          if (
            example.vocabIncluded.length === 0
            || example.vocabComplete === false
          ) {
            return false
          }
          // console.log(example.vocabIncluded)
          let isGood = false
          requiredTags.forEach((tag) => {
            // console.log(word.vocabName)
            if (!isGood) {
              switch (tag.type) {
                case 'subcategory':
                  example.vocabIncluded.forEach((item) => {
                    const word = vocabularyTable.find(
                      element => element.vocabName === item,
                    )
                    if (word.vocabularySubcategorySubcategoryName === tag.tag) {
                      isGood = true
                    }
                  })
                  break
                case 'verb':
                  example.vocabIncluded.forEach((item) => {
                    const word = vocabularyTable.find(
                      element => element.vocabName === item,
                    )
                    if (word.verbInfinitive === tag.tag) {
                      isGood = true
                    }
                  })
                  break
                case 'conjugation':
                  example.vocabIncluded.forEach((item) => {
                    const word = vocabularyTable.find(
                      element => element.vocabName === item,
                    )
                    word.conjugationTags.forEach((conjugationTag) => {
                      if (conjugationTag === tag.tag) {
                        isGood = true
                      }
                    })
                  })
                  break
                case 'vocabulary':
                  example.vocabIncluded.forEach((item) => {
                    const word = vocabularyTable.find(
                      element => element.vocabName === item,
                    )
                    if (word.wordIdiom === tag.tag) {
                      isGood = true
                    }
                  })
                  break
                case 'idiom':
                  example.vocabIncluded.forEach((item) => {
                    const word = vocabularyTable.find(
                      element => element.vocabName === item,
                    )
                    if (word.wordIdiom === tag.tag) {
                      isGood = true
                    }
                  })
                  break
              }
            }
          })
          return isGood
        })
        return filteredExamples
      }
      else {
        return examples
      }
    }

    function filterBySpanglish(examples) {
      if (noSpanglish) {
        const filteredBySpanglish = examples.filter((item) => {
          if (item.spanglish === 'esp') {
            return true
          }
          return false
        })
        return filteredBySpanglish
      }
      else {
        return examples
      }
    }

    function shuffleExamples(examples) {
      const shuffled = examples
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
      return shuffled
    }

    function makeExamplesTable() {
      const allExamples = [...exampleTable]
      const filteredBySpanglish = filterBySpanglish(allExamples)
      const filteredByAllowed
        = filterExamplesByAllowedVocab(filteredBySpanglish)
      const filteredByTags = filterExamplesBySelectedTags(filteredByAllowed)
      const labeledByAssigned = labelAssignedExamples(filteredByTags)
      const shuffledSentences = shuffleExamples(labeledByAssigned)
      // console.log(shuffledSentences)
      setDisplayExamples(shuffledSentences)
    }

    function displayExamplesTable() {
      const tableToDisplay = displayExamples.map(item => (
        <div className="exampleCard" key={item.recordId}>
          <div className="exampleCardSpanishText">
            <h3>{formatSpanishText(item.spanglish, item.spanishExample)}</h3>
          </div>
          <div className="exampleCardEnglishText">
            <h4>{item.englishTranslation}</h4>
          </div>
          {activeStudent.role === 'student' && !item.isAssigned && (
            <button
              type="button"
              className="addButton"
              value={item.recordId}
              onClick={e => addFlashcard(e.target.value)}
            >
              Add
            </button>
          )}
          {activeStudent.role === 'student' && item.isAssigned && (
            <button type="button" className="ownedButton" value={item.recordId}>
              Owned
            </button>
          )}
        </div>
      ))
      return tableToDisplay
    }

    // called when user clicks 'Copy as List' button
    // copies sentences in a list format with all english sentences first & then all spanish sentences
    // function copySentences() {
    //   const englishSentences = displayExamples
    //     .map(example => example.englishTranslation)
    //     .join('\n')
    //   const spanishSentences = displayExamples
    //     .map(example => example.spanishExample)
    //     .join('\n')
    //   //
    //   const copiedText = `${englishSentences}\n\n${spanishSentences}`
    //   navigator.clipboard.writeText(copiedText)
    // }

    // called when user clicks 'Copy as Table' button
    // copies sentences in a table format to be pasted into a google doc or excel sheet
    function copyTable() {
      const headers = 'ID\tSpanish\tEnglish\tAudio_Link\n'
      const table = displayExamples
        .map(
          example =>
            `${example.recordId}\t${example.spanishExample}\t${
              example.englishTranslation
            }\t${example.spanishAudioLa}`,
        )
        .join('\n')

      const copiedText = headers + table
      navigator.clipboard.writeText(copiedText)
    }

    function filterTagsByInput(tagInput) {
      function filterBySearch(tag) {
        const lowerTerm = tag.tag.toLowerCase()
        const lowerTagInput = tagInput.toLowerCase()
        if (lowerTerm.includes(lowerTagInput)) {
          return true
        }
        return false
      }

      function filterByActiveTags(tag) {
        const matchFound = requiredTags.find(item => item.id === tag.id)
        if (matchFound) {
          return false
        }
        return true
      }
      const filteredBySearch = tagTable.filter(filterBySearch)
      const filteredByActiveTags = filteredBySearch.filter(filterByActiveTags)
      const suggestTen = []
      for (let i = 0; i < 10; i++) {
        if (filteredByActiveTags[i]) {
          suggestTen.push(filteredByActiveTags[i])
        }
      }
      setSuggestedTags(suggestTen)
    }

    // function filterTagsByInput

    function sortVocab(a, b) {
      if (a.frequencyRank === b.frequencyRank) {
        if (!a.wordIdiom.includes(' ') && b.wordIdiom.includes(' ')) {
          return 1
        }
        else if (a.wordIdiom.includes(' ') && !b.wordIdiom.includes(' ')) {
          return -1
        }
      }
      else {
        return a.frequencyRank - b.frequencyRank
      }
    }

    async function getVocab() {
      try {
        const vocab = await getVocabFromBackend(getAccessToken()).then((result) => {
          // console.log(result)
          const usefulData = result
          return usefulData
        })
        const tags = []
        vocab.forEach((term) => {
          if (term.vocabularySubcategorySubcategoryName) {
            const subcatTag = {
              type: 'subcategory',
              tag: term.vocabularySubcategorySubcategoryName,
              id: tags.length,
            }
            if (
              !tags.find(
                item =>
                  item.type === 'subcategory'
                  && item.tag === term.vocabularySubcategorySubcategoryName,
              )
            ) {
              tags.push(subcatTag)
            }
          }
          if (term.verbInfinitive) {
            const infinitiveTag = {
              type: 'verb',
              tag: term.verbInfinitive,
              id: tags.length,
            }
            if (
              !tags.find(
                item =>
                  item.type === 'verb' && item.tag === term.verbInfinitive,
              )
            ) {
              tags.push(infinitiveTag)
            }
          }
          if (term.conjugationTags.length > 0) {
            term.conjugationTags.forEach((conjugation) => {
              const conjugationTag = {
                type: 'conjugation',
                tag: conjugation,
                id: tags.length,
              }
              if (
                !tags.find(
                  item =>
                    item.type === 'conjugation' && item.tag === conjugation,
                )
              ) {
                tags.push(conjugationTag)
              }
            })
          }
          if (term.wordIdiom) {
            if (
              term.vocabularySubcategorySubcategoryName
                .toLowerCase()
                .includes('idiom')
            ) {
              const idiomTag = {
                type: 'idiom',
                tag: term.wordIdiom,
                id: tags.length,
              }
              if (
                !tags.find(
                  item =>
                    item.type === 'idiom' && item.tag === term.wordIdiom,
                )
              ) {
                tags.push(idiomTag)
              }
            }
            else {
              const vocabTag = {
                type: 'vocabulary',
                tag: term.wordIdiom,
                id: tags.length,
              }
              if (
                !tags.find(
                  item =>
                    item.type === 'vocabulary' && item.tag === term.wordIdiom,
                )
              ) {
                tags.push(vocabTag)
              }
            }
          }
        })
        setTagTable(tags)
        return vocab.sort(sortVocab)
      }
      catch (e) {
        console.error(e.message)
      }
    }

    async function getExamples() {
      try {
        const examples = await getVerifiedExamplesFromBackend(getAccessToken()).then(
          result => result,
        )
        return examples
      }
      catch (e) {
        console.error(e.message)
      }
    }

    async function addFlashcard(exampleId) {
      const exampleToUpdate = exampleTable.find(
        example => example.recordId === Number.parseInt(exampleId),
      )
      exampleToUpdate.isAssigned = true
      addToActiveStudentFlashcards(exampleId, false).then((addResponse) => {
        if (addResponse !== 1) {
          exampleToUpdate.isAssigned = false
        }
      })
    }

    // called onced at the beginning
    useEffect(() => {
      async function startUp() {
        isMounted.current = true
        const getData = async () => {
          const vocabPromise = await getVocab()
          const examplePromise = await getExamples()
          setVocabularyTable(await vocabPromise)
          setExampleTable(await examplePromise)
        }
        getData()
      }
      if (!isMounted.current) {
        startUp()
      }
    }, [])

    useEffect(() => {
      if (!isLoaded) {
        if (
          vocabularyTable[0]
          && tagTable[0]
          && exampleTable[0]
          && programTable[0]
        ) {
          setIsLoaded(true)
          if (activeStudent.recordId) {
            const activeCourse = programTable.find(
              item => activeStudent.relatedProgram === item.recordId,
            )
            updateSelectedProgram(activeCourse.recordId)
          }
          makeExamplesTable()
          // console.log(programTable)
        }
        else {
          setIsLoaded(false)
        }
      }
    }, [vocabularyTable, tagTable, exampleTable, programTable])

    useEffect(() => {
      filterTagsByInput(tagSearchTerm)
    }, [tagSearchTerm, requiredTags, contextual])

    useEffect(() => {
      if (selectedProgram && selectedLesson && flashcardDataComplete) {
        makeExamplesTable()
      }
    }, [
      selectedProgram,
      selectedLesson,
      requiredTags,
      noSpanglish,
      studentExamplesTable,
      flashcardDataComplete,
    ])

    return (
      <div className="flashcardFinder">
        {!isLoaded && (
          <div>
            <h2>Loading Flashcard Data...</h2>
          </div>
        )}

        {isLoaded && (
          <div>
            <div className="flashcardFinderHeader">
              <h2>Flashcard Finder</h2>
              <div className="filterSection">
                <div className="filterBox">
                  <div className="removeSpanglishBox">
                    <h3>Spanglish</h3>
                    {!noSpanglish && (
                      <button
                        type="button"
                        style={{ backgroundColor: 'darkgreen' }}
                        onClick={toggleSpanglish}
                      >
                        Included
                      </button>
                    )}
                    {noSpanglish && (
                      <button
                        type="button"
                        style={{ backgroundColor: 'darkred' }}
                        onClick={toggleSpanglish}
                      >
                        Excluded
                      </button>
                    )}
                  </div>
                  <LessonSelector
                    programTable={programTable}
                    selectedLesson={selectedLesson}
                    updateSelectedLesson={updateSelectedLesson}
                    selectedProgram={selectedProgram}
                    updateSelectedProgram={updateSelectedProgram}
                  />
                </div>
                <div className="filterBox">
                  <div className="searchFilter">
                    <h3>Search</h3>
                    <div className="tagSearchBox">
                      <div className="searchTermBox">
                        <input
                          type="text"
                          onChange={e => updateTagSearchTerm(e.target)}
                          onClick={() => openContextual('tagSuggestionBox')}
                        />
                        <br></br>
                      </div>
                    </div>
                    {tagSearchTerm.length > 0
                    && contextual === 'tagSuggestionBox'
                    && suggestedTags.length > 0 && (
                      <div
                        className="tagSuggestionBox"
                        ref={currentContextual}
                      >
                        {suggestedTags.map(item => (
                          <div
                            key={item.tag}
                            value={item.id}
                            className="vocabCard"
                            onClick={() => addTagToRequiredTags(item.id)}
                          >
                            <h4 className="vocabName">{item.tag}</h4>
                            <p className="vocabUse">{item.type}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {requiredTags.length > 0 && (
                      <div className="selectedVocab">
                        <h5>Search Terms:</h5>
                        {requiredTags.map(item => (
                          <div
                            key={item.tag}
                            value={item.id}
                            className="vocabSmallCard"
                            onClick={() => removeTagFromRequiredTags(item.id)}
                          >
                            <h4 className="vocabName">{item.tag}</h4>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="examplesTable">
              <div className="buttonBox">
                <button type="button" onClick={copyTable}>Copy Table</button>
                <div className="displayExamplesDescription">
                  <h4>
                    {displayExamples.length}
                    {' '}
                    flashcards showing (
                    {displayExamplesWithAudio.length}
                    {' '}
                    with audio)
                  </h4>
                </div>
              </div>
              {displayExamplesTable()}
            </div>
          </div>
        )}
      </div>
    )
  },
)

export default FlashcardFinder
